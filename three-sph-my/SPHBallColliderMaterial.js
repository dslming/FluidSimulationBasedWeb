import { ShaderLibrary } from './ShaderLibrary.js'

var SPHBallColliderMaterial = function() {
  THREE.ShaderMaterial.call(this, {
    uniforms: {
      wallExtent: {
        value: null
      },
      numCells: {
        value: null
      },
      cellSize: {
        value: 0
      },
      sphereRadius: {
        value: .2
      },
      spherePosition: {
        value: new THREE.Vector3
      }
    },
    vertexShader: ShaderLibrary.get("sph_quad_vertex"),
    fragmentShader: ShaderLibrary.getInclude("distance_functions") + ShaderLibrary.get("sph_ball_collider_fragment")
  })
}

SPHBallColliderMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype, {
  sphereRadius: {
    get: function() {
      return this.uniforms.sphereRadius.value
    },
    set: function(e) {
      this.uniforms.sphereRadius.value = e
    }
  },
  spherePosition: {
    get: function() {
      return this.uniforms.spherePosition.value
    },
    set: function(e) {
      this.uniforms.spherePosition.value.copy(e)
    }
  }
})
export { SPHBallColliderMaterial }
