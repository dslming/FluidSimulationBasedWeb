import { LinearDepthMaterial } from './LinearDepthMaterial.js'

function SceneDepthRenderer(e, t, n) {
  this._renderer = t,
    this._scene = e,
    this._scale = n || 1,
    this._depthMaterial = new LinearDepthMaterial
}
SceneDepthRenderer.prototype = {
  get texture() {
    return this._renderTarget.texture
  },
  resize: function(e, t) {
    e = Math.floor(e * this._scale),
      t = Math.floor(t * this._scale),
      this._renderTarget && this._renderTarget.width === e && this._renderTarget.height === t || (this._renderTarget = new THREE.WebGLRenderTarget(e, t, {
        type: this._textureType,
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        generateMipmaps: !1,
        depthBuffer: !0,
        stencilBuffer: !1
      }))
  },
  render: function(e) {
    this._depthMaterial.cameraNear = e.near,
      this._depthMaterial.rcpCameraRange = 1 / (e.far - e.near),
      this._renderer.setClearColor(16777215, 1),
      this._scene.overrideMaterial = this._depthMaterial,
      this._renderer.render(this._scene, e, this._renderTarget, !0),
      this._scene.overrideMaterial = null,
      this._renderer.setClearColor(0, 1)
  }
}
export { SceneDepthRenderer }
