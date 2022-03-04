import { ShaderLibrary } from './ShaderLibrary.js'

var SPHDensityMaterial = function(e) {
  var t = {
    SAMPLE_RADIUS: e.quality,
    BUCKET_SIZE: 4
  };
  THREE.ShaderMaterial.call(this, {
    defines: t,
    uniforms: {
      positionBuffer: {
        value: null
      },
      collisionBuffer: {
        value: e.collisionBuffer
      },
      bucketBuffer: {
        value: null
      },
      numCells: {
        value: e.numCells
      },
      cellSize: {
        value: e.cellSize
      },
      particleBufferSize: {
        value: e.particleBufferSize
      },
      bucketPixelSize: {
        value: e.bucketPixelSize
      },
      mass: {
        value: e.particleMass
      },
      h2: {
        value: e.smoothingRadius * e.smoothingRadius
      },
      kernelNorm: {
        value: 315 / (64 * Math.PI * Math.pow(e.smoothingRadius, 9))
      }
    },
    vertexShader: ShaderLibrary.get("sph_quad_vertex"),
    fragmentShader: ShaderLibrary.get("sph_density_fragment")
  })
}
SPHDensityMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype, {
  positionBuffer: {
    get: function() {
      return this.uniforms.positionBuffer.value
    },
    set: function(e) {
      this.uniforms.positionBuffer.value = e
    }
  },
  bucketBuffer: {
    get: function() {
      return this.uniforms.bucketBuffer.value
    },
    set: function(e) {
      this.uniforms.bucketBuffer.value = e
    }
  },
  particleMass: {
    get: function() {
      return this.uniforms.mass.value
    },
    set: function(e) {
      this.uniforms.mass.value = e
    }
  }
})

export { SPHDensityMaterial }
