import { SPHContent } from './SPHContent.js'
import { SPHCollider } from './SPHCollider.js'
import { ShaderLibrary } from './ShaderLibrary.js'
import { FloatTex, QueryString } from './FloatTex.js'
import { RectRenderer } from './RectRenderer.js'
import { DoubleBufferTexture } from './DoubleBufferTexture.js'
import { Entity } from './Entity.js'
import { SPH } from './SPH.js'
import { Gaussian } from './Gaussian.js'

let CalculateNormals;
let FindObject3D;
let AssetLibrary;
let DebugAlphaMaterial;
let DebugVec3Material;
let UnlitMaterial;
let SPHWallColliderMaterial;
import { Signal } from './Signal.js'


function isPlatformMobile() {
  var e = /AppleWebKit/.test(navigator.userAgent) && /Mobile\/\w+/.test(navigator.userAgent);
  return e || /Android|webOS|BlackBerry|Opera Mini|Opera Mobi|IEMobile/i.test(navigator.userAgent)
}

function startUp() {
  highPerformance = !isPlatformMobile() && !QueryString.lowPerformance,
    assetLibrary = new AssetLibrary(""),
    assetLibrary.queueAsset("skybox", "textures/specular/", AssetLibrary.Type.TEXTURE_CUBE),
    assetLibrary.queueAsset("irradiance", "textures/irradiance/", AssetLibrary.Type.TEXTURE_CUBE),
    assetLibrary.queueAsset("cascademap", "textures/cascademap.jpg", AssetLibrary.Type.TEXTURE_2D),
    assetLibrary.onComplete.bind(onAssetsLoaded),
    assetLibrary.onProgress.bind(onAssetsProgress),
    assetLibrary.load()
}

function onAssetsProgress(e) {
  var t = document.getElementById("preloaderProgress");
  t.style.width = Math.floor(100 * e) + "%"
}

function onAssetsLoaded(e) {
  var t = document.getElementById("preloader");
  t.style.display = "none";
  var n = document.getElementById("playContainer");
  n.style.display = "block"
}

function start(e, t) {
  var n = document.getElementById("playContainer");
  if (n.style.display = "none",
    mainProject = new SimpleThreeProject,
    mainProject.init(debugMode, assetLibrary),
    verifyExtension("EXT_blend_minmax") && verifyExtension("OES_texture_float_linear") && verifyExtension("EXT_frag_depth")) {
    var i = document.getElementById("info");
    i.style.display = "block";
    var r = document.getElementById("debugBox");
    r && (r.style.display = debugMode ? "block" : "none"),
      mainProject.content = new SPHContent(t, e),
      mainProject.start()
  }
}
window.start = start;

function verifyExtension(e) {
  var t = mainProject.renderer.extensions.get(e);
  if (!t) {
    var n = document.getElementById("errorContainer");
    n.style.display = "block",
      n = document.getElementById("errorMessage"),
      n.innerHTML = "This requires the WebGL " + e + " extension!"
  }
  return t
}

function SimpleThreeProject() {
  this.scene = null,
    this.camera = null,
    this.renderer = null,
    this.assetLibrary = null,
    this.container = null,
    this.timeScale = 1,
    this._content = null,
    this._stats = null,
    this._renderStats = null,
    this._time = null,
    this._isRunning = !1,
    this._initialized = !1
}



function SPHWallCollider() {
  var e = new SPHWallColliderMaterial;
  SPHCollider.call(this, e)
}


