function VolumetricNormalsRenderer(e, t, n, i) {
  this._renderer = e,
    this._scene = new THREE.Scene,
    this._camera = new THREE.OrthographicCamera((-1), 1, 1, (-1), 0, 1),
    this._material = new VolumetricNormals(t, n, i),
    this._quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), this._material),
    this._scene.add(this._quad)
}
VolumetricNormalsRenderer.prototype = {
  render: function(e, t) {
    this._material.densityField = e,
      this._renderer.render(this._scene, this._camera, t, !0)
  }
};
