function DoubleBufferTexture(e, t, n) {
  this._width = e,
    this._height = t,
    this._sourceFBO = new THREE.WebGLRenderTarget(e, t, n),
    this._targetFBO = new THREE.WebGLRenderTarget(e, t, n),
    this._sourceFBO.texture.generateMipmaps = n.generateMipmaps || !1,
    this._targetFBO.texture.generateMipmaps = n.generateMipmaps || !1
}
DoubleBufferTexture.prototype = {
  get width() {
    return this._width
  },
  get height() {
    return this._height
  },
  get source() {
    return this._sourceFBO.texture
  },
  get target() {
    return this._targetFBO
  },
  swap: function() {
    var e = this._sourceFBO;
    this._sourceFBO = this._targetFBO,
      this._targetFBO = e
  }
}
export { DoubleBufferTexture }
