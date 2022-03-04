function SPHCascadeSetup(e) {
  this.collider = new SPHHeightMapCollider(e)
}
SPHCascadeSetup.prototype = {
  getStartParticleCount: function(e) {
    return 0
  },
  getInitVelocityGLSL: function() {
    return ShaderLibrary.getInclude("sph_init_velocity_still")
  },
  initParticlePosition: function(e, t, n, i) {
    i.x = -n.x * (.2 * Math.random() + .8),
      i.y = .9 * n.y,
      i.z = (2 * Math.random() - 1) * n.z * .2
  }
}
