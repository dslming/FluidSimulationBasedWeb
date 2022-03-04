import { FloatTex, QueryString } from './FloatTex.js'
import { RectRenderer } from './RectRenderer.js'

function SPHCollider(e) {
  this._target = null,
    this._invalid = !0,
    this._material = e
}

SPHCollider.prototype = {
  get texture() {
    return this._target.texture
  },
  init: function(e, t) {
    this._renderer = t,
      this._halfFloatType = FloatTex.getHalfOrFloat(t),
      this._rectRenderer = new RectRenderer(t),
      this._numCells = e.numCells,
      this._cellSize = e.cellSize,
      this._target = new THREE.WebGLRenderTarget(this._numCells.x * this._numCells.z, this._numCells.y, {
        type: this._halfFloatType,
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        generateMipmaps: !1,
        depthBuffer: !1,
        stencilBuffer: !1,
        format: THREE.RGBAFormat
      });
    var n = this._material.uniforms;
    n.numCells.value = this._numCells,
      n.wallExtent.value = e.halfExtent,
      n.cellSize.value = this._cellSize
  },
  invalidate: function() {
    this._invalid = !0
  },
  update: function() {
    this._invalid && (this._updateMaterial(),
      this._rectRenderer.execute(this._material, this._target, !0),
      this._invalid = !1)
  },
  _updateMaterial: function() {}
};
export { SPHCollider }
