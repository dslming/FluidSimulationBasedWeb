var Axes = function() {
  THREE.Object3D.call(this),
    this._init()
};
Axes.prototype = Object.create(THREE.Object3D.prototype)
Axes.prototype._init = function() {
  var e = new THREE.CylinderBufferGeometry(.01, .01, 1);
  e.translate(0, .5, 0);
  var t = new THREE.Mesh(e, new UnlitMaterial({
      color: 16711680
    })),
    n = new THREE.Mesh(e, new UnlitMaterial({
      color: 65280
    })),
    i = new THREE.Mesh(e, new UnlitMaterial({
      color: 255
    }));
  t.rotation.z = .5 * -Math.PI,
    i.rotation.x = .5 * Math.PI,
    this.add(t),
    this.add(n),
    this.add(i)
}

export { Axes }
