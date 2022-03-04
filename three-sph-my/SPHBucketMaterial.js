import { ShaderLibrary } from './ShaderLibrary.js'

var SPHBucketMaterial = function(e) {
  THREE.ShaderMaterial.call(this, {
    uniforms: {
      positionBuffer: {
        value: null
      },
      numCells: {
        value: e.numCells
      },
      numParticles: {
        value: e.numParticles
      },
      cellSize: {
        value: e.cellSize
      }
    },
    vertexShader: ShaderLibrary.get("sph_bucket_vertex"),
    fragmentShader: ShaderLibrary.get("sph_bucket_fragment")
  })
}
SPHBucketMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype, {
  positionBuffer: {
    get: function() {
      return this.uniforms.positionBuffer.value
    },
    set: function(e) {
      this.uniforms.positionBuffer.value = e
    }
  },
  numParticles: {
    get: function() {
      return this.uniforms.numParticles.value
    },
    set: function(e) {
      this.uniforms.numParticles.value = e
    }
  }
})

export { SPHBucketMaterial }
