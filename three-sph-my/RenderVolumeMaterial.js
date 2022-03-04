import { ShaderLibrary } from './ShaderLibrary.js'

var RenderVolumeMaterial = function(e, t, n) {
  this._mie = new THREE.Color;
  var i = {
    NUM_SAMPLES: n
  };
  t && (i.SKYBOX = "");
  var r = {
      lightAccum: {
        value: null
      },
      waterDepthMap: {
        value: null
      },
      sceneDepthMap: {
        value: null
      },
      pixelSize: {
        value: new THREE.Vector2
      },
      numCells: {
        value: e.numCells
      },
      cellSize: {
        value: e.cellSize
      },
      modelViewMatrixInverse: {
        value: new THREE.Matrix4
      },
      viewMatrixInverse: {
        value: new THREE.Matrix4
      },
      unprojectionMatrix: {
        value: new THREE.Matrix4
      },
      roughness: {
        value: .001
      },
      normalSpecularReflection: {
        value: .04
      },
      cameraNear: {
        value: 0
      },
      cameraRange: {
        value: 1
      },
      transparencyFactor: {
        value: 10
      },
      absorption: {
        value: new THREE.Color(.01, .01, .01)
      },
      mie: {
        value: new THREE.Color((-.1), (-.12), .05)
      },
      skybox: {
        value: t
      }
    },
    o = THREE.UniformsUtils.merge([r, THREE.UniformsLib.lights]);
  THREE.ShaderMaterial.call(this, {
      defines: i,
      uniforms: o,
      lights: !0,
      vertexShader: ShaderLibrary.get("render_volume_vertex"),
      fragmentShader: ShaderLibrary.get("render_volume_fragment")
    }),
    this.uniforms.skybox.value = t,
    this.extensions.fragDepth = !0,
    this.side = THREE.BackSide,
    this.transparent = !0
}
RenderVolumeMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype, {
    absorption: {
      get: function() {
        return this.uniforms.absorption.value
      },
      set: function(e) {
        this.uniforms.absorption.value = e
      }
    },
    mie: {
      get: function() {
        return this._mie
      },
      set: function(e) {
        this._mie = e;
        var t = this.uniforms.mie.value;
        t.r = this._getMieFactor(e.r),
          t.g = this._getMieFactor(e.g),
          t.b = this._getMieFactor(e.b)
      }
    },
    roughness: {
      get: function() {
        return this.uniforms.roughness.value
      },
      set: function(e) {
        this.uniforms.roughness.value = e
      }
    },
    pixelSize: {
      get: function() {
        return this.uniforms.pixelSize.value
      },
      set: function(e) {
        this.uniforms.pixelSize.value = e
      }
    },
    transparencyFactor: {
      get: function() {
        return this.uniforms.transparencyFactor.value
      },
      set: function(e) {
        this.uniforms.transparencyFactor.value = e
      }
    }
  }),
  RenderVolumeMaterial.prototype.update = function(e, t, n, i, r) {
    this.uniforms.lightAccum.value = n,
      this.uniforms.waterDepthMap.value = i,
      this.uniforms.sceneDepthMap.value = r,
      this.uniforms.viewMatrixInverse.value = t.matrixWorld,
      this.uniforms.unprojectionMatrix.value.getInverse(t.projectionMatrix),
      this.uniforms.cameraNear.value = t.near,
      this.uniforms.cameraRange.value = t.far - t.near;
    var o = this.uniforms.modelViewMatrixInverse.value;
    o.multiplyMatrices(t.matrixWorldInverse, e.matrixWorld),
      o.getInverse(o)
  },
  RenderVolumeMaterial.prototype._getMieFactor = function(e) {
    var t = 1 - e,
      n = 1 + e * e + 2 * e;
    return t * t / Math.pow(n, 1.5)
  }

export { RenderVolumeMaterial }
