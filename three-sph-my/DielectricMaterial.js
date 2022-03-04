import { ShaderLibrary } from './ShaderLibrary.js'

var DielectricMaterial = function(e) {
  var t = "";
  e.displacementMap && (t += "#define DISPLACEMENT_MAP\n"),
    e.map && (t += "#define ALBEDO_MAP\n"),
    (e.skyboxPosition || e.skyboxSize) && (t += "#define LOCAL_SKYBOX\n"),
    e.specularProbe && (t += "#define SPECULAR_PROBE\n"),
    e.fogProbe && (t += "#define FOG_PROBE\n"),
    e.irradianceProbe && (t += "#define IRRADIANCE_PROBE\n"),
    e.normalMap && (t += "#define NORMAL_MAP\n"),
    e.roughnessMap && (t += "#define ROUGHNESS_MAP\n"),
    e.emissionMap && (t += "#define EMISSION_MAP\n"),
    e.invertNormal && (t += "#define INVERT_NORMAL\n"),
    e.aoMap && (t += "#define AMBIENT_OCCLUSION_MAP\n"),
    e.aoOnDiffuse && (t += "#define AO_ON_DIFFUSE\n"),
    e.lowPerformance || (t += "#define PERFORMANCE_PROFILE_HIGH\n"),
    e.faceNormals && (t += "#define FACE_NORMALS\n"),
    e.objectNormals && (t += "#define OBJECT_NORMALS\n"),
    void 0 !== e.color ? (e.color = new THREE.Color(e.color),
      e.color.convertGammaToLinear()) : e.color = new THREE.Color(16777215),
    e.emissionColor ? (e.emissionColor = new THREE.Color(e.emissionColor),
      e.emissionColor.convertGammaToLinear()) : e.emissionColor = new THREE.Color(0, 0, 0),
    e.specularProbeColor ? (e.specularProbeColor = new THREE.Color(e.specularProbeColor),
      e.specularProbeColor.convertGammaToLinear()) : e.specularProbeColor = new THREE.Color(1, 1, 1),
    this._specularProbeBoost = e.specularProbeBoost ? Math.pow(2, e.specularProbeBoost) : 1,
    e.specularProbeColor.multiplyScalar(this._specularProbeBoost),
    e.roughness = void 0 === e.roughness ? .05 : e.roughness,
    1 === e.roughness && (t += "#define IGNORESPECULAR\n"),
    (e.fogDensity || e.fogColor) && (t += "#define FOG\n"),
    e.fogColor = new THREE.Color(e.fogColor || 16777215),
    e.fogColor.copyGammaToLinear(e.fogColor);
  var n = {
      alpha: {
        value: 1
      },
      fogProbe: {
        value: e.fogProbe
      },
      fogProbeBoost: {
        value: e.fogProbeBoost ? Math.pow(2, e.fogProbeBoost) : 1
      },
      fogDensity: {
        value: e.fogDensity || .1
      },
      fogColor: {
        value: e.fogColor
      },
      displacementMap: {
        value: e.displacementMap
      },
      displacementMapRange: {
        value: e.displacementMapRange
      },
      albedoMap: {
        value: e.map
      },
      color: {
        value: e.color
      },
      celSpecularCutOff: {
        value: e.celSpecularCutOff || 1
      },
      roughness: {
        value: e.roughness
      },
      normalSpecularReflection: {
        value: .027
      },
      normalMap: {
        value: e.normalMap
      },
      emissionMap: {
        value: e.emissionMap
      },
      emissionColor: {
        value: e.emissionColor
      },
      roughnessMap: {
        value: e.roughnessMap
      },
      roughnessMapRange: {
        value: e.roughnessMapRange || .3
      },
      aoMap: {
        value: e.aoMap
      },
      skyboxPosition: {
        value: e.skyboxPosition ? e.skyboxPosition : new THREE.Vector3
      },
      skyboxSize: {
        value: e.skyboxSize ? e.skyboxSize : 10
      },
      specularProbe: {
        value: e.specularProbe
      },
      specularProbeColor: {
        value: e.specularProbeColor
      },
      irradianceProbe: {
        value: e.irradianceProbe
      },
      irradianceProbeBoost: {
        value: e.irradianceProbeBoost ? Math.pow(2, e.irradianceProbeBoost) : 1
      }
    },
    i = e.ignoreLights ? n : THREE.UniformsUtils.merge([n, THREE.UniformsLib.lights]);
  THREE.ShaderMaterial.call(this, {
      uniforms: i,
      lights: !e.ignoreLights,
      vertexShader: t + ShaderLibrary.get("dielectric_vertex"),
      fragmentShader: t + ShaderLibrary.get("dielectric_fragment")
    }),
    e.map && (this.uniforms.albedoMap.value = e.map),
    e.normalMap && (this.extensions.derivatives = !0,
      this.uniforms.normalMap.value = e.normalMap),
    e.faceNormals && (this.extensions.derivatives = !0),
    e.specularProbe && (this.uniforms.specularProbe.value = e.specularProbe),
    e.fogProbe && (this.uniforms.fogProbe.value = e.fogProbe),
    e.irradianceProbe && (this.uniforms.irradianceProbe.value = e.irradianceProbe),
    e.aoMap && (this.uniforms.aoMap.value = e.aoMap),
    e.displacementMap && (this.uniforms.displacementMap.value = e.displacementMap),
    e.roughnessMap && (this.uniforms.roughnessMap.value = e.roughnessMap),
    e.emissionMap && (this.uniforms.emissionMap.value = e.emissionMap),
    e.blending && (this.transparent = !0,
      this.blending = e.blending)
}

let GlassMaterial;
DielectricMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype),
  GlassMaterial = function(e) {
    var t = "";
    e.specularProbe && (t += "#define SPECULAR_PROBE\n"),
      e.roughness = void 0 === e.roughness ? .05 : e.roughness;
    var n = {
        roughness: {
          value: e.roughness
        },
        normalSpecularReflection: {
          value: .027
        },
        specularProbe: {
          value: e.specularProbe
        }
      },
      i = THREE.UniformsUtils.merge([n, THREE.UniformsLib.lights]);
    THREE.ShaderMaterial.call(this, {
        uniforms: i,
        lights: !0,
        vertexShader: t + ShaderLibrary.get("glass_vertex"),
        fragmentShader: t + ShaderLibrary.get("glass_fragment")
      }),
      e.specularProbe && (this.uniforms.specularProbe.value = e.specularProbe),
      this.transparent = !0,
      this.blending = THREE.AdditiveBlending
  },
  GlassMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype)

export { DielectricMaterial }
