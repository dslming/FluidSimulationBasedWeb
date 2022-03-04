function SPHHeightMapCollider(e) {
  var t = new SPHHeightMapColliderMaterial(e);
  SPHCollider.call(this, t)
}
SPHHeightMapCollider.prototype = Object.create(SPHCollider.prototype)
