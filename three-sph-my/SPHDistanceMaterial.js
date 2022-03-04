import { ShaderLibrary } from './ShaderLibrary.js'
import { RectRenderer } from './RectRenderer.js'

var SPHDistanceMaterial = function(e) {
  THREE.ShaderMaterial.call(this, {
      uniforms: {
        positionBuffer: {
          value: null
        },
        numCells: {
          value: e.numCells
        },
        cellSize: {
          value: e.cellSize
        },
        particleRadius: {
          value: e.particleRadius
        },
        zSliceOffset: {
          value: 0
        }
      },
      vertexShader: ShaderLibrary.get("sph_distance_vertex"),
      fragmentShader: ShaderLibrary.get("sph_distance_fragment")
    }),
    this.blending = THREE.CustomBlending,
    this.blendEquation = THREE.MinEquation,
    this.blendSrc = THREE.ONE,
    this.blendDst = THREE.ONE,
    this.transparent = !0
}
SPHDistanceMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype, {
  positionBuffer: {
    get: function() {
      return this.uniforms.positionBuffer.value
    },
    set: function(e) {
      this.uniforms.positionBuffer.value = e
    }
  },
  zSliceOffset: {
    get: function() {
      return this.uniforms.zSliceOffset.value
    },
    set: function(e) {
      this.uniforms.zSliceOffset.value = e
    }
  }
})

export { SPHDistanceMaterial }
