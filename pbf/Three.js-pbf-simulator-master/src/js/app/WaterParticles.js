import * as THREE from 'three';
import Particle from './Particle';
import GridMap from '../utils/GridMap';
import * as C from './Constant.js';

export default class WaterParticles {
  constructor(scene, renderer, lights, params) {
    this.scene = scene;
    this.renderer = renderer;
    this.lights = lights;
    this.params = params;
    // FUNCTIONS BIND
    this.update = this.update.bind(this);
    this.initParticles = this.initParticles.bind(this);

    // Initialize the particles.
    this.initParticles();
  }

  initParticles() {
    this.frame = 0;

    // Initialize the shader
    const vShader = $('#vertexshader');
    const fShader = $('#fragmentshader');

    const geometry = new THREE.SphereGeometry(C.RADIUS / 1.5, C.SEGMENTS, C.RINGS);

    this.particles = [];
    this.particleGroup = new THREE.Group();
    for (let i = 0; i < C.T_WIDTH; i++) {

      for (let j = 0; j < C.T_HEIGHT; j++) {
        const idx = i * C.T_HEIGHT + j;
        var x = idx % C.UNIT;
        var z = Math.floor(idx / C.UNIT) % C.UNIT;
        var y = parseInt(idx / (C.UNIT * C.UNIT), 10);

        x = x * C.RADIUS - C.XS / 2;
        y = C.YS - y * C.RADIUS;
        z = z * C.RADIUS - C.ZS / 2;

        const p = new Particle(
          x,
          y,
          z,
          geometry,
          vShader.text(),
          fShader.text(),
          i, j,
          this.params,
          this.lights
        );

        this.particles.push(p);

        this.particleGroup.add(p.mesh);
      }
    }
    this.scene.add( this.particleGroup );
    // Construct the grid map.
    this.gridMap = new GridMap(C.BOUNDS * 2, C.BOUNDS * 2, C.BOUNDS, this.params.H);
  }

  update(delta) {
    this.frame += 0.1;
    this.gridMap.clear();

    // Predict the future position based on force alone.
    this.particles.forEach((p) => {
      p.applyForce(delta, this.frame);
      // p.handleBounds();
      this.gridMap.add(p);
    });

    // Find neighbors for each particles.
    this.particles.forEach((p) => {
      this.gridMap.findNeighbors(p);
    });

    for (let i = 0; i < C.ITER; i++) {
      // Calculate lambda.
      this.particles.forEach((p) => p.calculateLambda());
      // // Calculate surface tension.
      this.particles.forEach((p) => p.calculateSurfaceTension());
    }

    // Update velocity
    this.particles.forEach((p) => {
      p.updateVelocity(delta);
      p.calculateVorticity(delta);
      p.calculateViscocity();
    });
  }
}
