import * as THREE from 'three';
import OrbitControls from '../utils/OrbitControls';

import WaterParticles from './WaterParticles';
import * as dat from 'dat.gui';
import Stats from 'stats.js';
import * as C from '../app/Constant.js';

// Set the scene size.
const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

// Set some camera attributes.
const VIEW_ANGLE = 45;
const ASPECT = WIDTH / HEIGHT;
const NEAR = 0.1;
const FAR = 1000;

// Set up the sphere vars
const RADIUS = 20;
const SEGMENTS = 16;
const RINGS = 16;


export default class Main {
  constructor(container) {
    // Set container property to container element
    this.container = container;

    // FUNCTIONS BIND
    this.update = this.update.bind(this);
    this.initGUI = this.initGUI.bind(this);
    this.pauseAnimation = this.pauseAnimation.bind(this);
    this.restartAnimation = this.restartAnimation.bind(this);
    this.initSky = this.initSky.bind(this);

    // Init the GUI
    this.initGUI();
    this.stats = new Stats();
    this.stats.showPanel( 0 );
    this.container.appendChild( this.stats.dom );

    // Main scene creation
    this.scene = new THREE.Scene();

    // Set up the loader
    this.loader = new THREE.TextureLoader()

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.camera = new THREE.PerspectiveCamera(
      VIEW_ANGLE,
      ASPECT,
      NEAR,
      FAR
    );
    this.camera.position.set( 100, 20, 0 );
    this.camera.lookAt( this.scene.position );

    // Add the camera to the scene.
    this.scene.add(this.camera);

    // TODO: HELPER
    var axesHelper = new THREE.AxesHelper( 100 );
    // this.scene.add( axesHelper );

    // Start the renderer.
    this.renderer.setSize(WIDTH, HEIGHT);

    // Attach the renderer-supplied DOM element.
    this.container.appendChild(this.renderer.domElement);

    // Init GPUCompute
    this.last = performance.now();

    // create a point light
    this.pointLight = new THREE.PointLight(0xFFFFFF);
    // set its position
    this.pointLight.position.x = 0;
    this.pointLight.position.y = 0;
    this.pointLight.position.z = 0;
    // add to the scene
    this.scene.add(this.pointLight);

    // Ambient light
    this.ambientlight = new THREE.AmbientLight( 0x404040 );
    this.scene.add( this.ambientlight );

    // create the particle variables
    this.WaterParticles = new WaterParticles(this.scene, this.renderer, [this.pointLight, this.ambientlight], this.params);

    // Bounds
    var planeGeometry = new THREE.PlaneBufferGeometry( 2*C.BOUNDS, 2*C.BOUNDS, 32 );
    var planeMaterial = new THREE.MeshBasicMaterial( {
      color: 0xcccccc,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5,
    } );

    var plane = new THREE.Mesh( planeGeometry, planeMaterial );
    plane.position.y = -C.BOUNDS - C.RADIUS / 2;
    plane.rotation.x = Math.PI * - 0.5;
    this.scene.add( plane );

    // Sky
    this.initSky();

    // Controls
    this.controls = new (new OrbitControls(THREE))( this.camera, this.renderer.domElement );

    this.pause = false;
    this.animationId = requestAnimationFrame(this.update);
  }

  initGUI() {
    this.gui = new dat.GUI();

    this.params = {
      GRAVITY: -9.8,
      WIND: false,
      REST_DENSITY: 5e-2,
      H: 5.0,
      VORTICITY_E: 1,
      VISCOCITY_C: 0.1,
      particleColor: 0x47E6FF,
      threeColor: new THREE.Color(0x47E6FF),
      pause: this.pauseAnimation,
      restart: this.restartAnimation,
      windSway: 1,
      windDirection: 1,
      windForm: 0,
    }
    this.swayTimer = 0;

    const folder1 = this.gui.addFolder('Fluid parameter');
    folder1.add(this.params, 'REST_DENSITY', 0, 10).name('Rest Density');
    folder1.add(this.params, 'H', 1.5 * C.RADIUS, 5*C.RADIUS).name('Kernel Distance (H)');
    folder1.add(this.params, 'VORTICITY_E', 0, 20).name('Vorticity Epsilon');
    folder1.add(this.params, 'VISCOCITY_C', 0, 2).name('Viscocity Constant');
    folder1.open();

    const folder2 = this.gui.addFolder('Force parameter');
    folder2.add(this.params, 'GRAVITY', -10, 0).name('Gravity');
    folder2.add(this.params, 'WIND').name('Add Wind');
    folder2.add(this.params, 'windSway', 0, 10).name('Wind magnitude');
    folder2.add(this.params, 'windForm', { Diagonal: 0, Circle: 1 }).name('Wind direction');
    folder2.open();

    const colorController = this.gui.addColor(this.params, 'particleColor');
    this.gui.add(this.params, 'pause');
    const restartController = this.gui.add(this.params, 'restart');

    // Handle events
    colorController.onFinishChange(function(value) {
      this.params.threeColor.setStyle('#' + value.toString(16));
    }.bind(this));
  }

  initSky() {
    this.scene.background = new THREE.CubeTextureLoader()
  	.setPath( './assets/img/' )
  	.load( [
  		'bluecloud_rt.jpg',
  		'bluecloud_lf.jpg',
  		'bluecloud_up.jpg',
  		'bluecloud_dn.jpg',
  		'bluecloud_bk.jpg',
  		'bluecloud_ft.jpg'
  	] );
  }

  pauseAnimation() {
    this.pause = !this.pause;
  }

  restartAnimation() {
    this.scene.remove(this.WaterParticles.particleGroup);
    this.WaterParticles.initParticles();
  }

  update () {
    // Draw!
    // this.controls.update();
    var now = performance.now();
    var delta = (now - this.last) / 1000;
    //if (delta > 1) delta = 1; // safety cap on large deltas

    this.last = now;

    if (!this.pause) {
      // Update wind sway
      if (this.params.WIND) {
        if (this.swayTimer > C.WIND_TIMER) {
          this.params.windDirection *= -1;
          this.swayTimer = 0;
        } else {
          this.swayTimer += delta;
        }
      }
      // Update water particle.
      this.WaterParticles.update(delta);
    }
    this.stats.update();

    this.renderer.render(this.scene, this.camera);

    // Schedule the next frame.
    this.animationId = requestAnimationFrame(this.update);
  }

}
