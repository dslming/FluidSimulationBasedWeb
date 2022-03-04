import { RectRenderer } from './RectRenderer.js'
import { DoubleBufferTexture } from './DoubleBufferTexture.js'
import { SPHBucketMaterial } from './SPHBucketMaterial.js'
import { SPHDensityMaterial } from './SPHDensityMaterial.js'
import { SPHAccelMaterial } from './SPHAccelMaterial.js'
import { SPHVelocityMaterial } from './SPHVelocityMaterial.js'
import { SPHPositionMaterial } from './SPHPositionMaterial.js'
import { CopyDataToRenderTarget } from './CopyDataToRenderTarget.js'

var SPH = function(e, t, n, i, r, o, a, s) {
  this._setup = o,
    this._quality = s || SPH.Quality.LOW,
    this._volume = r,
    this._maxParticles = i,
    this._boxSize = new THREE.Vector3(e, t, n),
    this._restDensity = 998.29,
    this._particleMass = this._restDensity * r / this._maxParticles,
    this._smoothingRadius = Math.pow(3 * r * 20 / (4 * Math.PI * this._maxParticles), 1 / 3),
    this._cellSize = this._smoothingRadius / 2,
    this._particleRadius = .5 * Math.pow(3 * this._particleMass / (4 * Math.PI * this._restDensity), 1 / 3),
    this._restDistance = .1 * this._smoothingRadius,
    this._numCells = new THREE.Vector3(Math.ceil(e / this._cellSize), Math.ceil(t / this._cellSize), Math.ceil(n / this._cellSize)),
    this._halfExtent = this._boxSize.clone(),
    this._halfExtent.multiplyScalar(.5),
    this._halfExtent.x -= this._cellSize,
    this._halfExtent.y -= this._cellSize,
    this._halfExtent.z -= this._cellSize,
    this.viscosity = 3.5,
    this.stiffness = 3,
    this.surfaceTension = .0728,
    this.curvatureThreshold = 7.065,
    this.gravity = -9.81,
    this._numParticles = this._setup.getStartParticleCount(i),
    this._renderer = a,
    this._setup.collider.init(this, this._renderer),
    this._particleBufferSize = new THREE.Vector2(1024, Math.ceil(i / 1024)),
    this._bucketPixelSize = new THREE.Vector2(1 / (this._numCells.x * this._numCells.z), 1 / this._numCells.y),
    this._positionBuffer = new DoubleBufferTexture(this._particleBufferSize.x, this._particleBufferSize.y, this._rtOptions()),
    this._bucketBuffer = new THREE.WebGLRenderTarget(this._numCells.x * this._numCells.z, this._numCells.y, this._rtOptions(!0)),
    this._densityBuffer = new THREE.WebGLRenderTarget(this._particleBufferSize.x, this._particleBufferSize.y, this._rtOptions()),
    this._accelBuffer = new DoubleBufferTexture(this._particleBufferSize.x, this._particleBufferSize.y, this._rtOptions()),
    this._velocityBuffer = new DoubleBufferTexture(this._particleBufferSize.x, this._particleBufferSize.y, this._rtOptions()),
    this._bucketMaterial = new SPHBucketMaterial(this),
    this._densityMaterial = new SPHDensityMaterial(this),
    this._accelMaterial = new SPHAccelMaterial(this),
    this._velocityMaterial = new SPHVelocityMaterial(this),
    this._positionMaterial = new SPHPositionMaterial(this),
    this._pointGeometry = this._createPointGeometry(),
    this._renderPoints = new RectRenderer(a, new THREE.Points(this._pointGeometry)),
    this._renderRect = new RectRenderer(a),
    this._renderRect.clear(this._densityBuffer),
    this.reset()
}


