import { FloatTex } from './FloatTex.js'
import { SPHDistanceMaterial } from './SPHDistanceMaterial.js'
import { RectRenderer } from './RectRenderer.js'


function SPHDistanceFieldRenderer(e, t) {
  this._renderer = e,
    this._sph = t,
    this._numCells = t._numCells,
    this._cellSize = t.cellSize,
    this._zRange = Math.ceil(t.particleRadius / this._cellSize);
  var n = FloatTex.getHalfOrFloat(e);
  this._distanceField = new THREE.WebGLRenderTarget(this._numCells.x * this._numCells.z, this._numCells.y, {
      type: n,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      generateMipmaps: !1,
      depthBuffer: !1,
      stencilBuffer: !1,
      format: THREE.RGBAFormat
    }),
    this._material = new SPHDistanceMaterial(t),
    this._pointRenderer = new RectRenderer(e, new THREE.Points(t.pointGeometry))
}
SPHDistanceFieldRenderer.prototype = {
  get texture() {
    return this._distanceField.texture
  },
  render: function() {
    this._material.positionBuffer = this._sph.positionBuffer,
      this._renderer.setClearColor(new THREE.Color(1e3, 0, 0), 1),
      this._pointRenderer.clear(this._distanceField);
    for (var e = -this._zRange; e <= this._zRange; ++e)
      this._material.zSliceOffset = e,
      this._pointRenderer.execute(this._material, this._distanceField, !1);
    this._renderer.setClearColor(0, 1)
  }
}

export { SPHDistanceFieldRenderer }
