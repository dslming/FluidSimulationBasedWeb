import { ShaderLibrary } from './ShaderLibrary.js'

var SkyMaterial = function(e) {
  this._color = e.color || new THREE.Color(16777215),
    this._envMap = e.envMap;
  var t = {
    envMap: {
      value: this._envMap
    },
    color: {
      value: this._color
    },
    invert: {
      value: 1
    }
  };
  THREE.ShaderMaterial.call(this, {
    uniforms: t,
    vertexShader: ShaderLibrary.get("sky_vertex"),
    fragmentShader: ShaderLibrary.get("sky_fragment")
  })
}
SkyMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype, {
  color: {
    get: function() {
      return this._color
    },
    set: function(e) {
      this._color = e,
        this.uniforms.color.value = e
    }
  },
  envMap: {
    get: function() {
      return this._envMap
    },
    set: function(e) {
      this._envMap = e,
        this.uniforms.envMap.value = e
    }
  }
})

export { SkyMaterial }
