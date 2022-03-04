function TripleBufferTexture(e, t, n) {
  this._width = e,
    this._height = t,
    this._storedFBO = new THREE.WebGLRenderTarget(e, t, n),
    this._sourceFBO = new THREE.WebGLRenderTarget(e, t, n),
    this._targetFBO = new THREE.WebGLRenderTarget(e, t, n),
    this._storedFBO.texture.generateMipmaps = n.generateMipmaps || !1,
    this._sourceFBO.texture.generateMipmaps = n.generateMipmaps || !1,
    this._targetFBO.texture.generateMipmaps = n.generateMipmaps || !1
}
TripleBufferTexture.prototype = {
  get width() {
    return this._width
  },
  get height() {
    return this._height
  },
  get stored() {
    return this._storedFBO.texture
  },
  get source() {
    return this._sourceFBO.texture
  },
  get target() {
    return this._targetFBO
  },
  store: function() {
    var e = this._storedFBO;
    this._storedFBO = this._targetFBO,
      this._targetFBO = e
  },
  swap: function() {
    var e = this._sourceFBO;
    this._sourceFBO = this._targetFBO,
      this._targetFBO = e
  }
};