THREE.EffectComposer = function(e, t) {
    if (this.renderer = e,
      void 0 === t) {
      var n = {
          minFilter: THREE.LinearFilter,
          magFilter: THREE.LinearFilter,
          format: THREE.RGBAFormat,
          stencilBuffer: !1
        },
        i = e.getSize();
      t = new THREE.WebGLRenderTarget(i.width, i.height, n)
    }
    this.renderTarget1 = t,
      this.renderTarget2 = t.clone(),
      this.writeBuffer = this.renderTarget1,
      this.readBuffer = this.renderTarget2,
      this.passes = [],
      void 0 === THREE.CopyShader && console.error("THREE.EffectComposer relies on THREE.CopyShader"),
      this.copyPass = new THREE.ShaderPass(THREE.CopyShader)
  },
  Object.assign(THREE.EffectComposer.prototype, {
    swapBuffers: function() {
      var e = this.readBuffer;
      this.readBuffer = this.writeBuffer,
        this.writeBuffer = e
    },
    addPass: function(e) {
      this.passes.push(e);
      var t = this.renderer.getSize();
      e.setSize(t.width, t.height)
    },
    insertPass: function(e, t) {
      this.passes.splice(t, 0, e)
    },
    render: function(e) {
      var t, n, i = !1,
        r = this.passes.length;
      for (n = 0; n < r; n++)
        if (t = this.passes[n],
          t.enabled !== !1) {
          if (t.render(this.renderer, this.writeBuffer, this.readBuffer, e, i),
            t.needsSwap) {
            if (i) {
              var o = this.renderer.context;
              o.stencilFunc(o.NOTEQUAL, 1, 4294967295),
                this.copyPass.render(this.renderer, this.writeBuffer, this.readBuffer, e),
                o.stencilFunc(o.EQUAL, 1, 4294967295)
            }
            this.swapBuffers()
          }
          void 0 !== THREE.MaskPass && (t instanceof THREE.MaskPass ? i = !0 : t instanceof THREE.ClearMaskPass && (i = !1))
        }
    },
    reset: function(e) {
      if (void 0 === e) {
        var t = this.renderer.getSize();
        e = this.renderTarget1.clone(),
          e.setSize(t.width, t.height)
      }
      this.renderTarget1.dispose(),
        this.renderTarget2.dispose(),
        this.renderTarget1 = e,
        this.renderTarget2 = e.clone(),
        this.writeBuffer = this.renderTarget1,
        this.readBuffer = this.renderTarget2
    },
    setSize: function(e, t) {
      this.renderTarget1.setSize(e, t),
        this.renderTarget2.setSize(e, t);
      for (var n = 0; n < this.passes.length; n++)
        this.passes[n].setSize(e, t)
    }
  }),
  THREE.Pass = function() {
    this.enabled = !0,
      this.needsSwap = !0,
      this.clear = !1,
      this.renderToScreen = !1
  },
  Object.assign(THREE.Pass.prototype, {
    setSize: function(e, t) {},
    render: function(e, t, n, i, r) {
      console.error("THREE.Pass: .render() must be implemented in derived pass.")
    }
  });
