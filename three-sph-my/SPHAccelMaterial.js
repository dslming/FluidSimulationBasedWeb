import { ShaderLibrary } from './ShaderLibrary.js'

var SPHAccelMaterial = function(e) {
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
      bucketBuffer: {
        value: null
      },
      velocityBuffer: {
        value: null
      },
      densityBuffer: {
        value: null
      },
      dt: {
        value: 1
      },
      drag: {
        value: 0
      },
      maxParticleIndex: {
        value: 0
      },
      numCells: {
        value: e.numCells
      },
      cellSize: {
        value: e.cellSize
      },
      stiffness: {
        value: e.stiffness
      },
      restDensity: {
        value: e.restDensity
      },
      gravity: {
        value: -9.81
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
      h: {
        value: e.smoothingRadius
      },
      h2: {
        value: Math.pow(e.smoothingRadius, 2)
      },
      pressNorm: {
        value: -45 / (Math.PI * Math.pow(e.smoothingRadius, 6))
      },
      viscNorm: {
        value: 45 / (Math.PI * Math.pow(e.smoothingRadius, 6))
      },
      surfaceNorm: {
        value: -945 / (32 * Math.PI * Math.pow(e.smoothingRadius, 9))
      },
      curvatureThreshold: {
        value: e.curvatureThreshold
      },
      surfaceTension: {
        value: e.surfaceTension
      },
      viscosity: {
        value: 0
      }
    },
    vertexShader: ShaderLibrary.get("sph_quad_vertex"),
    fragmentShader: ShaderLibrary.get("sph_accel_fragment")
  })
}
SPHAccelMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype, {
  positionBuffer: {
    get: function() {
      return this.uniforms.positionBuffer.value
    },
    set: function(e) {
      this.uniforms.positionBuffer.value = e
    }
  },
  densityBuffer: {
    get: function() {
      return this.uniforms.densityBuffer.value
    },
    set: function(e) {
      this.uniforms.densityBuffer.value = e
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
  viscosity: {
    get: function() {
      return this.uniforms.viscosity.value
    },
    set: function(e) {
      this.uniforms.viscosity.value = e
    }
  },
  restDensity: {
    get: function() {
      return this.uniforms.restDensity.value
    },
    set: function(e) {
      this.uniforms.restDensity.value = e
    }
  },
  curvatureThreshold: {
    get: function() {
      return this.uniforms.curvatureThreshold.value
    },
    set: function(e) {
      this.uniforms.curvatureThreshold.value = e
    }
  },
  surfaceTension: {
    get: function() {
      return this.uniforms.surfaceTension.value
    },
    set: function(e) {
      this.uniforms.surfaceTension.value = e
    }
  },
  stiffness: {
    get: function() {
      return this.uniforms.stiffness.value
    },
    set: function(e) {
      this.uniforms.stiffness.value = e
    }
  },
  particleMass: {
    get: function() {
      return this.uniforms.mass.value
    },
    set: function(e) {
      this.uniforms.mass.value = e
    }
  },
  gravity: {
    get: function() {
      return this.uniforms.gravity.value
    },
    set: function(e) {
      this.uniforms.gravity.value = e
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
  dt: {
    get: function() {
      return this.uniforms.dt.value
    },
    set: function(e) {
      this.uniforms.dt.value = e
    }
  },
  drag: {
    get: function() {
      return this.uniforms.drag.value
    },
    set: function(e) {
      this.uniforms.drag.value = e
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
export { SPHAccelMaterial }
