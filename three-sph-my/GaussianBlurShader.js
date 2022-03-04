  GaussianBlurShader = {
    defines: {
      KERNEL_RADIUS: "5",
      NUM_WEIGHTS: "6"
    },
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
    fragmentShader: ShaderLibrary.get("gaussian_blur_fragment")
  },
