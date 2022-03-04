import { ShaderLibrary } from './ShaderLibrary.js'
var SPHPositionMaterial = function(e) {
  THREE.ShaderMaterial.call(this, {
    uniforms: {
      positionBuffer: {
        value: null
      },
      velocityBuffer: {
        value: null
      },
      accelBuffer: {
        value: null
      },
      dt: {
        value: 1
      },
      wallExtent: {
        value: e.halfExtent
      },
      restDistance: {
        value: e.restDistance
      },
      maxParticleIndex: {
        value: 0
      }
    },
    vertexShader: ShaderLibrary.get("sph_quad_vertex"),
    fragmentShader: ShaderLibrary.get("sph_position_fragment")
  })
}
SPHPositionMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype, {
  positionBuffer: {
    get: function() {
      return this.uniforms.positionBuffer.value
    },
    set: function(e) {
      this.uniforms.positionBuffer.value = e
    }
  },
  velocityBuffer: {
    get: function() {
      return this.uniforms.velocityBuffer.value
    },
    set: function(e) {
      this.uniforms.velocityBuffer.value = e
    }
  },
  accelBuffer: {
    get: function() {
      return this.uniforms.accelBuffer.value
    },
    set: function(e) {
      this.uniforms.accelBuffer.value = e
    }
  },
  dt: {
    get: function() {
      return this.uniforms.dt.value
    },
    set: function(e) {
      this.uniforms.dt.value = e
    }
  },
  maxParticleIndex: {
    get: function() {
      return this.uniforms.maxParticleIndex.value
    },
    set: function(e) {
      this.uniforms.maxParticleIndex.value = e
    }
  }
})

export { SPHPositionMaterial }
