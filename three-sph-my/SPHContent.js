import { SPHBallSetup } from './SPHBallSetup.js'
import { ParticleDepthRenderer } from './ParticleDepthRenderer.js'
import { SceneDepthRenderer } from './SceneDepthRenderer.js'
import { SPHDistanceFieldRenderer } from './SPHDistanceFieldRenderer.js'
import { OrbitController } from './OrbitController.js'
import { Entity } from './Entity.js'
import { Skybox } from './Skybox.js'
import { RenderVolumeMaterial } from './RenderVolumeMaterial.js'
import { VolumetricLightRenderer } from './VolumetricLightRenderer.js'
import { DielectricMaterial } from './DielectricMaterial.js'
import { SPH } from './SPH.js'

function SPHContent(e, t) {
  this._quality = t,
    this._mode = void 0 === e ? SPHContent.BALL_MODE : e
}
window.SPHContent = SPHContent;

SPHContent.BALL_MODE = 0,
  SPHContent.CASCADE_MODE = 1,
  SPHContent.prototype = {
    init: function(e) {
      this._numLightSamples = 8,
        this._numVolumeSamples = this._quality === SPH.Quality.HIGH ? 16 : 8,
        this._volume = 1,
        this._numParticles = this._quality === SPH.Quality.EXTREME ? 20480 : 10240,
        this._scene = e.scene,
        this._camera = e.camera,
        this._camera.far = 100,
        this._renderer = e.renderer,
        this._assetLibrary = e.assetLibrary,
        this._container = document.getElementById("webglcontainer");
      var t = this._renderer.extensions;
      if (!t.get("OES_texture_float_linear"))
        throw new Error("Float render targets are unsupported!");
      this._spawnRatio = .003,
        this._mode === SPHContent.BALL_MODE ? this._setup = new SPHBallSetup : this._mode === SPHContent.CASCADE_MODE && (this._setup = new SPHCascadeSetup(this._assetLibrary.get("cascademap")),
          this._spawnRatio = .001),
        this._sph = new SPH(2, 2, 2, this._numParticles, this._volume, this._setup, this._renderer, this._quality),
        this._mie = new THREE.Color((-.01), (-.01), (-.011)),
        this._mie.multiplyScalar(1.5),
        this._fluidAbsorption = new THREE.Color(25, 3, 2),
        this._mode === SPHContent.CASCADE_MODE && (this._fluidAbsorption = new THREE.Color(8, 25, 23),
          this._sph.viscosity = 50,
          this._sph.stiffness = 3,
          this._sph.surfaceTension = .25),
        this._fluidAbsorption.multiplyScalar(3),
        this._particleDepthRenderer = new ParticleDepthRenderer(this._scene, this._renderer, this._sph, .5),
        this._sceneDepthRenderer = new SceneDepthRenderer(this._scene, this._renderer, .5),
        this._distanceFieldRenderer = new SPHDistanceFieldRenderer(this._renderer, this._sph),
        this._initCameraController(),
        this._initScene(),
        this._dragging = !1,
        this._mode === SPHContent.BALL_MODE ? this._initCollider() : this._initTerrain()
    },
    _onMouseDown: function(e) {
      this._updateRaycaster(e.clientX, e.clientY);
      var t = this._rayCaster.intersectObject(this._blocker);
      t.length > 0 && (this._dragging = !0,
        this._cameraController.enabled = !1)
    },
    _onMouseUp: function(e) {
      this._dragging = !1,
        this._cameraController.enabled = !0
    },
    _onMouseMove: function(e) {
      if (this._dragging) {
        var t = this._blocker.position.y;
        this._updateRaycaster(e.clientX, e.clientY);
        var n = this._rayCaster.ray.origin,
          i = this._rayCaster.ray.direction,
          r = (t - n.y) / i.y;
        this._blocker.position.x = THREE.Math.clamp(n.x + r * i.x, -2, 2),
          this._blocker.position.z = THREE.Math.clamp(n.z + r * i.z, -2, 2)
      }
    },
    _updateRaycaster: function(e, t) {
      e = e / window.innerWidth * 2 - 1,
        t = -(t / window.innerHeight * 2 - 1),
        this._rayCaster.setFromCamera(new THREE.Vector2(e, t), this._camera)
    },
    start: function() {},
    destroy: function() {},
    resize: function(e, t) {
      this._particleDepthRenderer.resize(window.innerWidth, window.innerHeight),
        this._sceneDepthRenderer.resize(window.innerWidth, window.innerHeight),
        this._fluidMaterial.pixelSize.x = 1 / e,
        this._fluidMaterial.pixelSize.y = 1 / t
    },
    update: function(e) {
      this._camera.updateMatrixWorld(!0),
        this._sph.spawn(this._numParticles * this._spawnRatio),
        this._mode === SPHContent.BALL_MODE ? (this._setup.collider.spherePosition = this._blocker.position,
          this._sph.update(16)) : this._sph.update(8),
        this._fluidMesh.visible = !1,
        this._sky.visible = !1,
        this._mode === SPHContent.CASCADE_MODE && (this._blocker.visible = !1),
        this._particleDepthRenderer.render(this._camera),
        this._sceneDepthRenderer.render(this._camera),
        this._distanceFieldRenderer.render(),
        this._fluidMesh.visible = !0,
        this._sky.visible = !0,
        this._mode === SPHContent.CASCADE_MODE && (this._blocker.visible = !0),
        this._lightingRenderer.render(this._distanceFieldRenderer.texture, this._fluidMesh, this._camera),
        this._fluidMaterial.update(this._fluidMesh, this._camera, this._lightingRenderer.texture, this._particleDepthRenderer.texture, this._sceneDepthRenderer.texture)
    },
    _initCameraController: function() {
      var e = new OrbitController(document.getElementById("webglcontainer"));
      e.azimuth = .5 * Math.PI,
        e.radius = 3,
        e.minRadius = 1,
        e.maxRadius = 1e3,
        e.zoomSpeed = 5,
        e.lookAtTarget.y = -.5,
        e.maxPolar = .5 * Math.PI + .1,
        Entity.addComponent(this._camera, e),
        this._cameraController = e,
        this._mode === SPHContent.CASCADE_MODE && (e.maxAzimuth = .5 * Math.PI - .5,
          e.minAzimuth = .5 * -Math.PI + .5)
    },
    _addLight: function(e, t, n) {
      var i = new THREE.DirectionalLight;
      i.position.set(e, t, n),
        this._scene.add(i),
        i = new THREE.DirectionalLight,
        i.position.set(e, t, n),
        this._lightingRenderer.addLight(i)
    },
    _initScene: function() {
      var e = this._sph.boxSize,
        t = this._assetLibrary.get("skybox");
      this._sky = new Skybox(t, 50),
        this._scene.add(this._sky),
        this._fluidMaterial = new RenderVolumeMaterial(this._sph, t, this._numVolumeSamples),
        this._fluidMaterial.absorption = this._fluidAbsorption,
        this._fluidMaterial.mie = this._mie;
      var n = new THREE.BoxBufferGeometry(e.x, e.y, e.z);
      this._fluidMesh = new THREE.Mesh(n, this._fluidMaterial),
        this._scene.add(this._fluidMesh),
        this._lightingRenderer = new VolumetricLightRenderer(this._renderer, this._sph.numCells, this._sph.cellSize, this._numLightSamples, (!0), .5),
        this._lightingRenderer.absorption = this._fluidAbsorption,
        this._lightingRenderer.mie = this._mie,
        this._addLight(1, .3, 1)
    },
    _initCollider: function() {
      this._rayCaster = new THREE.Raycaster;
      var e = .15,
        t = new THREE.SphereBufferGeometry(e, 30, 20),
        n = new DielectricMaterial({
          color: 16777215,
          irradianceProbe: this._assetLibrary.get("irradiance"),
          roughness: .5
        });
      this._blocker = new THREE.Mesh(t, n),
        this._blocker.position.y = .5 * -this._sph.boxSize.y + e,
        this._scene.add(this._blocker),
        this._setup.collider.sphereRadius = e,
        document.addEventListener("mousedown", this._onMouseDown.bind(this)),
        document.addEventListener("mouseup", this._onMouseUp.bind(this)),
        document.addEventListener("mousemove", this._onMouseMove.bind(this))
    },
    _initTerrain: function() {
      var e = new THREE.PlaneBufferGeometry(this._sph.boxSize.x, this._sph.boxSize.z, 64, 64);
      e.rotateX(.5 * -Math.PI);
      var t = this._assetLibrary.get("cascademap");
      t.wrapS = THREE.ClampToEdgeWrapping,
        t.wrapT = THREE.ClampToEdgeWrapping;
      var n = new THREE.MeshStandardMaterial({
        displacementMap: t,
        displacementScale: this._sph.boxSize.y,
        displacementBias: .5 * -this._sph.boxSize.y,
        color: 0,
        wireframe: !0
      });
      this._blocker = new THREE.Mesh(e, n),
        this._scene.add(this._blocker)
    }
  }


export { SPHContent }