var THREEx = THREEx || {};
THREEx.RendererStats = function() {
    var e = document.createElement("div");
    e.style.cssText = "width:80px;opacity:0.9;cursor:pointer";
    var t = document.createElement("div");
    t.style.cssText = "padding:0 0 3px 3px;text-align:left;background-color:#200;",
      e.appendChild(t);
    var n = document.createElement("div");
    n.style.cssText = "color:#f00;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px",
      n.innerHTML = "WebGLRenderer",
      t.appendChild(n);
    for (var i = [], r = 9, o = 0; o < r; o++)
      i[o] = document.createElement("div"),
      i[o].style.cssText = "color:#f00;background-color:#311;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px",
      t.appendChild(i[o]),
      i[o].innerHTML = "-";
    var a = Date.now();
    return {
      domElement: e,
      update: function(e) {
        if (console.assert(e instanceof THREE.WebGLRenderer),
          !(Date.now() - a < 1e3 / 30)) {
          a = Date.now();
          var t = 0;
          i[t++].textContent = "== Memory =====",
            i[t++].textContent = "Programs: " + e.info.memory.programs,
            i[t++].textContent = "Geometries: " + e.info.memory.geometries,
            i[t++].textContent = "Textures: " + e.info.memory.textures,
            i[t++].textContent = "== Render =====",
            i[t++].textContent = "Calls: " + e.info.render.calls,
            i[t++].textContent = "Vertices: " + e.info.render.vertices,
            i[t++].textContent = "Faces: " + e.info.render.faces,
            i[t++].textContent = "Points: " + e.info.render.points
        }
      }
    }
  },
  THREE.RenderPass = function(e, t, n, i, r) {
    THREE.Pass.call(this),
      this.scene = e,
      this.camera = t,
      this.overrideMaterial = n,
      this.clearColor = i,
      this.clearAlpha = void 0 !== r ? r : 0,
      this.clear = !0,
      this.needsSwap = !1
  },
  THREE.RenderPass.prototype = Object.assign(Object.create(THREE.Pass.prototype), {
    constructor: THREE.RenderPass,
    render: function(e, t, n, i, r) {
      var o = e.autoClear;
      e.autoClear = !1,
        this.scene.overrideMaterial = this.overrideMaterial;
      var a, s;
      this.clearColor && (a = e.getClearColor().getHex(),
          s = e.getClearAlpha(),
          e.setClearColor(this.clearColor, this.clearAlpha)),
        e.render(this.scene, this.camera, this.renderToScreen ? null : n, this.clear),
        this.clearColor && e.setClearColor(a, s),
        this.scene.overrideMaterial = null,
        e.autoClear = o
    }
  }),
  THREE.ShaderPass = function(e, t) {
    THREE.Pass.call(this),
      this.textureID = void 0 !== t ? t : "tDiffuse",
      e instanceof THREE.ShaderMaterial ? (this.uniforms = e.uniforms,
        this.material = e) : e && (this.uniforms = THREE.UniformsUtils.clone(e.uniforms),
        this.material = new THREE.ShaderMaterial({
          defines: e.defines || {},
          uniforms: this.uniforms,
          vertexShader: e.vertexShader,
          fragmentShader: e.fragmentShader
        })),
      this.camera = new THREE.OrthographicCamera((-1), 1, 1, (-1), 0, 1),
      this.scene = new THREE.Scene,
      this.quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), null),
      this.scene.add(this.quad)
  },
  THREE.ShaderPass.prototype = Object.assign(Object.create(THREE.Pass.prototype), {
    constructor: THREE.ShaderPass,
    render: function(e, t, n, i, r) {
      this.uniforms[this.textureID] && (this.uniforms[this.textureID].value = n.texture),
        this.quad.material = this.material,
        this.renderToScreen ? e.render(this.scene, this.camera) : e.render(this.scene, this.camera, t, this.clear)
    }
  }),
  THREE.CopyShader = {
    uniforms: {
      tDiffuse: {
        value: null
      },
      opacity: {
        value: 1
      }
    },
    vertexShader: ["varying vec2 vUv;", "void main() {", "vUv = uv;", "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),
    fragmentShader: ["uniform float opacity;", "uniform sampler2D tDiffuse;", "varying vec2 vUv;", "void main() {", "vec4 texel = texture2D( tDiffuse, vUv );", "gl_FragColor = opacity * texel;", "}"].join("\n")
  },

  CalculateNormals = {
    doAll: function(e) {
      for (var t = 0; t < e.children.length; ++t) {
        var n = e.children[t];
        n.geometry && (n.geometry.computeVertexNormals(!1),
            n.geometry.normalsNeedUpdate = !0),
          CalculateNormals.doAll(n)
      }
    }
  };


FindObject3D = {
  findByNamePartial: function(e, t, n) {
    void 0 === n && (n = []);
    for (var i = 0; i < e.children.length; ++i) {
      var r = e.children[i];
      r.name.indexOf(t) >= 0 && n.push(r),
        FindObject3D.findByNamePartial(r, t, n)
    }
    return n
  }
};



var highPerformance, mainProject, assetLibrary, debugMode = QueryString.debug && "0" !== QueryString.debug && "false" !== QueryString.debug;
window.onload = startUp,
  AssetLibrary = function(e) {
    this._numLoaded = 0,
      this._queue = [],
      this._assets = {},
      e && "/" != e.charAt(e.length - 1) && (e += "/"),
      this._basePath = e || "",
      this._onComplete = new Signal,
      this._onProgress = new Signal
  },
  AssetLibrary.Type = {
    JSON: 0,
    MODEL: 1,
    TEXTURE_2D: 2,
    TEXTURE_CUBE: 3,
    PLAIN_TEXT: 4
  },
  AssetLibrary.prototype = {
    get onComplete() {
      return this._onComplete
    },
    get onProgress() {
      return this._onProgress
    },
    get basePath() {
      return this._basePath
    },
    queueAsset: function(e, t, n, i) {
      this._queue.push({
        id: e,
        filename: this._basePath + t,
        type: n,
        parser: i
      })
    },
    load: function() {
      if (0 === this._queue.length)
        return void this.onComplete.dispatch();
      var e = this._queue[this._numLoaded];
      switch (e.type) {
        case AssetLibrary.Type.JSON:
          this._json(e.filename, e.id);
          break;
        case AssetLibrary.Type.MODEL:
          this._model(e.filename, e.id, e.parser);
          break;
        case AssetLibrary.Type.TEXTURE_2D:
          this._texture2D(e.filename, e.id);
          break;
        case AssetLibrary.Type.TEXTURE_CUBE:
          this._textureCube(e.filename, e.id);
          break;
        case AssetLibrary.Type.PLAIN_TEXT:
          this._plainText(e.filename, e.id)
      }
    },
    get: function(e) {
      return this._assets[e]
    },
    _json: function(e, t) {
      var n = this,
        i = new XMLHttpRequest;
      i.overrideMimeType("application/json"),
        i.open("GET", e, !0),
        i.onreadystatechange = function() {
          4 === i.readyState && "200" == i.status && (n._assets[t] = JSON.parse(i.responseText),
            n._onAssetLoaded())
        },
        i.send(null)
    },
    _plainText: function(e, t) {
      var n = this,
        i = new XMLHttpRequest;
      i.overrideMimeType("application/json"),
        i.open("GET", e, !0),
        i.onreadystatechange = function() {
          4 === i.readyState && "200" == i.status && (n._assets[t] = i.responseText,
            n._onAssetLoaded())
        },
        i.send(null)
    },
    _textureCube: function(e, t) {
      var n = this,
        i = new THREE.CubeTextureLoader;
      this._assets[t] = i.load([e + "posX.jpg", e + "negX.jpg", e + "posY.jpg", e + "negY.jpg", e + "negZ.jpg", e + "posZ.jpg"], function() {
          n._onAssetLoaded()
        }),
        this._assets[t].mapping = THREE.CubeReflectionMapping
    },
    _texture2D: function(e, t) {
      var n = this,
        i = new THREE.TextureLoader,
        r = this._assets[t] = i.load(e, function() {
          n._onAssetLoaded()
        });
      r.wrapS = THREE.RepeatWrapping,
        r.wrapT = THREE.RepeatWrapping,
        r.minFilter = THREE.LinearMipMapLinearFilter,
        r.magFilter = THREE.LinearFilter,
        highPerformance && (r.anisotropy = 16)
    },
    _model: function(e, t, n) {
      var i = this,
        r = new n;
      r.options = r.options || {},
        r.options.convertUpAxis = !0,
        r.load(e, function(e) {
          i._assets[t] = e,
            i._onAssetLoaded()
        })
    },
    _onAssetLoaded: function() {
      this._onProgress.dispatch(this._numLoaded / this._queue.length),
        ++this._numLoaded === this._queue.length ? this._onComplete.dispatch(this) : this.load()
    }
  },

  DebugAlphaMaterial = function(e) {
    var t = {
      map: {
        value: e
      }
    };
    THREE.ShaderMaterial.call(this, {
      uniforms: t,
      vertexShader: ShaderLibrary.get("debug_alpha_vertex"),
      fragmentShader: ShaderLibrary.get("debug_alpha_fragment")
    })
  },
  DebugAlphaMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype, {
    map: {
      get: function() {
        return this.uniforms.map.value
      },
      set: function(e) {
        this.uniforms.map.value = e
      }
    }
  }),
  DebugVec3Material = function(e) {
    var t = {
      map: {
        value: e
      }
    };
    THREE.ShaderMaterial.call(this, {
      uniforms: t,
      vertexShader: ShaderLibrary.get("debug_vec3_vertex"),
      fragmentShader: ShaderLibrary.get("debug_vec3_fragment")
    })
  },
  DebugVec3Material.prototype = Object.create(THREE.ShaderMaterial.prototype, {
    map: {
      get: function() {
        return this.uniforms.map.value
      },
      set: function(e) {
        this.uniforms.map.value = e
      }
    }
  }),

  UnlitMaterial = function(e) {
    e = e || {};
    var t = "";
    e.color && (e.color = new THREE.Color(e.color),
        e.color.convertGammaToLinear()),
      (e.fogDensity || e.fogColor) && (t += "#define FOG\n"),
      e.hdre && !e.blending && (t += "#define HDRE\n"),
      e.map && (t += "#define ALBEDO_MAP\n");
    var n = {
      color: {
        value: e.color || new THREE.Color(1, 1, 1)
      },
      albedoMap: {
        value: e.map
      },
      opacity: {
        value: void 0 === e.opacity ? 1 : e.opacity
      },
      fogDensity: {
        value: e.fogDensity || .1
      },
      fogColor: {
        value: e.fogColor
      }
    };
    THREE.ShaderMaterial.call(this, {
        uniforms: n,
        vertexShader: t + ShaderLibrary.get("unlit_vertex"),
        fragmentShader: t + ShaderLibrary.get("unlit_fragment")
      }),
      e.blending && (this.blending = e.blending,
        this.transparent = !0,
        e.blending === THREE.AdditiveBlending && e.hdre && (this.blending = THREE.CustomBlending,
          this.blendSrc = THREE.OneFactor,
          this.blendDst = THREE.OneFactor,
          this.blendSrcAlpha = THREE.ZeroFactor,
          this.blendDstAlpha = THREE.ZeroFactor),
        e.blending === THREE.NormalBlending && e.hdre && (this.blending = THREE.CustomBlending,
          this.blendEquation = THREE.AddEquation,
          this.blendSrc = THREE.SrcAlphaFactor,
          this.blendDst = THREE.OneMinusSrcAlphaFactor,
          this.blendSrcAlpha = THREE.ZeroFactor,
          this.blendDstAlpha = THREE.OneMinusSrcAlphaFactor,
          this.blendEquationAlpha = THREE.AddEquation))
  },
  UnlitMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype),




  SimpleThreeProject.prototype = {
    init: function(e, t, n) {
      this._options = n || {},
        this._options.alpha = this._options.alpha || !1,
        this._options.antialias = this._options.antialias || !1,
        this._options.preserveDrawingBuffer = this._options.preserveDrawingBuffer || !1,
        this.assetLibrary = t,
        this._initRenderer(),
        this._debugMode = e,
        e && this._initStats();
      var i = this;
      window.addEventListener("resize", function() {
          i._resizeCanvas()
        }, !1),
        this._content && this._content.init(this),
        this._initialized = !0,
        this._resizeCanvas()
    },
    get debugMode() {
      return this._debugMode
    },
    get content() {
      return this._content
    },
    set content(e) {
      this._time = null,
        this._content && this._content.destroy(),
        this._content = e,
        this._initialized && this._content.init(this),
        this._isRunning && this._content.start(),
        this._resizeCanvas()
    },
    _initRenderer: function() {
      var e = window.devicePixelRatio;
      this.renderer = new THREE.WebGLRenderer({
          antialias: this._options.antialias,
          stencil: this._options.stencil,
          alpha: this._options.alpha,
          preserveDrawingBuffer: this._options.preserveDrawingBuffer
        }),
        this.renderer.setPixelRatio(e),
        this.container = document.getElementById("webglcontainer"),
        this.scene = new THREE.Scene,
        this.camera = new THREE.PerspectiveCamera,
        this.camera.near = .1,
        this.camera.far = 100,
        this.scene.add(this.camera),
        this.container.appendChild(this.renderer.domElement)
    },
    _initStats: function() {
      this._stats = new Stats,
        this._stats.domElement.style.position = "absolute",
        this._stats.domElement.style.bottom = "0px",
        this._stats.domElement.style.right = "0px",
        this._stats.domElement.style.zIndex = 100,
        this.container.appendChild(this._stats.domElement),
        this._renderStats = new THREEx.RendererStats,
        this._renderStats.domElement.style.position = "absolute",
        this._renderStats.domElement.style.bottom = "0px",
        this._renderStats.domElement.style.zIndex = 100,
        this.container.appendChild(this._renderStats.domElement)
    },
    _resizeCanvas: function() {
      if (this.renderer) {
        var e = window.innerWidth,
          t = window.innerHeight;
        this.renderer.setSize(e, t),
          this.renderer.domElement.style.width = e + "px",
          this.renderer.domElement.style.height = t + "px",
          this.camera.aspect = e / t,
          this.camera.updateProjectionMatrix(),
          this._content && this._content.resize(this.renderer.domElement.width, this.renderer.domElement.height)
      }
    },
    stop: function() {
      this._isRunning = !1
    },
    start: function() {
      this._isRunning = !0,
        this._content && this._content.start(),
        this._requestAnimationFrame()
    },
    _render: function() {
      if (this._isRunning) {
        var e = (new Date).getTime(),
          t = 0;
        null !== this._time && (t = e - this._time),
          t *= this.timeScale,
          this._time = e,
          this._requestAnimationFrame(),
          Entity.ENGINE.update(t),
          this._content && this._content.update(t),
          this._content && this._content.effectComposer ? this._content.effectComposer.render(t / 1e3) : this.renderer.render(this.scene, this.camera),
          this._stats && (this._renderStats.update(this.renderer),
            this._stats.update())
      }
    },
    _requestAnimationFrame: function() {
      var e = this;
      requestAnimationFrame(function() {
        e._render()
      })
    }
  },


  SPHWallCollider.prototype = Object.create(SPHCollider.prototype),
  SPHWallColliderMaterial = function() {
    THREE.ShaderMaterial.call(this, {
      uniforms: {
        numCells: {
          value: null
        },
        cellSize: {
          value: 0
        },
        wallExtent: {
          value: null
        }
      },
      vertexShader: ShaderLibrary.get("sph_quad_vertex"),
      fragmentShader: ShaderLibrary.getInclude("distance_functions") + ShaderLibrary.get("sph_wall_collider_fragment")
    })
  },
  SPHWallColliderMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype),



  setTimeout(() => {
    start(SPH.Quality.LOW, SPHContent.BALL_MODE)
  }, 100);
