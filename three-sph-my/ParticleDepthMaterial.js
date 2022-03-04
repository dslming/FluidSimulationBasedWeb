import { ShaderLibrary } from './ShaderLibrary.js'

var ParticleDepthMaterial = function() {
  THREE.ShaderMaterial.call(this, {
      uniforms: {
        positionBuffer: {
          value: null
        },
        particleSize: {
          value: 100
        },
        viewportSize: {
          value: new THREE.Vector2
        },
        cameraNear: {
          value: .1
        },
        rcpCameraRange: {
          value: 0
        }
      },
      vertexShader: ShaderLibrary.get("sph_particle_depth_vertex"),
      fragmentShader: ShaderLibrary.get("sph_particle_depth_fragment")
    }),
    this.extensions.fragDepth = !0
}

ParticleDepthMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype, {
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
  },
  cameraNear: {
    get: function() {
      return this.uniforms.cameraNear.value
    },
    set: function(e) {
      this.uniforms.cameraNear.value = e
    }
  },
  rcpCameraRange: {
    get: function() {
      return this.uniforms.rcpCameraRange.value
    },
    set: function(e) {
      this.uniforms.rcpCameraRange.value = e
    }
  },
  viewportSize: {
    get: function() {
      return this.uniforms.viewportSize.value
    },
    set: function(e) {
      this.uniforms.viewportSize.value = e
    }
  }
})
export { ParticleDepthMaterial }
