import { RectRenderer } from './RectRenderer.js'
import { VolumetricLighting } from './VolumetricLighting.js'

function VolumetricLightRenderer(e, t, n, i, r, o) {
  this._target = new THREE.WebGLRenderTarget(t.x * t.z * o, t.y * o, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      generateMipmaps: !1,
      depthBuffer: !1,
      stencilBuffer: !1,
      format: THREE.RGBAFormat
    }),
    this._renderer = e,
    this._scene = new THREE.Scene,
    this._rectRenderer = new RectRenderer(e),
    this._material = new VolumetricLighting(t, n, i, r)
}
VolumetricLightRenderer.prototype = {
  get absorption() {
    return this._material.absorption
  },
  set absorption(e) {
    this._material.absorption = e
  },
  get texture() {
    return this._target.texture
  },
  addLight: function(e) {
    this._rectRenderer._scene.add(e)
  },
  removeLight: function(e) {
    this._rectRenderer._scene.remove(e)
  },
  render: function(e, t, n) {
    var i = new THREE.Matrix4;
    i.getInverse(t.matrixWorld);
    var r = this._material.cameraPos;
    r.copy(n.position),
      r.applyMatrix4(i),
      this._material.densityField = e,
      this._rectRenderer.execute(this._material, this._target, !0)
  }
}
export { VolumetricLightRenderer }
