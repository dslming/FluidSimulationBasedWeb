function VolumetricNormals(e, t, n) {
  var i = THREE.UniformsUtils.merge([{
    densityField: {
      value: null
    },
    numCells: {
      value: new THREE.Vector3(e, t, n)
    },
    rcpTexSize: {
      value: new THREE.Vector3(1 / (e * n), 1 / t)
    }
  }]);
  THREE.ShaderMaterial.call(this, {
    uniforms: i,
    vertexShader: ShaderLibrary.get("volumetric_vertex"),
    fragmentShader: ShaderLibrary.get("volumetric_normals_fragment")
  })
}
VolumetricNormals.prototype = Object.create(THREE.ShaderMaterial.prototype, {
  densityField: {
    get: function() {
      return this.uniforms.densityField.value
    },
    set: function(e) {
      this.uniforms.densityField.value = e
    }
  }
})
