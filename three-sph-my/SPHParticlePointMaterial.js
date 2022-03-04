SPHParticlePointMaterial = function(e) {
    var t = {};
    e && (t.MAP = ""),
      THREE.ShaderMaterial.call(this, {
        defines: t,
        uniforms: {
          colorBuffer: {
            value: e
          },
          positionBuffer: {
            value: null
          },
          particleSize: {
            value: 10
          }
        },
        vertexShader: ShaderLibrary.get("sph_particle_point_vertex"),
        fragmentShader: ShaderLibrary.get("sph_particle_point_fragment")
      })
  },
  SPHParticlePointMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype, {
    colorBuffer: {
      get: function() {
        return this.uniforms.colorBuffer.value
      },
      set: function(e) {
        this.uniforms.colorBuffer.value = e
      }
    },
    positionBuffer: {
      get: function() {
        return this.uniforms.positionBuffer.value
      },
      set: function(e) {
        this.uniforms.positionBuffer.value = e
      }
    },
    particleSize: {
      get: function() {
        return this.uniforms.particleSize.value
      },
      set: function(e) {
        this.uniforms.particleSize.value = e
      }
    }
  }),
