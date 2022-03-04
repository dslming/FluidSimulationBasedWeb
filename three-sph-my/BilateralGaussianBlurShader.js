import { ShaderLibrary } from './ShaderLibrary.js'

var BilateralGaussianBlurShader = {
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
    depthRange: {
      value: .002
    },
    weights: {
      value: []
    }
  },
  vertexShader: ShaderLibrary.get("post_vertex"),
  fragmentShader: ShaderLibrary.get("bilat_gaussian_blur_fragment")
}

export { BilateralGaussianBlurShader }
