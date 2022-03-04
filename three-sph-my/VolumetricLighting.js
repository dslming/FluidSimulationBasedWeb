import { ShaderLibrary } from './ShaderLibrary.js'

function VolumetricLighting(e, t, n, i) {
  var r = {
    NUM_SAMPLES: n
  };
  i && (r.WATER = "");
  var o = e.y * t * .25,
    a = THREE.UniformsUtils.merge([{
      densityField: {
        value: null
      },
      cameraPos: {
        value: new THREE.Vector3
      },
      mieG: {
        value: new THREE.Color((-.1), (-.12), .05)
      },
      cellSize: {
        value: t
      },
      absorption: {
        value: new THREE.Color(.01, .01, .01)
      },
      numCells: {
        value: e
      },
      sampleStep: {
        value: o / (n - 1)
      }
    }, THREE.UniformsLib.lights]);
  THREE.ShaderMaterial.call(this, {
    defines: r,
    uniforms: a,
    lights: !0,
    vertexShader: ShaderLibrary.get("volumetric_vertex"),
    fragmentShader: ShaderLibrary.get("volumetric_lighting_fragment")
  })
}
VolumetricLighting.prototype = Object.create(THREE.ShaderMaterial.prototype, {
  densityField: {
    get: function() {
      return this.uniforms.densityField.value
    },
    set: function(e) {
      this.uniforms.densityField.value = e
    }
  },
  cameraPos: {
    get: function() {
      return this.uniforms.cameraPos.value
    },
    set: function(e) {
      this.uniforms.cameraPos.value = e
    }
  },
  mieG: {
    get: function() {
      return this.uniforms.mieG.value
    },
    set: function(e) {
      this.uniforms.mieG.value = e
    }
  },
  absorption: {
    get: function() {
      return this.uniforms.absorption.value
    },
    set: function(e) {
      this.uniforms.absorption.value.copy(e)
    }
  }
})
export { VolumetricLighting }
