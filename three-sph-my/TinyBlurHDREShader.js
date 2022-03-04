  TinyBlurHDREShader = {
    uniforms: {
      tDiffuse: {
        value: null
      },
      sampleStep: {
        value: new THREE.Vector2
      },
      weights: {
        value: []
      }
    },
    vertexShader: ShaderLibrary.get("post_vertex"),
    fragmentShader: ShaderLibrary.get("tiny_blur_hdre_fragment")
  },
