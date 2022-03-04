import { SPHBallCollider } from './SPHBallCollider.js'
import { ShaderLibrary } from './ShaderLibrary.js'

function SPHBallSetup() {
  this.collider = new SPHBallCollider
}

SPHBallSetup.prototype = {
  getStartParticleCount: function(e) {
    return 0
  },
  getInitVelocityGLSL: function() {
    return ShaderLibrary.getInclude("sph_init_velocity_stream")
  },
  initParticlePosition: function(e, t, n, i) {
    var r = new THREE.Spherical;
    return function(e, t, n, i) {
      var o = n.length() / 6;
      r.radius = Math.random() * o,
        r.phi = Math.random() * Math.PI,
        r.theta = Math.random() * Math.PI * 2,
        i.setFromSpherical(r),
        i.x -= .5 * n.x,
        i.y += .5 * n.y,
        i.z -= .5 * n.z
    }
  }()
}

export { SPHBallSetup }
