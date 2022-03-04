import { ParticleBlurredRenderer } from './ParticleBlurredRenderer.js'
import { RectRenderer } from './RectRenderer.js'
import { ParticleDepthMaterial } from './ParticleDepthMaterial.js'
import { BilateralGaussianBlurShader } from './BilateralGaussianBlurShader.js'

function ParticleDepthRenderer(e, t, n, i, r) {
  this._scene = e,
    this._particleSim = n,
    this._pointRenderer = new RectRenderer(t, new THREE.Points(n.pointGeometry)),
    this._depthMaterial = new ParticleDepthMaterial,
    this._depthMaterial.particleSize = n.particleRadius,
    r = void 0 === r ? 6 : r,
    ParticleBlurredRenderer.call(this, t, i, BilateralGaussianBlurShader, r)
}
ParticleDepthRenderer.prototype = Object.create(ParticleBlurredRenderer.prototype),
  ParticleDepthRenderer.prototype._renderParticles = function(e, t) {
    this._depthMaterial.positionBuffer = this._particleSim.positionBuffer,
      this._depthMaterial.cameraNear = e.near,
      this._depthMaterial.rcpCameraRange = 1 / (e.far - e.near),
      this._renderer.setClearColor(16777215, 1),
      this._pointRenderer.execute(this._depthMaterial, t, !0, e),
      this._renderer.setClearColor(0, 1)
  },
  ParticleDepthRenderer.prototype.resize = function(e, t) {
    ParticleBlurredRenderer.prototype.resize.call(this, e, t),
      this._depthMaterial.viewportSize.x = this._renderTarget.width,
      this._depthMaterial.viewportSize.y = this._renderTarget.height
  }

export { ParticleDepthRenderer }
