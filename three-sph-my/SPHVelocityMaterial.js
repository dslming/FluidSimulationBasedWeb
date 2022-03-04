import { ShaderLibrary } from './ShaderLibrary.js'

var SPHVelocityMaterial = function(e) {
  THREE.ShaderMaterial.call(this, {
    uniforms: {
      positionBuffer: {
        value: null
      },
      velocityBuffer: {
        value: null
      },
      accelBuffer1: {
        value: null
      },
      accelBuffer2: {
        value: null
      },
      collisionBuffer: {
        value: e.collisionBuffer
      },
      dt: {
        value: 1
      },
      numCells: {
        value: e.numCells
      },
      cellSize: {
        value: e.cellSize
      },
      restDistance: {
        value: e.restDistance
      },
      particleBufferSize: {
        value: e.particleBufferSize
      },
      maxParticleIndex: {
        value: 0
      }
    },
    vertexShader: ShaderLibrary.get("sph_quad_vertex"),
    fragmentShader: e.initVelocityGLSL + ShaderLibrary.get("sph_velocity_fragment")
  })
}
SPHVelocityMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype, {
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
  accelBuffer1: {
    get: function() {
      return this.uniforms.accelBuffer1.value
    },
    set: function(e) {
      this.uniforms.accelBuffer1.value = e
    }
  },
  accelBuffer2: {
    get: function() {
      return this.uniforms.accelBuffer2.value
    },
    set: function(e) {
      this.uniforms.accelBuffer2.value = e
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
export { SPHVelocityMaterial }
