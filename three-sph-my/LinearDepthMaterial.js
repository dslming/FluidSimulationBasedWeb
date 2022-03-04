import { ShaderLibrary } from './ShaderLibrary.js'

var LinearDepthMaterial = function() {
  THREE.ShaderMaterial.call(this, {
    uniforms: {
      cameraNear: {
        value: 0
      },
      rcpCameraRange: {
        value: 0
      }
    },
    vertexShader: ShaderLibrary.get("linear_depth_vertex"),
    fragmentShader: ShaderLibrary.get("linear_depth_fragment")
  })
}
LinearDepthMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype, {
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
  }
})
export { LinearDepthMaterial }
