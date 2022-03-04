import { RectRenderer } from './RectRenderer.js'
import { CenteredGaussianCurve } from './CenteredGaussianCurve.js'
import { DoubleBufferTexture } from './DoubleBufferTexture.js'

function ParticleBlurredRenderer(e, t, n, i, r) {
  this._textureType = r,
    this._renderer = e,
    this._scale = t || 1,
    n.defines.KERNEL_RADIUS = i,
    n.defines.NUM_WEIGHTS = i + 1,
    this._blurMaterial = new THREE.ShaderMaterial(n),
    this._blurMaterial.uniforms.weights.value = this._getGaussian(i),
    this._blurMaterial.depthTest = !1,
    this._blurMaterial.depthWrite = !1,
    this._rectRenderer = new RectRenderer(e),
    this.resize(window.innerWidth, window.innerHeight)
}
ParticleBlurredRenderer.prototype = {
  get texture() {
    return this._renderTarget.source
  },
  resize: function(e, t) {
    e = Math.floor(e * this._scale),
      t = Math.floor(t * this._scale),
      this._renderTarget && this._renderTarget.width === e && this._renderTarget.height === t || (this._renderTarget = new DoubleBufferTexture(e, t, {
        type: this._textureType,
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        generateMipmaps: !1,
        depthBuffer: !0,
        stencilBuffer: !1
      }))
  },
  render: function(e) {
    this._renderParticles(e, this._renderTarget.target),
      this._renderTarget.swap(),
      this._blur()
  },
  _renderParticles: function(e, t) {
    throw new Error("Abstract method called!")
  },
  _blur: function() {
    this._blurMaterial.uniforms.tDiffuse.value = this._renderTarget.source,
      this._blurMaterial.uniforms.sampleStep.value.x = 1 / this._renderTarget.width,
      this._blurMaterial.uniforms.sampleStep.value.y = 0,
      this._rectRenderer.execute(this._blurMaterial, this._renderTarget.target, !0),
      this._renderTarget.swap(),
      this._blurMaterial.uniforms.tDiffuse.value = this._renderTarget.source,
      this._blurMaterial.uniforms.sampleStep.value.x = 0,
      this._blurMaterial.uniforms.sampleStep.value.y = 1 / this._renderTarget.height,
      this._rectRenderer.execute(this._blurMaterial, this._renderTarget.target, !0),
      this._renderTarget.swap()
  },
  _getGaussian: function(e) {
    for (var t = CenteredGaussianCurve.fromRadius(e, .2), n = [], i = 0, r = 0; r <= e; ++r) {
      var o = t.getValueAt(r);
      n[r] = o,
        i += 0 === r ? o : 2 * o
    }
    for (var r = 0; r <= e; ++r)
      n[r] /= i;
    return n
  }
}

export { ParticleBlurredRenderer }