SPH.Quality = {
    LOW: 1,
    HIGH: 2,
    EXTREME: 2
  },
  SPH.prototype = {
    get quality() {
      return this._quality
    },
    get halfExtent() {
      return this._halfExtent
    },
    get cellSize() {
      return this._cellSize
    },
    get numCells() {
      return this._numCells
    },
    get boxSize() {
      return this._boxSize
    },
    get restDensity() {
      return this._restDensity
    },
    get restDistance() {
      return this._restDistance
    },
    get particleMass() {
      return this._particleMass
    },
    get particleRadius() {
      return this._particleRadius
    },
    get smoothingRadius() {
      return this._smoothingRadius
    },
    get particleBufferSize() {
      return this._particleBufferSize
    },
    get bucketPixelSize() {
      return this._bucketPixelSize
    },
    get pointGeometry() {
      return this._pointGeometry
    },
    get positionBuffer() {
      return this._positionBuffer.source
    },
    get bucketBuffer() {
      return this._bucketBuffer.texture
    },
    get densityBuffer() {
      return this._densityBuffer.texture
    },
    get accelBuffer() {
      return this._accelBuffer.source
    },
    get velocityBuffer() {
      return this._velocityBuffer.source
    },
    get collisionBuffer() {
      return this._setup.collider.texture
    },
    get initVelocityGLSL() {
      return this._setup.getInitVelocityGLSL()
    },
    spawn: function(e) {
      this._numParticles += Math.floor(e),
        this._numParticles > this._maxParticles && (this._numParticles = this._maxParticles)
    },
    reset: function() {
      this._numParticles = 0,
        this._initParticles(),
        this._renderer.setClearColor(0, 1),
        this._renderRect.clear(this._accelBuffer.target),
        this._accelBuffer.swap(),
        this._renderRect.clear(this._accelBuffer.target),
        this._accelBuffer.swap(),
        this._renderRect.clear(this._velocityBuffer.target),
        this._velocityBuffer.swap()
    },
    _initParticles: function() {
      for (var e = new THREE.Vector3, t = [], n = 0; n < this._maxParticles; ++n)
        this._setup.initParticlePosition(n, this._maxParticles, this._halfExtent, e),
        t.push(e.x, e.y, e.z, n + 1);
      var i = this._particleBufferSize.x * this._particleBufferSize.y;
      for (n = this._maxParticles; n < i; ++n)
        t.push(0, 0, 0, n + 1);
      var r = new Float32Array(t);
      CopyDataToRenderTarget.execute(r, this._positionBuffer.target, this._renderer, THREE.FloatType),
        this._positionBuffer.swap()
    },
    _createPointGeometry: function() {
      for (var e = new THREE.BufferGeometry, t = [], n = [], i = [], r = this._particleBufferSize.x, o = this._particleBufferSize.y, a = 0; a < this._maxParticles; ++a) {
        var s = Math.floor(a / r),
          l = a - s * r;
        l = (l + .5) / r,
          s = (s + .5) / o,
          i.push(l, s),
          n.push(a),
          t.push(a)
      }
      return e.setIndex(new THREE.BufferAttribute(new Uint32Array(t), 1)),
        e.addAttribute("positionUV", new THREE.BufferAttribute(new Float32Array(i), 2)),
        e.addAttribute("particleIndex", new THREE.BufferAttribute(new Float32Array(n), 1)),
        e
    },
    update: function(e, t) {
      e *= .001,
        0 === e && (e = .01),
        this._pointGeometry.setDrawRange(0, this._numParticles),
        this._setup.collider.update(),
        t = 2 | t,
        e /= t;
      for (var n = 0; n < t; ++n)
        this._updateBucket(),
        this._updateDensity(),
        this._updateAccel(e),
        this._updateVelocity(e),
        this._updatePosition(e)
    },
    _updateBucket: function() {
      var e = this._renderer.context;
      this._bucketMaterial.positionBuffer = this._positionBuffer.source,
        this._bucketMaterial.numParticles = this._maxParticles,
        this._bucketMaterial.depthFunc = THREE.LessDepth;
      var t = this._renderer.state.buffers.stencil;
      t.setMask(255),
        t.setClear(0),
        t.setTest(!0),
        t.setOp(e.KEEP, e.KEEP, e.KEEP),
        t.setFunc(e.ALWAYS, 0, 255),
        this._renderer.setClearColor(0, 0),
        this._renderBucketPass(!0, !1, !1, !1, !0),
        t.setOp(e.KEEP, e.KEEP, e.INCR),
        t.setFunc(e.GREATER, 1, 255),
        this._bucketMaterial.depthFunc = THREE.GreaterDepth,
        this._renderBucketPass(!1, !0, !1, !1, !1),
        this._renderBucketPass(!1, !1, !0, !1, !1),
        this._renderBucketPass(!1, !1, !1, !0, !1),
        t.setTest(!1),
        t.setOp(e.KEEP, e.KEEP, e.KEEP),
        t.setFunc(e.ALWAYS, 0, 4294967295)
    },
    _renderBucketPass: function(e, t, n, i, r) {
      var o = this._renderer.state.buffers.color;
      this._renderer.clearTarget(this._bucketBuffer, r, r, !0),
        o.setMask(e, t, n, i),
        o.setLocked(!0),
        this._renderPoints.execute(this._bucketMaterial, this._bucketBuffer, !1),
        o.setLocked(!1)
    },
    _updateDensity: function() {
      this._densityMaterial.positionBuffer = this._positionBuffer.source,
        this._densityMaterial.bucketBuffer = this._bucketBuffer.texture,
        this._densityMaterial.particleMass = this.particleMass,
        this._renderRect.execute(this._densityMaterial, this._densityBuffer)
    },
    _updateAccel: function(e) {
      this._accelMaterial.positionBuffer = this._positionBuffer.source,
        this._accelMaterial.bucketBuffer = this._bucketBuffer.texture,
        this._accelMaterial.densityBuffer = this._densityBuffer.texture,
        this._accelMaterial.velocityBuffer = this._velocityBuffer.source,
        this._accelMaterial.restDensity = this.restDensity,
        this._accelMaterial.particleMass = this.particleMass,
        this._accelMaterial.viscosity = this.viscosity,
        this._accelMaterial.stiffness = this.stiffness,
        this._accelMaterial.gravity = this.gravity,
        this._accelMaterial.curvatureThreshold = this.curvatureThreshold,
        this._accelMaterial.surfaceTension = this.surfaceTension,
        this._accelMaterial.maxParticleIndex = this._numParticles + 1,
        this._accelMaterial.dt = e,
        this._renderRect.execute(this._accelMaterial, this._accelBuffer.target),
        this._accelBuffer.swap()
    },
    _updatePosition: function(e) {
      this._positionMaterial.positionBuffer = this._positionBuffer.source,
        this._positionMaterial.velocityBuffer = this._velocityBuffer.source,
        this._positionMaterial.accelBuffer = this._accelBuffer.source,
        this._positionMaterial.maxParticleIndex = this._numParticles + 1,
        this._positionMaterial.dt = e,
        this._renderRect.execute(this._positionMaterial, this._positionBuffer.target),
        this._positionBuffer.swap()
    },
    _updateVelocity: function(e) {
      this._velocityMaterial.positionBuffer = this._positionBuffer.source,
        this._velocityMaterial.velocityBuffer = this._velocityBuffer.source,
        this._velocityMaterial.accelBuffer1 = this._accelBuffer.source,
        this._velocityMaterial.accelBuffer2 = this._accelBuffer.target.texture,
        this._velocityMaterial.maxParticleIndex = this._numParticles + 1,
        this._velocityMaterial.dt = e,
        this._renderRect.execute(this._velocityMaterial, this._velocityBuffer.target),
        this._velocityBuffer.swap()
    },
    _rtOptions: function(e) {
      return {
        type: THREE.FloatType,
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        generateMipmaps: !1,
        depthBuffer: e || !1,
        stencilBuffer: e || !1,
        format: THREE.RGBAFormat
      }
    }
  }


export { SPH }
