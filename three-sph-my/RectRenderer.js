function RectRenderer(e, t) {
  this._renderer = e,
    this._scene = new THREE.Scene,
    this._camera = new THREE.OrthographicCamera((-1), 1, 1, (-1), 0, 1),
    this._mesh = t || new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), null),
    this._scene.add(this._mesh)
}

RectRenderer.prototype = {
  execute: function(e, t, n, i) {
    var r = this._renderer.autoClear;
    this._renderer.autoClear = void 0 === n || n,
      this._mesh.material = e,
      this._renderer.render(this._scene, i || this._camera, t),
      this._renderer.autoClear = r
  },
  clear: function(e) {
    this._renderer.setRenderTarget(e),
      this._renderer.clear()
  }
}
export { RectRenderer }
