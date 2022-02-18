function AsyncTaskQueue() {
  this.onComplete = new Signal,
    this.onProgress = new Signal,
    this._queue = [],
    this._childQueues = [],
    this._currentIndex = 0,
    this._isRunning = !1
}

function DoubleBufferTexture(e, t, n) {
  this._width = e,
    this._height = t,
    this._sourceFBO = new THREE.WebGLRenderTarget(e, t, n),
    this._targetFBO = new THREE.WebGLRenderTarget(e, t, n),
    this._sourceFBO.texture.generateMipmaps = n.generateMipmaps || !1,
    this._targetFBO.texture.generateMipmaps = n.generateMipmaps || !1
}

function isPlatformMobile() {
  var e = /AppleWebKit/.test(navigator.userAgent) && /Mobile\/\w+/.test(navigator.userAgent);
  return e || /Android|webOS|BlackBerry|Opera Mini|Opera Mobi|IEMobile/i.test(navigator.userAgent)
}

function RectRenderer(e, t) {
  this._renderer = e,
    this._scene = new THREE.Scene,
    this._camera = new THREE.OrthographicCamera((-1), 1, 1, (-1), 0, 1),
    this._mesh = t || new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), null),
    this._scene.add(this._mesh)
}

function TripleBufferTexture(e, t, n) {
  this._width = e,
    this._height = t,
    this._storedFBO = new THREE.WebGLRenderTarget(e, t, n),
    this._sourceFBO = new THREE.WebGLRenderTarget(e, t, n),
    this._targetFBO = new THREE.WebGLRenderTarget(e, t, n),
    this._storedFBO.texture.generateMipmaps = n.generateMipmaps || !1,
    this._sourceFBO.texture.generateMipmaps = n.generateMipmaps || !1,
    this._targetFBO.texture.generateMipmaps = n.generateMipmaps || !1
}

function SPHCollider(e) {
  this._target = null,
    this._invalid = !0,
    this._material = e
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

function SceneDepthRenderer(e, t, n) {
  this._renderer = t,
    this._scene = e,
    this._scale = n || 1,
    this._depthMaterial = new LinearDepthMaterial
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

function SPHContent(e, t) {
  this._quality = t,
    this._mode = void 0 === e ? SPHContent.BALL_MODE : e
}

function Skybox(e, t) {
  t = t || 1e3;
  var n = new THREE.BoxGeometry(t, t, t);
  n.scale(-1, 1, 1);
  var i = new SkyMaterial({
    envMap: e
  });
  THREE.Mesh.call(this, n, i)
}

function SPHDistanceFieldRenderer(e, t) {
  this._renderer = e,
    this._sph = t,
    this._numCells = t._numCells,
    this._cellSize = t.cellSize,
    this._zRange = Math.ceil(t.particleRadius / this._cellSize);
  var n = FloatTex.getHalfOrFloat(e);
  this._distanceField = new THREE.WebGLRenderTarget(this._numCells.x * this._numCells.z, this._numCells.y, {
      type: n,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      generateMipmaps: !1,
      depthBuffer: !1,
      stencilBuffer: !1,
      format: THREE.RGBAFormat
    }),
    this._material = new SPHDistanceMaterial(t),
    this._pointRenderer = new RectRenderer(e, new THREE.Points(t.pointGeometry))
}

function ParticleBlurredRenderer(e, t, n, i, r) {
  this._textureType = r,
    this._renderer = e,
    this._scale = t || 1,
    n.defines.KERNEL_RADIUS = i,
    n.defines.NUM_WEIGHTS = i + 1,
    this._blurMaterial = new THREE.ShaderMaterial(n),
    this._blurMaterial.uniforms.weights.value = this._getGaussian(i),
    this._blurMaterial.depthTest = !1,
    this._blurMaterial.depthWrite = !1,
    this._rectRenderer = new RectRenderer(e),
    this.resize(window.innerWidth, window.innerHeight)
}

function ParticleDepthRenderer(e, t, n, i, r) {
  this._scene = e,
    this._particleSim = n,
    this._pointRenderer = new RectRenderer(t, new THREE.Points(n.pointGeometry)),
    this._depthMaterial = new ParticleDepthMaterial,
    this._depthMaterial.particleSize = n.particleRadius,
    r = void 0 === r ? 6 : r,
    ParticleBlurredRenderer.call(this, t, i, BilateralGaussianBlurShader, r)
}

function SPH(e, t, n, i, r, o, a, s) {
  this._setup = o,
    this._quality = s || SPH.Quality.LOW,
    this._volume = r,
    this._maxParticles = i,
    this._boxSize = new THREE.Vector3(e, t, n),
    this._restDensity = 998.29,
    this._particleMass = this._restDensity * r / this._maxParticles,
    this._smoothingRadius = Math.pow(3 * r * 20 / (4 * Math.PI * this._maxParticles), 1 / 3),
    this._cellSize = this._smoothingRadius / 2,
    this._particleRadius = .5 * Math.pow(3 * this._particleMass / (4 * Math.PI * this._restDensity), 1 / 3),
    this._restDistance = .1 * this._smoothingRadius,
    this._numCells = new THREE.Vector3(Math.ceil(e / this._cellSize), Math.ceil(t / this._cellSize), Math.ceil(n / this._cellSize)),
    this._halfExtent = this._boxSize.clone(),
    this._halfExtent.multiplyScalar(.5),
    this._halfExtent.x -= this._cellSize,
    this._halfExtent.y -= this._cellSize,
    this._halfExtent.z -= this._cellSize,
    this.viscosity = 3.5,
    this.stiffness = 3,
    this.surfaceTension = .0728,
    this.curvatureThreshold = 7.065,
    this.gravity = -9.81,
    this._numParticles = this._setup.getStartParticleCount(i),
    this._renderer = a,
    this._setup.collider.init(this, this._renderer),
    this._particleBufferSize = new THREE.Vector2(1024, Math.ceil(i / 1024)),
    this._bucketPixelSize = new THREE.Vector2(1 / (this._numCells.x * this._numCells.z), 1 / this._numCells.y),
    this._positionBuffer = new DoubleBufferTexture(this._particleBufferSize.x, this._particleBufferSize.y, this._rtOptions()),
    this._bucketBuffer = new THREE.WebGLRenderTarget(this._numCells.x * this._numCells.z, this._numCells.y, this._rtOptions(!0)),
    this._densityBuffer = new THREE.WebGLRenderTarget(this._particleBufferSize.x, this._particleBufferSize.y, this._rtOptions()),
    this._accelBuffer = new DoubleBufferTexture(this._particleBufferSize.x, this._particleBufferSize.y, this._rtOptions()),
    this._velocityBuffer = new DoubleBufferTexture(this._particleBufferSize.x, this._particleBufferSize.y, this._rtOptions()),
    this._bucketMaterial = new SPHBucketMaterial(this),
    this._densityMaterial = new SPHDensityMaterial(this),
    this._accelMaterial = new SPHAccelMaterial(this),
    this._velocityMaterial = new SPHVelocityMaterial(this),
    this._positionMaterial = new SPHPositionMaterial(this),
    this._pointGeometry = this._createPointGeometry(),
    this._renderPoints = new RectRenderer(a, new THREE.Points(this._pointGeometry)),
    this._renderRect = new RectRenderer(a),
    this._renderRect.clear(this._densityBuffer),
    this.reset()
}

function SPHBallCollider() {
  var e = new SPHBallColliderMaterial;
  SPHCollider.call(this, e)
}

function SPHBallSetup() {
  this.collider = new SPHBallCollider
}

function SPHCascadeSetup(e) {
  this.collider = new SPHHeightMapCollider(e)
}

function SPHHeightMapCollider(e) {
  var t = new SPHHeightMapColliderMaterial(e);
  SPHCollider.call(this, t)
}

function SPHWallCollider() {
  var e = new SPHWallColliderMaterial;
  SPHCollider.call(this, e)
}

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

function VolumetricLightRenderer(e, t, n, i, r, o) {
  this._target = new THREE.WebGLRenderTarget(t.x * t.z * o, t.y * o, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      generateMipmaps: !1,
      depthBuffer: !1,
      stencilBuffer: !1,
      format: THREE.RGBAFormat
    }),
    this._renderer = e,
    this._scene = new THREE.Scene,
    this._rectRenderer = new RectRenderer(e),
    this._material = new VolumetricLighting(t, n, i, r)
}

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

function VolumetricNormalsRenderer(e, t, n, i) {
  this._renderer = e,
    this._scene = new THREE.Scene,
    this._camera = new THREE.OrthographicCamera((-1), 1, 1, (-1), 0, 1),
    this._material = new VolumetricNormals(t, n, i),
    this._quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), this._material),
    this._scene.add(this._quad)
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
  AsyncTaskQueue.prototype = {
    queue: function(e, t) {
      var n = 1 === arguments.length ? [arguments[0]] : Array.apply(null, arguments);
      this._queue.push({
        func: e,
        args: n.slice(1)
      })
    },
    addChildQueue: function(e) {
      this._childQueues.push(e)
    },
    execute: function() {
      if (this._isRunning)
        throw new Error("Already running!");
      this._isRunning = !0,
        this._currentIndex = 0,
        this._executeTask()
    },
    _executeTask: function() {
      setTimeout(this._executeImpl.bind(this))
    },
    _executeImpl: function() {
      if (this.onProgress.dispatch(this._currentIndex / this._queue.length),
        this._childQueues.length > 0) {
        var e = this._childQueues.shift();
        e.onComplete.bind(this._executeImpl, this),
          e.execute()
      } else if (this._queue.length === this._currentIndex)
        this.onComplete.dispatch();
      else {
        var t = this._queue[this._currentIndex];
        t.func.apply(this, t.args),
          ++this._currentIndex,
          this._executeTask()
      }
    }
  },
  Axes = function() {
    THREE.Object3D.call(this),
      this._init()
  },
  Axes.prototype = Object.create(THREE.Object3D.prototype),
  Axes.prototype._init = function() {
    var e = new THREE.CylinderBufferGeometry(.01, .01, 1);
    e.translate(0, .5, 0);
    var t = new THREE.Mesh(e, new UnlitMaterial({
        color: 16711680
      })),
      n = new THREE.Mesh(e, new UnlitMaterial({
        color: 65280
      })),
      i = new THREE.Mesh(e, new UnlitMaterial({
        color: 255
      }));
    t.rotation.z = .5 * -Math.PI,
      i.rotation.x = .5 * Math.PI,
      this.add(t),
      this.add(n),
      this.add(i)
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
var CopyDataToRenderTarget = {
  execute: function(e, t, n, i) {
    var r = new RectRenderer(n),
      o = t.texture;
    i = i || o.type;
    var a = new THREE.DataTexture(e, t.width, t.height, o.format, i, null, THREE.CLAMP_TO_EDGE, THREE.CLAMP_TO_EDGE, THREE.NearestFilter, THREE.NearestFilter, 0);
    a.needsUpdate = !0;
    var s = new THREE.ShaderMaterial(THREE.CopyShader);
    s.uniforms.tDiffuse.value = a,
      r.execute(s, t)
  }
};
DoubleBufferTexture.prototype = {
    get width() {
      return this._width
    },
    get height() {
      return this._height
    },
    get source() {
      return this._sourceFBO.texture
    },
    get target() {
      return this._targetFBO
    },
    swap: function() {
      var e = this._sourceFBO;
      this._sourceFBO = this._targetFBO,
        this._targetFBO = e
    }
  },
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
var FloatTex = {
    getHalfOrFloat: function(e) {
      var t = e.extensions;
      if (t.get("OES_texture_half_float_linear"))
        return THREE.HalfFloatType;
      if (t.get("OES_texture_float_linear"))
        return THREE.FloatType;
      throw new Error("Float render targets are unsupported!")
    }
  },
  QueryString = function() {
    for (var e = {}, t = window.location.search.substring(1), n = t.split("&"), i = 0; i < n.length; i++) {
      var r = n[i].split("=");
      if ("undefined" == typeof e[r[0]])
        e[r[0]] = decodeURIComponent(r[1]);
      else if ("string" == typeof e[r[0]]) {
        var o = [e[r[0]], decodeURIComponent(r[1])];
        e[r[0]] = o
      } else
        e[r[0]].push(decodeURIComponent(r[1]))
    }
    return e
  }(),
  Random = {
    inRange: function(e, t) {
      return e + Math.floor(Math.random() * (t - e))
    },
    element: function(e) {
      return e[Random.inRange(0, e.length)]
    }
  };
RectRenderer.prototype = {
    execute: function(e, t, n, i) {
      var r = this._renderer.autoClear;
      this._renderer.autoClear = void 0 === n || n,
        this._mesh.material = e,
        this._renderer.render(this._scene, i || this._camera, t),
        this._renderer.autoClear = r
    },
    clear: function(e) {
      this._renderer.setRenderTarget(e),
        this._renderer.clear()
    }
  },
  Signal = function() {
    this._listeners = [],
      this._lookUp = {}
  },
  Signal.prototype = {
    bind: function(e, t) {
      this._lookUp[e] = this._listeners.length;
      var n = t ? e.bind(t) : e;
      this._listeners.push(n)
    },
    unbind: function(e) {
      var t = this._lookUp[e];
      this._listeners.splice(t, 1),
        delete this._lookUp[e]
    },
    dispatch: function(e) {
      for (var t = this._listeners.length, n = 0; n < t; ++n)
        this._listeners[n](e)
    },
    get hasListeners() {
      return this._listeners.length > 0
    }
  },
  SwapMaterials = {
    setAll: function(e, t) {
      for (var n = 0; n < e.children.length; ++n) {
        var i = e.children[n];
        i.material = t,
          SwapMaterials.setAll(i, t)
      }
    },
    swapSelect: function(e, t) {
      for (var n = 0; n < e.children.length; ++n) {
        var i = e.children[n];
        t.hasOwnProperty(i.name) && (i.material = t[i.name]),
          SwapMaterials.swapSelect(i, t)
      }
    },
    swapSelectPartialMatch: function(e, t) {
      for (var n = 0; n < e.children.length; ++n) {
        var i = e.children[n];
        for (var r in t)
          t.hasOwnProperty(r) && i.name.indexOf(r) >= 0 && (i.material = t[r]);
        SwapMaterials.swapSelect(i, t)
      }
    }
  },
  TripleBufferTexture.prototype = {
    get width() {
      return this._width
    },
    get height() {
      return this._height
    },
    get stored() {
      return this._storedFBO.texture
    },
    get source() {
      return this._sourceFBO.texture
    },
    get target() {
      return this._targetFBO
    },
    store: function() {
      var e = this._storedFBO;
      this._storedFBO = this._targetFBO,
        this._targetFBO = e
    },
    swap: function() {
      var e = this._sourceFBO;
      this._sourceFBO = this._targetFBO,
        this._targetFBO = e
    }
  },
  ShaderLibrary = {
    get: function(e) {
      return ShaderLibrary.getInclude("include_common") + ShaderLibrary.getInclude("include_sph") + ShaderLibrary[e + ".glsl"]
    },
    getInclude: function(e) {
      return ShaderLibrary[e + ".glsl"] + "\n"
    }
  },
  EntityEngine = function() {
    this._updateableEntities = [],
      this._updateQueue = [],
      this._destroyQueue = []
  },
  EntityEngine.prototype = {
    registerEntity: function(e) {
      e._onRequireUpdatesChange.bind(this._onEntityUpdateChange, this),
        e._requiresUpdates && this._addUpdatableEntity(e)
    },
    unregisterEntity: function(e) {
      e._onRequireUpdatesChange.unbind(this),
        e._requiresUpdates && this._removeUpdatableEntity(e)
    },
    destroyEntity: function(e) {
      e._onRequireUpdatesChange.unbind(this),
        e._requiresUpdates && this._removeUpdatableEntity(e),
        this._destroyQueue.push(e)
    },
    _onEntityUpdateChange: function(e) {
      e._requiresUpdates ? this._addUpdatableEntity(e) : this._removeUpdatableEntity(e)
    },
    _addUpdatableEntity: function(e) {
      this._updateQueue.push({
        entity: e,
        updatable: !0
      })
    },
    _removeUpdatableEntity: function(e) {
      this._updateQueue.push({
        entity: e,
        updatable: !1
      })
    },
    _processUpdateQueue: function() {
      var e = this._updateQueue.length;
      if (0 !== e) {
        for (var t = 0; t < e; ++t) {
          var n = this._updateQueue[t],
            i = n.entity;
          if (n.updatable)
            this._updateableEntities.push(i);
          else {
            var r = this._updateableEntities.indexOf(i);
            this._updateableEntities.splice(r, 1)
          }
        }
        this._updateQueue = []
      }
    },
    _processDestroyQueue: function() {
      var e = this._destroyQueue.length;
      if (0 !== e) {
        for (var t = 0; t < e; ++t) {
          var n = this._destroyQueue[t];
          delete n._components,
            delete n._requiresUpdates,
            delete n._onRequireUpdatesChange,
            delete n._update,
            delete n._updateRequiresUpdates
        }
        this._destroyQueue = []
      }
    },
    update: function(e) {
      this._processUpdateQueue(),
        this._processDestroyQueue();
      for (var t = this._updateableEntities, n = t.length, i = 0; i < n; ++i)
        t[i]._update(e)
    }
  },
  Component = function() {
    this._entity = null
  },
  Component.prototype = {
    onAdded: function() {},
    onRemoved: function() {},
    onUpdate: null,
    get entity() {
      return this._entity
    }
  },
  Entity = {
    ENGINE: new EntityEngine,
    isEntity: function(e) {
      return !!e._components
    },
    convert: function(e) {
      Entity.isEntity(e) || (EntityPrototype._init(e),
        Entity.ENGINE.registerEntity(e))
    },
    destroy: function(e) {
      Entity.ENGINE.destroyEntity(e)
    },
    addComponents: function(e, t) {
      for (var n = 0; n < t.length; ++n)
        Entity.addComponent(e, t[n])
    },
    removeComponents: function(e, t) {
      for (var n = 0; n < t.length; ++n)
        Entity.removeComponent(e, t[n])
    },
    addComponent: function(e, t) {
      if (t._entity)
        throw new Error("Component already added to an entity!");
      Entity.convert(e),
        e._components.push(t),
        e._updateRequiresUpdates(this._requiresUpdates || !!t.onUpdate),
        t._entity = e,
        t.onAdded()
    },
    hasComponent: function(e, t) {
      return e._components && e._components.indexOf(t) >= 0
    },
    removeComponent: function(e, t) {
      if (!Entity.hasComponent(e, t))
        throw new Error("Component wasn't added to this entity!");
      t.onRemoved();
      for (var n = !1, i = e._components.length, r = 0, o = [], a = 0; a < i; ++a) {
        var s = e._components[a];
        s !== t && (o[r++] = s,
          n = n || !!t.onUpdate)
      }
      e._components = 0 === r ? null : o,
        t._entity = null,
        e._updateRequiresUpdates(n)
    }
  },
  EntityPrototype = {
    _init: function(e) {
      e._components = [],
        e._requiresUpdates = !1,
        e._onRequireUpdatesChange = new Signal,
        e._update = function(e) {
          var t = this._components;
          if (t)
            for (var n = t.length, i = 0; i < n; ++i) {
              var r = t[i];
              r.onUpdate && r.onUpdate(e)
            }
        },
        e._updateRequiresUpdates = function(e) {
          e !== this._requiresUpdates && (this._requiresUpdates = e,
            this._onRequireUpdatesChange.dispatch(this))
        }
    }
  },
  ShaderLibrary["distance_functions.glsl"] = "// Iñigo Quilez's distance functions: http://iquilezles.org/www/articles/distfunctions/distfunctions.htm\n\nfloat signedDistanceBox(vec3 pos, vec3 halfExtent)\n{\n    vec3 d = abs(pos) - halfExtent;\n    return min(max(d.x,max(d.y,d.z)),0.0) + length(max(d, 0.0));\n}\n\n// same as box, but inverted\nfloat signedDistanceWalls(vec3 pos, vec3 halfExtent)\n{\n    return -signedDistanceBox(pos, halfExtent);\n}\n\nfloat signedDistanceSphere(vec3 p, vec3 c, float r)\n{\n  return distance(p, c) - r;\n}",
  ShaderLibrary["include_common.glsl"] = "vec4 encodeHDRE(vec3 color)\n{\n#ifdef HDRE\n    float maxValue = max(max(color.r, color.g), color.b) + .01;\n    float e = floor(max(log(maxValue), 0.0));\n    color /= exp(e);\n    return vec4(color, e / 5.0);\n#else\n    return vec4(color, 1.0);\n#endif\n}\n\nvec3 decodeHDRE(vec4 hdre)\n{\n#ifdef HDRE\n    float e = hdre.a * 5.0;\n    hdre.xyz *= exp(e);\n    return hdre.xyz;\n#else\n    return hdre.xyz;\n#endif\n}\n\nfloat luminance(vec3 color)\n{\n    return dot(color, vec3(.30, 0.59, .11));\n}\n\nfloat luminance(vec4 color)\n{\n    return luminance(color.xyz);\n}\n\nfloat linearStep(float lower, float upper, float x)\n{\n    return clamp((x - lower) / (upper - lower), 0.0, 1.0);\n}\n\n// Only for 0 - 1\nvec4 floatToRGBA8(float value)\n{\n    vec4 enc = value * vec4(1.0, 255.0, 65025.0, 16581375.0);\n    // cannot fract first value or 1 would not be encodable\n    enc.yzw = fract(enc.yzw);\n    return enc - enc.yzww * vec4(1.0/255.0, 1.0/255.0, 1.0/255.0, 0.0);\n}\n\nfloat RGBA8ToFloat(vec4 rgba)\n{\n    return dot(rgba, vec4(1.0, 1.0/255.0, 1.0/65025.0, 1.0/16581375.0));\n}\n\nvec2 floatToRG8(float value)\n{\n    vec2 enc = vec2(1.0, 255.0) * value;\n    enc.y = fract(enc.y);\n    enc.x -= enc.y / 255.0;\n    return enc;\n}\n\nfloat RG8ToFloat(vec2 rg)\n{\n    return dot(rg, vec2(1.0, 1.0/255.0));\n}\n\nvec3 intersectCubeMap(vec3 rayOrigin, vec3 rayDir, float cubeSize)\n{\n    vec3 t = (cubeSize * sign(rayDir) - rayOrigin) / rayDir;\n    float minT = min(min(t.x, t.y), t.z);\n    return rayOrigin + minT * rayDir;\n}",
  ShaderLibrary["bilat_gaussian_blur_fragment.glsl"] = "uniform sampler2D tDiffuse;\n\nvarying vec2 vUv;\n\nuniform vec2 sampleStep;\nuniform float weights[NUM_WEIGHTS];\nuniform float depthRange;\n\nfloat getWeight(float depth, float refDepth, float baseWeight)\n{\n//    return abs(refDepth - depth) < depthRange? baseWeight: 0.0;\n    float diff = abs(refDepth - depth) / depthRange;\n    float weight = max(1.0 - diff, 0.0);\n//    weight = pow(weight, .001);\n    return baseWeight * weight;\n}\n\nvoid main()\n{\n    float total = weights[0];\n    float center = RGBA8ToFloat(texture2D(tDiffuse, vUv));\n    float val = center * weights[0];\n\n    for (int i = 1; i <= KERNEL_RADIUS; ++i) {\n        vec2 offset = float(i) * sampleStep;\n        float samp = RGBA8ToFloat(texture2D(tDiffuse, vUv + offset));\n        float weight = getWeight(samp, center, weights[i]);\n        val += samp * weight;\n        total += weight;\n\n        samp = RGBA8ToFloat(texture2D(tDiffuse, vUv - offset));\n        weight = getWeight(samp, center, weights[i]);\n        val += samp * weight;\n        total += weight;\n    }\n\n    gl_FragColor = floatToRGBA8(val / total);\n}\n",
  ShaderLibrary["gaussian_blur_enc_float_fragment.glsl"] = "uniform sampler2D tDiffuse;\n\nvarying vec2 vUv;\n\nuniform vec2 sampleStep;\nuniform float weights[NUM_WEIGHTS];\n\nvoid main()\n{\n    vec3 col = decodeHDRE(texture2D(tDiffuse, vUv)) * weights[0];\n\n    for (int i = 1; i <= KERNEL_RADIUS; ++i) {\n        vec2 offset = float(i) * sampleStep;\n        col += (decodeHDRE(texture2D(tDiffuse, vUv + offset)) + decodeHDRE(texture2D(tDiffuse, vUv - offset))) * weights[i];\n    }\n\n    gl_FragColor = encodeHDRE(col);\n}\n",
  ShaderLibrary["gaussian_blur_fragment.glsl"] = "uniform sampler2D tDiffuse;\n\nvarying vec2 vUv;\n\nuniform vec2 sampleStep;\nuniform float weights[NUM_WEIGHTS];\n\nvoid main()\n{\n    vec4 val = texture2D(tDiffuse, vUv) * weights[0];\n\n    for (int i = 1; i <= KERNEL_RADIUS; ++i) {\n        vec2 offset = float(i) * sampleStep;\n        val += (texture2D(tDiffuse, vUv + offset) + texture2D(tDiffuse, vUv - offset)) * weights[i];\n    }\n\n    gl_FragColor = val;\n}\n",
  ShaderLibrary["post_vertex.glsl"] = "varying vec2 vUv;\n\nvoid main()\n{\n    gl_Position = vec4(position, 1.0);\n    vUv = uv;\n}\n",
  ShaderLibrary["post_z_vertex.glsl"] = "varying vec2 texCoords;\nvarying vec3 viewVector;\n\nuniform mat4 unprojectionMatrix;\n\nvoid main()\n{\n    gl_Position = vec4(position, 1.0);\n    texCoords = uv;\n    vec4 unproj = unprojectionMatrix * vec4(position.xy, 0.0, 1.0);\n    unproj /= unproj.w;\n    viewVector = -unproj.xyz / unproj.z;\n}\n",
  ShaderLibrary["debug_alpha_fragment.glsl"] = "varying vec2 texCoords;\nuniform sampler2D map;\n\nvoid main() {\n    vec4 samp = texture2D(map, texCoords);\n    gl_FragColor = vec4(samp.www, 1.0);\n}\n",
  ShaderLibrary["debug_alpha_vertex.glsl"] = "varying vec2 texCoords;\n\nvoid main() {\n    vec3 localPos = position;\n    vec4 viewPos = modelViewMatrix * vec4(localPos, 1.0);\n    gl_Position = projectionMatrix * viewPos;\n    texCoords = uv;\n}",
  ShaderLibrary["debug_vec3_fragment.glsl"] = "varying vec2 texCoords;\nuniform sampler2D map;\n\nvoid main() {\n    vec4 samp = texture2D(map, texCoords);\n    gl_FragColor = vec4(samp.xyz /** .5 + .5*/, 1.0);\n}\n",
  ShaderLibrary["debug_vec3_vertex.glsl"] = "varying vec2 texCoords;\n\nvoid main() {\n    vec3 localPos = position;\n    vec4 viewPos = modelViewMatrix * vec4(localPos, 1.0);\n    gl_Position = projectionMatrix * viewPos;\n    texCoords = uv;\n}",
  ShaderLibrary["dielectric_fragment.glsl"] = "#define MIN_VARIANCE -0.0001\n#define LIGHT_BLEED_REDUCTION .5\n\nvarying vec3 worldPosition;\nvarying vec3 viewPosition;\nvarying vec3 worldNormal;\n\n#if defined(SSAO_MAP) || defined(ALBEDO_MAP) || defined(NORMAL_MAP) || defined(ROUGHNESS_MAP) || defined(EMISSION_MAP)\nvarying vec2 texCoords;\n#endif\n\n#ifdef SSAO_MAP\nvarying vec4 projection;\nuniform sampler2D ssaoMap;\n#endif\n\nuniform float shadowMapSize;\nuniform float shadowMapPixelSize;\n\n#ifdef SHADOW_MAP\nuniform sampler2D shadowMap;\n\nvarying vec4 shadowCoord;\n\n#ifdef PCF_SHADOW_MAP\nuniform vec2 shadowOffsets[NUM_SHADOW_SAMPLES]; // w contains bias\n#endif\n#endif\n\n\n#ifdef ALBEDO_MAP\nuniform sampler2D albedoMap;\n\n#ifdef ALBEDO_MAP_2\nuniform sampler2D albedoMap2;\nuniform float albedoBlend;\n#endif\n\n#endif\n\nuniform vec3 color;\n\nuniform float roughness;\nuniform float normalSpecularReflection;\n\n#ifdef NORMAL_MAP\nuniform sampler2D normalMap;\n#endif\n\n#ifdef ROUGHNESS_MAP\nuniform sampler2D roughnessMap;\nuniform float roughnessMapRange;\n#endif\n\n#ifdef EMISSION_MAP\nuniform sampler2D emissionMap;\n#endif\n\nuniform vec3 emissionColor;\n\n#ifdef AMBIENT_OCCLUSION_MAP\nuniform sampler2D aoMap;\nvarying vec2 texCoords2;\n#endif\n\n#ifdef LOCAL_SKYBOX\n// this could also be applied to irradiance map\nuniform vec3 skyboxPosition;\nuniform float skyboxSize;\n#endif\n\n#ifdef SPECULAR_PROBE\nuniform samplerCube specularProbe;\nuniform vec3 specularProbeColor;\n#endif\n\n#ifdef FOG_PROBE\nuniform samplerCube fogProbe;\nuniform float fogProbeBoost;\n#endif\n\n#ifdef IRRADIANCE_PROBE\nuniform samplerCube irradianceProbe;\nuniform float irradianceProbeBoost;\n#endif\n\n// internal\nuniform vec3 ambientLightColor;\n\nuniform float alpha;\n\n#ifdef FOG\nuniform float fogDensity;\nuniform vec3 fogColor;\n#endif\n\n#if NUM_POINT_LIGHTS > 0\nstruct PointLight {\n    vec3 position;\n    vec3 color;\n    float distance;\n    float decay;\n    int shadow;\n    float shadowBias;\n    float shadowRadius;\n    vec2 shadowMapSize;\n};\n\nuniform PointLight pointLights[ NUM_POINT_LIGHTS ];\n#endif\n\n#if NUM_DIR_LIGHTS > 0\nstruct DirectionalLight {\n    vec3 direction;\n    vec3 color;\n    int shadow;\n    float shadowBias;\n    float shadowRadius;\n    vec2 shadowMapSize;\n};\nuniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];\n#endif\n\n#ifdef NORMAL_MAP\nvec3 perturbNormal2Arb(vec3 position, vec3 worldNormal, vec3 normalSample)\n{\n    vec3 q0 = dFdx( position.xyz );\n    vec3 q1 = dFdy( position.xyz );\n    vec2 st0 = dFdx( texCoords.st );\n    vec2 st1 = dFdy( texCoords.st );\n    vec3 S = normalize( q0 * st1.t - q1 * st0.t );\n    vec3 T = normalize( -q0 * st1.s + q1 * st0.s );\n    vec3 N = normalize( worldNormal );\n    mat3 tsn = mat3( S, T, N );\n    return normalize( tsn * normalSample );\n}\n#endif\n\nvec3 getNormal()\n{\n#if defined(NORMAL_MAP)\n    vec4 normalSample = texture2D( normalMap, texCoords );\n    vec3 normal = normalSample.xyz * 2.0 - 1.0;\n    #ifdef OBJECT_NORMALS\n    return normalize(normal);\n    #endif\n    return perturbNormal2Arb(worldPosition, worldNormal, normal);\n#else\n    #ifdef FACE_NORMALS\n        vec3 q0 = dFdx( worldPosition.xyz );\n        vec3 q1 = dFdy( worldPosition.xyz );\n        return normalize(cross(q0, q1));\n    #else\n        return normalize(worldNormal);\n    #endif\n#endif\n}\n\n#ifdef VSM_SHADOW_MAP\nvec2 getVSMMoments(vec2 uv)\n{\n    vec4 s = texture2D(shadowMap, uv);\n    #ifdef VSM_FLOAT\n    return s.xy;\n    #else\n    return vec2(RG8ToFloat(s.xy), RG8ToFloat(s.zw));\n    #endif\n}\n#endif\n\nfloat getShadow() {\n#ifdef SHADOW_MAP\n\n    #ifdef PCF_SHADOW_MAP\n        #if NUM_SHADOW_SAMPLES > 1\n        float shadow = 0.0;\n        for (int i = 0; i < NUM_SHADOW_SAMPLES; ++i) {\n            // pseudo random\n            #ifdef DITHER_SHADOW\n            float angle = fract (sin((gl_FragCoord.x + 0.5) * (gl_FragCoord.y + 1.0)) * 43758.5453123) * 3.1415 * 2.0;\n            float c = cos(angle);\n            float s = sin(angle);\n            vec2 offset;\n            offset.x = c * shadowOffsets[i].x - s * shadowOffsets[i].y;\n            offset.y = s * shadowOffsets[i].x + c * shadowOffsets[i].y;\n            #else\n            vec2 offset = shadowOffsets[i];\n            #endif\n\n            float occlDepth = RGBA8ToFloat(texture2D(shadowMap, shadowCoord.xy + offset));\n            float diff = shadowCoord.z - occlDepth;\n            shadow += float(diff <= 0.0);\n        }\n\n        shadow *= RCP_NUM_SHADOW_SAMPLES;\n        #else\n            float occlDepth = RGBA8ToFloat(texture2D(shadowMap, shadowCoord.xy));\n            float diff = shadowCoord.z - occlDepth;\n            float shadow = float(diff <= 0.0);\n        #endif\n    #endif\n\n    #ifdef VSM_SHADOW_MAP\n\n// the moments seem correct on ipad... why do the calculations differ?\n        vec2 moments = getVSMMoments(shadowCoord.xy);\n        float p = linearStep(shadowCoord.z - 0.02, shadowCoord.z, moments.x);\n        float variance = moments.y - moments.x * moments.x;\n        variance = max(variance, MIN_VARIANCE);\n\n        float diff = shadowCoord.z - moments.x;\n        float upperBound = variance / (variance + diff*diff);\n        float shadow = linearStep(LIGHT_BLEED_REDUCTION, 1.0, upperBound);\n        shadow = clamp(max(shadow, p), 0.0, 1.0);\n    #endif\n\n    vec2 edges = abs(shadowCoord.xy * 2.0 - 1.0);\n    float edge = max(edges.x, edges.y);\n    edge = linearStep(.8, 1.0, edge);\n    shadow = mix(shadow, 1.0, edge);\n    return shadow;\n#else\n    return 1.0;\n#endif\n}\n\nfloat fresnel(float NdotL, float lowProfileDefault)\n{\n#ifdef PERFORMANCE_PROFILE_HIGH\n// angle to the power of 5\n    float angle = 1.0 - NdotL;\n    float fresnelFactor = angle * angle;\n    fresnelFactor *= fresnelFactor;\n    fresnelFactor *= angle;\n    return normalSpecularReflection + (1.0 - normalSpecularReflection) * fresnelFactor;\n#else\n    return lowProfileDefault;\n#endif\n}\n\nfloat trowbridgeReitz(float roughnessSqr, vec3 lightDir, vec3 normal, vec3 viewDir)\n{\n    vec3 halfVec = normalize(lightDir + viewDir);\n    float micro = max(dot(halfVec, normal), 0.0);\n    float denom = (micro * micro) * (roughnessSqr - 1.0) + 1.0;\n    return roughnessSqr / (denom * denom);\n}\n\nvoid accumulate(vec3 lightDir, vec3 lightColor, vec3 normal, vec3 viewDir, float roughnessSqr, out vec3 diffuseLight, out vec3 specularLight)\n{\n    float NdotL = max(dot(lightDir, normal), 0.0);\n    vec3 irradiance = lightColor * NdotL;\n    diffuseLight += irradiance;\n\n#ifndef IGNORESPECULAR\n    float F = fresnel(NdotL, .08);\n    float D = trowbridgeReitz(roughnessSqr, lightDir, normal, viewDir);\n    float amount = D * F;\n\n    specularLight += irradiance * amount;\n#endif\n}\n\nvoid main() {\n    float roughnessSqr = roughness;\n    #ifdef ROUGHNESS_MAP\n    roughnessSqr -= (texture2D(roughnessMap, texCoords).x - .5) * roughnessMapRange;\n    roughnessSqr = clamp(roughnessSqr, 0.0, 1.0);\n    #endif\n    roughnessSqr *= roughnessSqr;\n    vec3 viewWorldDir = normalize(worldPosition - cameraPosition);\n    vec3 viewDir = -normalize(viewPosition);\n\n    vec3 normal = getNormal();\n    vec3 viewNormal = mat3(viewMatrix) * normal;\n\n    vec3 albedo = vec3(1.0);\n\n#ifdef ALBEDO_MAP\n    albedo = texture2D(albedoMap, texCoords).xyz;\n    albedo *= albedo;\n\n    #ifdef ALBEDO_MAP_2\n        vec3 albedo2 = texture2D(albedoMap2, texCoords).xyz;\n        albedo = mix(albedo, albedo2 * albedo2, albedoBlend);\n    #endif\n#endif\n\n    albedo *= color;\n\n    vec3 diffuseLight = vec3(0.0);\n\n    #ifdef IRRADIANCE_PROBE\n        vec4 diffuseSample = textureCube(irradianceProbe, normal);\n        diffuseLight = decodeHDRE(diffuseSample);\n\n        diffuseLight *= diffuseLight * irradianceProbeBoost;\n    #endif\n\n    float ao = 1.0;\n    #ifdef AMBIENT_OCCLUSION_MAP\n        ao = texture2D(aoMap, texCoords2).x;\n    #endif\n\n    #ifdef SSAO_MAP\n        vec2 screenUV = projection.xy / projection.w * .5 + .5;\n        ao = texture2D(ssaoMap, screenUV).x;\n    #endif\n\n    diffuseLight += ambientLightColor;\n    #ifndef AO_ON_DIFFUSE\n    diffuseLight *= ao;\n    #endif\n\n    vec3 specularLight = vec3(0.0);\n\n    #ifdef SPECULAR_PROBE\n        vec3 reflectedView = reflect(viewWorldDir, normal);\n        float fresnelFactor = fresnel(max(dot(viewWorldDir, normal), 0.0), .35);\n\n        #ifdef LOCAL_SKYBOX\n            vec3 offsetRefl = intersectCubeMap(worldPosition - skyboxPosition, reflectedView, skyboxSize);\n        #else\n            vec3 offsetRefl = reflectedView;\n        #endif\n\n        vec4 reflectionSample = textureCube(specularProbe, reflectedView);\n        vec3 reflection;\n\n        reflection = decodeHDRE(reflectionSample);\n\n        reflection *= reflection * specularProbeColor;\n\n        specularLight = reflection * fresnelFactor;\n\n        #ifdef AMBIENT_OCCLUSION_MAP\n//        specularLight *= ao;\n        #endif\n    #endif\n\n    #if NUM_POINT_LIGHTS > 0\n    for (int i = 0; i < NUM_POINT_LIGHTS; ++i) {\n        vec3 worldDir = pointLights[i].position - worldPosition;\n        float sqrDist = dot(worldDir, worldDir);\n        worldDir /= sqrt(sqrDist);\n        vec3 fallOffColor = pointLights[i].color / max(sqrDist, .001);\n        accumulate(worldDir, fallOffColor, normal, viewDir, roughnessSqr, diffuseLight, specularLight);\n    }\n    #endif\n\n    float shadow = getShadow();\n\n    #if NUM_DIR_LIGHTS > 0\n    for (int i = 0; i < NUM_DIR_LIGHTS; ++i) {\n        float NdotL = max(dot(directionalLights[i].direction, viewNormal), 0.0);\n        vec3 irradiance = directionalLights[i].color * NdotL;\n        irradiance *= shadow;\n        diffuseLight += irradiance;\n\n        #ifndef IGNORESPECULAR\n        float F = fresnel(NdotL, .04);\n        float D = trowbridgeReitz(roughnessSqr, directionalLights[i].direction, viewNormal, viewDir);\n        float amount = D * F;\n\n        specularLight += irradiance * amount;\n        #endif\n    }\n    #endif\n\n    #ifdef AO_ON_DIFFUSE\n    diffuseLight *= ao;\n    #endif\n\n    vec3 color = albedo * diffuseLight + specularLight;\n\n    vec3 emission = emissionColor;\n    #ifdef EMISSION_MAP\n    vec3 emissionSample = texture2D(emissionMap, texCoords).xyz;\n    emissionSample *= emissionSample;\n    emission *= emissionSample;\n    #endif\n    color += emission;\n\n    #ifdef FOG\n        float fogAmount = clamp(exp2(viewPosition.z * fogDensity), 0.0, 1.0);\n        vec3 fogCol = fogColor;\n        #ifdef FOG_PROBE\n            vec4 fogSample = textureCube(fogProbe, vec3(viewWorldDir.x , 0.0, viewWorldDir.z));\n            fogSample.xyz = decodeHDRE(fogSample);\n            fogSample.xyz *= fogSample.xyz * fogProbeBoost;\n            fogCol *= fogSample.xyz;\n        #endif\n        color = mix(fogCol, color, fogAmount);\n\n// ONLY FOR THIS PROJECT, this provides a fade-out for the horizon\n        fogAmount = smoothstep(100.0, 250.0, length(worldPosition.xz));\n        color = mix(color, fogCol, fogAmount);\n    #endif\n\n\n    gl_FragColor = encodeHDRE(sqrt(color));\n//    gl_FragColor = vec4(shadow);\n}\n",
  ShaderLibrary["dielectric_vertex.glsl"] = "varying vec3 worldPosition;\nvarying vec3 viewPosition;\nvarying vec3 worldNormal;\n\n#if defined(SSAO_MAP) || defined(ALBEDO_MAP) || defined(NORMAL_MAP) || defined(ROUGHNESS_MAP) || defined(EMISSION_MAP)\nvarying vec2 texCoords;\n#endif\n\n#if defined(AMBIENT_OCCLUSION_MAP)\nattribute vec2 uv2;\n\nvarying vec2 texCoords2;\n#endif\n\n#ifdef SSAO_MAP\nvarying vec4 projection;\n#endif\n\n#ifdef SHADOW_MAP\nuniform mat4 shadowMatrix;\n\nvarying vec4 shadowCoord;\n#endif\n\n#ifdef DISPLACEMENT_MAP\nuniform sampler2D displacementMap;\nuniform float displacementMapRange;\n#endif\n\nvoid main() {\n    vec3 norm = normalize(normal);\n    vec4 localPos = vec4(position, 1.0);\n    #ifdef DISPLACEMENT_MAP\n    vec2 invUV = uv;\n    invUV.y = 1.0 - invUV.y;\n    float displ = (texture2D(displacementMap, invUV).x - .5) * displacementMapRange;\n    localPos.xyz += norm * displ;\n    #endif\n\n    worldPosition = (modelMatrix * localPos).xyz;\n    // normalMatrix seems to be view space... need world space, but it's okay since we're using uniform scaling only\n    vec4 viewPos = modelViewMatrix * localPos;\n    worldNormal = mat3(modelMatrix) * norm;\n    gl_Position = projectionMatrix * viewPos;\n    viewPosition = viewPos.xyz;\n\n    #if defined(SSAO_MAP) || defined(ALBEDO_MAP) || defined(NORMAL_MAP) || defined(ROUGHNESS_MAP) || defined(EMISSION_MAP)\n    texCoords = uv;\n    #endif\n\n    #if defined(AMBIENT_OCCLUSION_MAP)\n    texCoords2 = uv2;\n    #endif\n\n    #ifdef SSAO_MAP\n    projection = gl_Position;\n    #endif\n\n    #ifdef SHADOW_MAP\n    shadowCoord = (shadowMatrix * vec4(worldPosition, 1.0)) * .5 + .5;\n    #endif\n\n    #ifdef AO_MAP\n    texCoords2 = uv2;\n    #endif\n}",
  ShaderLibrary["glass_fragment.glsl"] = "varying vec3 worldPosition;\nvarying vec3 viewPosition;\nvarying vec3 worldNormal;\n\nuniform float roughness;\nuniform float normalSpecularReflection;\n\n#ifdef SPECULAR_PROBE\nuniform samplerCube specularProbe;\n#endif\n\n#if NUM_POINT_LIGHTS > 0\nstruct PointLight {\n    vec3 position;\n    vec3 color;\n    float distance;\n    float decay;\n    int shadow;\n    float shadowBias;\n    float shadowRadius;\n    vec2 shadowMapSize;\n};\n\nuniform PointLight pointLights[ NUM_POINT_LIGHTS ];\n#endif\n\n#if NUM_DIR_LIGHTS > 0\nstruct DirectionalLight {\n    vec3 direction;\n    vec3 color;\n    int shadow;\n    float shadowBias;\n    float shadowRadius;\n    vec2 shadowMapSize;\n};\nuniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];\n#endif\n\nvec3 getNormal()\n{\n    return normalize(worldNormal);\n}\n\nfloat fresnel(float NdotL)\n{\n// angle to the power of 5\n    float angle = 1.0 - NdotL;\n    float fresnelFactor = angle * angle;\n    fresnelFactor *= fresnelFactor;\n    fresnelFactor *= angle;\n    return normalSpecularReflection + (1.0 - normalSpecularReflection) * fresnelFactor;\n}\n\nfloat trowbridgeReitz(float roughnessSqr, vec3 lightDir, vec3 normal, vec3 viewDir)\n{\n    vec3 halfVec = normalize(lightDir + viewDir);\n    float micro = max(dot(halfVec, normal), 0.0);\n    float denom = (micro * micro) * (roughnessSqr - 1.0) + 1.0;\n    return roughnessSqr / (denom * denom);\n}\n\nvec3 accumulate(vec3 lightDir, vec3 lightColor, vec3 normal, vec3 viewDir, float roughnessSqr)\n{\n    float NdotL = max(dot(lightDir, normal), 0.0);\n    vec3 irradiance = lightColor * NdotL;\n\n    float F = fresnel(NdotL);\n    float D = trowbridgeReitz(roughnessSqr, lightDir, normal, viewDir);\n    float amount = D * F;\n\n    return irradiance * amount;\n}\n\nvoid main() {\n    float roughnessSqr = roughness * roughness;\n    vec3 viewDir = -normalize(viewPosition);\n\n    vec3 normal = getNormal();\n    vec3 viewNormal = mat3(viewMatrix) * normal;\n\n    vec3 specularLight = vec3(0.0);\n\n    #ifdef SPECULAR_PROBE\n        vec3 viewWorldDir = normalize(cameraPosition - worldPosition);\n        vec3 reflectedView = -reflect(viewWorldDir, normal);\n        float fresnelFactor = fresnel(max(dot(viewWorldDir, normal), 0.0));\n\n        vec3 reflection = textureCube(specularProbe, reflectedView).xyz;\n\n        specularLight += reflection * reflection * fresnelFactor;\n    #endif\n\n    #if NUM_POINT_LIGHTS > 0\n    for (int i = 0; i < NUM_POINT_LIGHTS; ++i) {\n        vec3 worldDir = pointLights[i].position - worldPosition;\n        float sqrDist = dot(worldDir, worldDir);\n        worldDir /= sqrt(sqrDist);\n        vec3 fallOffColor = pointLights[i].color / max(sqrDist, .001);\n        specularLight += accumulate(worldDir, fallOffColor, normal, viewDir, roughnessSqr);\n    }\n    #endif\n\n    #if NUM_DIR_LIGHTS > 0\n    for (int i = 0; i < NUM_DIR_LIGHTS; ++i) {\n        float NdotL = max(dot(directionalLights[i].direction, viewNormal), 0.0);\n        vec3 irradiance = directionalLights[i].color * NdotL;\n\n        float F = fresnel(NdotL);\n        float D = trowbridgeReitz(roughnessSqr, directionalLights[i].direction, viewNormal, viewDir);\n        float amount = D * F;\n\n        specularLight += irradiance * amount;\n    }\n    #endif\n\n    vec3 color = specularLight;\n\n    gl_FragColor.xyz = sqrt(color);\n    gl_FragColor.w = 1.0;\n}\n",
  ShaderLibrary["glass_vertex.glsl"] = "varying vec3 worldPosition;\nvarying vec3 viewPosition;\nvarying vec3 worldNormal;\n\nvoid main() {\n    worldPosition = (modelMatrix * vec4(position, 1.0)).xyz;\n    // normalMatrix seems to be view space... need world space, but it's okay since we're using uniform scaling only\n    vec4 viewPos = modelViewMatrix * vec4(position,1.0);\n    worldNormal = mat3(modelMatrix) * normalize(normal);\n    gl_Position = projectionMatrix * viewPos;\n    viewPosition = viewPos.xyz;\n}",
  ShaderLibrary["linear_depth_fragment.glsl"] = "varying float linearDepth;\n\n// Only for 0 - 1\nvec4 hx_floatToRGBA8(float value)\n{\n    vec4 enc = value * vec4(1.0, 255.0, 65025.0, 16581375.0);\n    // cannot fract first value or 1 would not be encodable\n    enc.yzw = fract(enc.yzw);\n    return enc - enc.yzww * vec4(1.0/255.0, 1.0/255.0, 1.0/255.0, 0.0);\n}\n\nvoid main()\n{\n    gl_FragColor = hx_floatToRGBA8(linearDepth);\n}\n",
  ShaderLibrary["linear_depth_vertex.glsl"] = "varying float linearDepth;\n\nuniform float cameraNear;\nuniform float rcpCameraRange;\n\nvoid main()\n{\n    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);\n    linearDepth = (-viewPosition.z - cameraNear) * rcpCameraRange;\n    gl_Position = projectionMatrix * viewPosition;\n}",
  ShaderLibrary["render_volume_fragment.glsl"] = "struct DirectionalLight {\n    vec3 direction;\n    vec3 color;\n    int shadow;\n    float shadowBias;\n    float shadowRadius;\n    vec2 shadowMapSize;\n};\n\nstruct PointLight {\n    vec3 position;\n    vec3 color;\n    float distance;\n    float decay;\n    int shadow;\n    float shadowBias;\n    float shadowRadius;\n    vec2 shadowMapSize;\n};\n\n\nvarying vec3 viewVector;\nvarying vec3 localViewDir;\nvarying vec3 viewWorldDir;\nvarying vec3 frustumVec;\n\nuniform sampler2D lightAccum;\n\nuniform sampler2D waterDepthMap;\nuniform sampler2D sceneDepthMap;\n\n#if NUM_DIR_LIGHTS > 0\nuniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];\n#endif\n\n#if NUM_POINT_LIGHTS > 0\nuniform PointLight pointLights[ NUM_POINT_LIGHTS ];\n#endif\n\n#ifdef SKYBOX\nuniform samplerCube skybox;\n#endif\n\nuniform vec2 pixelSize;\nuniform vec3 numCells;\nuniform float cellSize;\nuniform mat4 viewMatrixInverse;\nuniform mat4 projectionMatrix;\nuniform vec3 absorption;\nuniform float cameraNear;\nuniform float cameraRange;\nuniform float transparencyFactor;\nuniform float roughness;\nuniform float normalSpecularReflection;\nuniform mat4 modelViewMatrixInverse;\nuniform vec3 mie;\n\nvec4 sampleData(vec3 pos)\n{\n    vec4 samp = sampleCellLinear(lightAccum, pos, numCells, cellSize);\n//    if (!isInsideFluidDomain(pos, numCells, cellSize))\n//        samp = vec4(0.0);\n    return samp;\n}\n\nfloat trowbridgeReitz(float roughnessSqr, vec3 lightDir, vec3 normal, vec3 viewDir)\n{\n    vec3 halfVec = normalize(lightDir + viewDir);\n    float micro = max(dot(halfVec, normal), 0.0);\n    float denom = (micro * micro) * (roughnessSqr - 1.0) + 1.0;\n    return roughnessSqr / (denom * denom);\n}\n\nfloat fresnel(float NdotL)\n{\n    float angle = 1.0 - NdotL;\n    float fresnelFactor = pow(angle, 5.0);\n    return normalSpecularReflection + (1.0 - normalSpecularReflection) * fresnelFactor;\n}\n\nvec3 getReflectedLight(DirectionalLight light, vec3 normal, vec3 viewDir)\n{\n    float D = trowbridgeReitz(roughness * roughness, light.direction, normal, viewDir);\n    float dot = max(dot(normal, light.direction), 0.0);\n    return D * fresnel(dot) * light.color;\n}\n\n\nvec3 getViewPos(vec2 uv)\n{\n    float depth = RGBA8ToFloat(texture2D(waterDepthMap, uv));\n    float z = depth * cameraRange + cameraNear;\n    return frustumVec * vec3(uv * 2.0 - 1.0, 1.0) * z;\n}\n\nvec3 getViewNormal(vec2 uv, vec3 viewPos)\n{\n    vec3 left = getViewPos(uv - vec2(pixelSize.x, 0.0));\n    vec3 right = getViewPos(uv + vec2(pixelSize.x, 0.0));\n    vec3 bottom = getViewPos(uv - vec2(0.0, pixelSize.y));\n    vec3 top = getViewPos(uv + vec2(0.0, pixelSize.y));\n    vec3 tanR = normalize(right - left);\n    vec3 tanT = normalize(top - bottom);\n    return normalize(cross(tanR, tanT));\n}\n\n\nvoid main()\n{\n    vec2 uv2d = gl_FragCoord.xy * pixelSize;\n\n    float depth = RGBA8ToFloat(texture2D(waterDepthMap, uv2d));\n    if (depth > .9) discard;\n\n    float sceneDepth = RGBA8ToFloat(texture2D(sceneDepthMap, uv2d));\n\n    float z = cameraNear + depth * cameraRange;\n    vec3 viewZNorm = -viewVector / viewVector.z;\n    vec4 viewPos = vec4(z * viewZNorm, 1.0);\n    vec3 rayPos = (modelViewMatrixInverse * viewPos).xyz;\n\n    // hide particles that end up outside the bounds\n    if (!isInsideFluidDomain(rayPos, numCells, cellSize)) discard;\n\n    float marchLen = distance(viewPos.xyz, viewVector);\n    float sampleDistance = marchLen / float(NUM_SAMPLES);\n    sampleDistance = max(sampleDistance, cellSize);\n\n    vec3 stepAbsorb = absorption * sampleDistance;\n    vec3 transmittance = exp(-stepAbsorb);  // at least SOME transmission to prevent ugly aliasing\n    vec3 color = vec3(0.0);\n\n    vec4 projected = projectionMatrix * viewPos;\n    projected /= projected.w;\n    gl_FragDepthEXT = projected.z * .5 + .5;\n\n    // transform to fluid space\n    vec3 rayStep = normalize(localViewDir) * sampleDistance;\n    vec4 startData = sampleCellLinear(lightAccum, rayPos, numCells, cellSize);\n    vec4 data = startData;\n\n    for (int i = 0; i < NUM_SAMPLES; ++i) {\n        float dens = data.w;\n        vec3 light = data.xyz;\n        // of that light, only the following amount is transmitted (beer-lambert)\n        vec3 absorb = clamp(exp(-dens * stepAbsorb), 0.0, 1.0);\n\n        color += light * transmittance * dens;\n        transmittance *= absorb;\n\n        rayPos += rayStep;\n        data = sampleData(rayPos);\n    }\n\n    vec3 viewNormal = getViewNormal(uv2d, viewPos.xyz);\n    vec3 worldNormal = mat3(viewMatrixInverse) * viewNormal;\n    vec3 viewWorldDirNorm = normalize(viewWorldDir.xyz);\n\n    #ifdef SKYBOX\n    vec3 cube = textureCube(skybox, viewWorldDirNorm).xyz;\n    color.xyz += transmittance * cube * cube * mie;\n\n    vec3 reflect = reflect(viewWorldDirNorm, worldNormal);\n    vec3 reflSamp = textureCube(skybox, -reflect).xyz;\n\n    // we're using the start density to prevent overly strong reflections on drops (they have low density)\n    float fresnelFactor = fresnel(max(dot(reflect, worldNormal), 0.0)) * startData.w;\n    color.xyz = mix(color.xyz, reflSamp * reflSamp * (1.0 - roughness), fresnelFactor);\n    #endif\n\n    #if NUM_DIR_LIGHTS > 0\n        vec3 viewDir = -normalize(viewVector);\n        for (int i = 0; i < NUM_DIR_LIGHTS; ++i) {\n            color += getReflectedLight(directionalLights[i], viewNormal, viewDir);\n        }\n    #endif\n\n    float distToScene = (sceneDepth - depth) * cameraRange + .01;\n    gl_FragColor.xyz = sqrt(color);\n    float alpha = 1.0 - exp(-transparencyFactor * distToScene);\n    gl_FragColor.w = clamp(alpha, 0.0, 1.0);\n}",
  ShaderLibrary["render_volume_vertex.glsl"] = "varying vec3 viewVector;\nvarying vec3 viewWorldDir;\nvarying vec3 localViewDir;\nvarying vec3 frustumVec;\n\nuniform vec3 numCells;\nuniform mat4 modelViewMatrixInverse;\nuniform mat4 unprojectionMatrix;\n\nuniform float samplePlaneDistance;\n\n\n#if NUM_DIR_LIGHTS > 0\nstruct DirectionalLight {\n    vec3 direction;\n    vec3 color;\n    int shadow;\n    float shadowBias;\n    float shadowRadius;\n    vec2 shadowMapSize;\n};\n\nuniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];\n\n#endif\n\nvoid main()\n{\n    vec4 viewPos = modelViewMatrix * vec4(position, 1.0);\n    gl_Position = projectionMatrix * viewPos;\n\n    vec3 worldPosition = (modelMatrix * vec4(position, 1.0)).xyz;\n\n    viewWorldDir = worldPosition - cameraPosition;\n\n    // since we're front-culling, this is the backside of the box, where\n    // the ray should STOP\n    viewVector = viewPos.xyz;\n    localViewDir = mat3(modelViewMatrixInverse) * viewVector;\n\n    vec4 unproj = unprojectionMatrix * vec4(1.0, 1.0, 1.0, 1.0);\n\n    frustumVec = unproj.xyz / unproj.w;\n    frustumVec /= -frustumVec.z;\n}",
  ShaderLibrary["sky_fragment.glsl"] = "varying vec3 worldViewDir;\n\nuniform samplerCube envMap;\nuniform vec3 color;\nuniform float invert;\n\nvoid main()\n{\n    vec3 elementDir = normalize(worldViewDir * invert);\n    gl_FragColor = textureCube(envMap, elementDir) * vec4(color, 1.0);\n}\n",
  ShaderLibrary["sky_vertex.glsl"] = "varying vec3 worldViewDir;\n\nvoid main() {\n    vec3 worldPosition = (modelMatrix * vec4(position, 1.0)).xyz;\n    worldViewDir = worldPosition - cameraPosition;\n    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n}",
  ShaderLibrary["unlit_fragment.glsl"] = "#ifdef ALBEDO_MAP\nvarying vec2 texCoords;\nuniform sampler2D albedoMap;\n#endif\n\nuniform vec3 color;\nuniform float opacity;\n\n#ifdef FOG\nvarying vec3 viewPosition;\n\nuniform float fogDensity;\nuniform vec3 fogColor;\n#endif\n\nvoid main() {\n    float alpha = opacity;\n#ifdef ALBEDO_MAP\n    vec4 albedo = texture2D(albedoMap, texCoords);\n    alpha *= albedo.w;\n    albedo.xyz *= albedo.xyz;\n    albedo.xyz *= color;\n    vec3 col = albedo.xyz;\n#else\n    vec3 col = color;\n#endif\n\n    #ifdef FOG\n    float fogAmount = clamp(exp2(viewPosition.z * fogDensity), 0.0, 1.0);\n    col = mix(fogColor, col, fogAmount);\n    #endif\n\n    #ifdef HDRE\n    gl_FragColor = encodeHDRE(sqrt(col));\n    #else\n//    col *= alpha;\n    gl_FragColor = vec4(sqrt(col), alpha);\n    #endif\n}\n",
  ShaderLibrary["unlit_vertex.glsl"] = "#ifdef ALBEDO_MAP\nvarying vec2 texCoords;\n#endif\n\n#ifdef FOG\nvarying vec3 viewPosition;\n#endif\n\nvoid main() {\n    vec3 localPos = position;\n    vec4 viewPos = modelViewMatrix * vec4(localPos, 1.0);\n    gl_Position = projectionMatrix * viewPos;\n    #ifdef FOG\n    viewPosition = viewPos.xyz;\n    #endif\n\n    #ifdef ALBEDO_MAP\n    texCoords = uv;\n    #endif\n}",
  ShaderLibrary["volumetric_lighting_fragment.glsl"] = "varying vec2 texCoords;\n\nuniform sampler2D densityField;\nuniform samplerCube irradiance;\nuniform vec3 numCells;\nuniform vec3 absorption;\nuniform vec3 cameraPos;\nuniform float sampleStep;\nuniform float cellSize;\nuniform vec3 mieG;\n\nstruct DirectionalLight {\n    vec3 direction;\n    vec3 color;\n    int shadow;\n    float shadowBias;\n    float shadowRadius;\n    vec2 shadowMapSize;\n};\n\nstruct PointLight {\n    vec3 position;\n    vec3 color;\n    float distance;\n    float decay;\n    int shadow;\n    float shadowBias;\n    float shadowRadius;\n    vec2 shadowMapSize;\n};\n\n#if NUM_DIR_LIGHTS > 0\nuniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];\n#endif\n\n#if NUM_POINT_LIGHTS > 0\nuniform PointLight pointLights[ NUM_POINT_LIGHTS ];\n#endif\n\n\n// does this contain anything useful?\n// http://orbit.dtu.dk/files/5501107/paper.pdf\nvec3 mieFactor(vec3 lightDir, vec3 viewDir)\n{\n    float cosAng = dot(lightDir, viewDir);\n    vec3 num = vec3(1.0) - mieG;\n    vec3 p = vec3(1.0) + mieG*mieG - 2.0 * mieG * cosAng;\n    p.x = pow(p.x, 1.5);\n    p.y = pow(p.y, 1.5);\n    p.z = pow(p.z, 1.5);\n    return num * num / (4.0 * PI * p);\n}\n\nfloat sampleDensity(vec3 pos)\n{\n    vec4 samp = sampleCellLinear(densityField, pos, numCells, cellSize);\n    #ifdef WATER\n        samp.x = samp.x < 0.0? 1.0 : 0.0;\n    #endif\n    return isInsideFluidDomain(pos, numCells, cellSize)? samp.x : 0.0;\n}\n\nvec3 getTransmittedLight(vec3 pos, DirectionalLight light, vec3 viewDir)\n{\n    float amount = 0.0;\n    vec3 marchStep = light.direction * sampleStep;\n    for (int i = 0; i < NUM_SAMPLES; ++i) {\n        amount += sampleDensity(pos);\n        pos += marchStep;\n    }\n\n    vec3 mie = mieFactor(light.direction, viewDir);\n\n    return exp(-amount * absorption * sampleStep) * light.color * mie;\n}\n\nvec3 getTransmittedLight(vec3 pos, PointLight light, vec3 viewDir, vec3 localPos)\n{\n    float amount = 0.0;\n    vec3 lightDir = light.position - localPos;\n    float len = length(lightDir);\n    float step = min(len / float(NUM_SAMPLES), sampleStep);\n    lightDir = normalize(lightDir);\n    vec3 marchStep = lightDir * step;\n\n    for (int i = 0; i < NUM_SAMPLES; ++i) {\n        pos += marchStep;\n        amount += sampleDensity(pos);\n    }\n\n    vec3 mie = mieFactor(lightDir, viewDir);\n\n// pretend the light has some sort of size\n//    len = max(len, 10.0);\n    return exp(-amount * absorption * step) * mie * light.color / (len * len);\n}\n\nvec3 getGlobalIllum()\n{\n    float occlStrength = .1;\n    float sampleDist = 2.0;\n    vec2 rcpTexSize = vec2(1.0 / (numCells.x * numCells.z), 1.0 / numCells.y) * sampleDist;\n    float right = texture2D(densityField, texCoords + vec2(rcpTexSize.x, 0.0)).x;\n    float left = texture2D(densityField, texCoords - vec2(rcpTexSize.x, 0.0)).x;\n    float top = texture2D(densityField, texCoords + vec2(0.0, rcpTexSize.y)).x;\n    float bottom = texture2D(densityField, texCoords - vec2(0.0, rcpTexSize.y)).x;\n    float far = texture2D(densityField, texCoords + vec2(sampleDist/numCells.z, 0.0)).x;\n    float near = texture2D(densityField, texCoords - vec2(sampleDist/numCells.z, 0.0)).x;\n    // use the inverse gradient as the hint of direction where most light comes from (similar to bent normals)\n    vec3 grad = -normalize(vec3(right - left, top - bottom, far - near));\n    right = clamp(right * occlStrength, 0.0, 1.0);\n    left = clamp(left * occlStrength, 0.0, 1.0);\n    top = clamp(top * occlStrength, 0.0, 1.0);\n    bottom = clamp(bottom * occlStrength, 0.0, 1.0);\n    far = clamp(far * occlStrength, 0.0, 1.0);\n    near = clamp(near * occlStrength, 0.0, 1.0);\n\n    float occl = (6.0 - right - left - top - bottom - far - near) / 6.0;\n    vec3 cube = textureCube(irradiance, grad).xyz;\n    return cube * cube * occl;\n}\n\nvoid main() {\n    vec4 data = texture2D(densityField, texCoords);\n    vec3 localPos = getCellPosition(texCoords, numCells, cellSize);\n    vec3 color = vec3(0.0);\n    vec3 viewDir = normalize(cameraPos - localPos);\n\n    #if NUM_DIR_LIGHTS > 0\n        for (int i = 0; i < NUM_DIR_LIGHTS; ++i) {\n            color += getTransmittedLight(localPos, directionalLights[i], viewDir);\n        }\n    #endif\n\n    #if NUM_POINT_LIGHTS > 0\n        for (int i = 0; i < NUM_POINT_LIGHTS; ++i) {\n            color += getTransmittedLight(localPos, pointLights[i], viewDir, localPos);\n        }\n    #endif\n\n    #ifndef WATER\n    color += getGlobalIllum() * clamp(data.x, 0.0, 1.0);\n    #endif\n\n    gl_FragColor.xyz = color;\n\n    #ifdef WATER\n//        gl_FragColor.w = smoothstep(0.0, -0.001, data.x);\n        gl_FragColor.w = data.x < 0.0? 1.0 : 0.0;\n    #else\n        gl_FragColor.w = data.x;\n    #endif\n}",
  ShaderLibrary["volumetric_normals_fragment.glsl"] = "varying vec2 texCoords;\n\nuniform sampler2D densityField;\nuniform vec2 rcpTexSize;\nuniform vec3 numCells;\n\nfloat sampleDensity(vec2 texCoord)\n{\n    vec4 samp = texture2D(densityField, texCoord);\n    return samp.x;\n}\n\nvoid main() {\n    float right = sampleDensity(texCoords + vec2(rcpTexSize.x, 0.0));\n    float left = sampleDensity(texCoords - vec2(rcpTexSize.x, 0.0));\n    float top = sampleDensity(texCoords + vec2(0.0, rcpTexSize.y));\n    float bottom = sampleDensity(texCoords - vec2(0.0, rcpTexSize.y));\n    float far = sampleDensity(texCoords + vec2(1.0/numCells.z, 0.0));\n    float near = sampleDensity(texCoords - vec2(1.0/numCells.z, 0.0));\n    // use the inverse gradient as the hint of direction where most light comes from (similar to bent normals)\n    vec3 grad = vec3(right - left, top - bottom, far - near);\n    grad /= max(length(grad), 0.001);\n    gl_FragColor = vec4(-grad * .5 + .5, 1.0);\n}",
  ShaderLibrary["volumetric_vertex.glsl"] = "varying vec2 texCoords;\n\nvoid main() {\n    gl_Position = vec4(position, 1.0);\n    texCoords = uv;\n}\n",
  ShaderLibrary["include_sph.glsl"] = "#define PI 3.141592\n\nstruct Collision {\n    bool collided;\n    vec3 normal;\n    vec3 point;\n//    float d;\n};\n\nvec2 getBucketUV(vec3 position, vec3 numCells, float cellSize)\n{\n    // map position to actual cell\n    position = position / cellSize + numCells * .5;\n    vec2 uv = (position.xy + vec2(.5)) / vec2(numCells.x * numCells.z, numCells.y);\n    uv.x += floor(position.z + .5) / numCells.z;\n    return uv;\n}\n\nvec2 getParticleBufferUV(float particleIndex, vec2 texSize)\n{\n    particleIndex -= 1.0;\n    vec2 uv;\n    uv.y = floor(particleIndex / texSize.x);\n    uv.x = particleIndex - uv.y * texSize.x;\n    return (uv + vec2(.5)) / texSize;\n}\n\n// the uv coord in the particle rect texture\nvec4 sampleParticleData(sampler2D tex, float particleIndex, vec2 texSize)\n{\n    vec2 uv = getParticleBufferUV(particleIndex, texSize);\n    return texture2D(tex, uv);\n}\n\nvec4 sampleCellPoint(sampler2D tex, vec3 pos, vec3 numCells, float cellSize)\n{\n    pos = pos / cellSize + numCells * .5;\n    vec2 uv;\n    uv.xy = pos.xy / vec2(numCells.x * numCells.z, numCells.y);\n    uv.x += pos.z / numCells.z;\n    return texture2D(tex, uv);\n}\n\nvec4 sampleCellLinear(sampler2D tex, vec3 pos, vec3 numCells, float cellSize)\n{\n    vec2 uv;\n    pos = pos / cellSize + numCells * .5;\n    uv.xy = pos.xy / vec2(numCells.x * numCells.z, numCells.y);\n    float flZ = floor(pos.z);\n    uv.x += flZ / numCells.z;\n\n    vec4 val1 = texture2D(tex, uv);\n    uv.x += 1.0 / numCells.z;\n    vec4 val2 = texture2D(tex, uv);\n\n    return mix(val1, val2, pos.z - flZ);\n}\n\nbool isInsideFluidDomain(vec3 pos, vec3 numCells, float cellSize)\n{\n    vec3 he = (numCells * .5) * cellSize;\n    bvec3 g = greaterThanEqual(pos, -he);\n    bvec3 l = lessThanEqual(pos, he);\n    return all(g) && all(l);\n}\n\nvec3 getCellPosition(vec2 uv, vec3 numCells, float cellSize)\n{\n    vec3 cell;\n    // coordinates in cell coords (cell Y matches pixel Y)\n    cell.xy = uv * vec2(numCells.x * numCells.z, numCells.y);\n    cell.z = floor(cell.x / numCells.x);\n    cell.x -= cell.z * numCells.x;\n    cell -= numCells * .5;\n    return cell * cellSize;\n}\n\nvec3 getCellPositionFromFragCoord(vec2 fragCoord, vec3 numCells, float cellSize)\n{\n    vec3 cell;\n    // coordinates in cell coords (cell Y matches pixel Y)\n    cell.xy = fragCoord;\n    cell.z = floor(cell.x / numCells.x);\n    cell.x -= cell.z * numCells.x;\n    cell -= numCells * .5;\n    return cell * cellSize;\n}",
  ShaderLibrary["sph_accel_fragment.glsl"] = "uniform sampler2D bucketBuffer;\nuniform sampler2D positionBuffer;\nuniform sampler2D densityBuffer;\nuniform sampler2D velocityBuffer;\n\nvarying vec2 texCoords;\n\nuniform vec3 numCells;\nuniform vec2 particleBufferSize;\nuniform vec2 bucketPixelSize;\nuniform float cellSize;\nuniform float gravity;\nuniform float h;\nuniform float h2;\nuniform float pressNorm;\nuniform float viscNorm;\nuniform float surfaceNorm;\nuniform float viscosity;\nuniform float stiffness;\nuniform float restDensity;\nuniform float mass;\nuniform float drag;\nuniform float dt;\nuniform float curvatureThreshold;\nuniform float surfaceTension;\nuniform float maxParticleIndex;\n\nfloat pressure(float density)\n{\n    // rest density is there to cause attraction when density is too low\n    return stiffness * (density - restDensity);\n}\n\n// all these contributions have mass removed from them, as it's constant we add it later\n\nvec3 getPressContrib(vec3 R_ij, float dist, float p_i, float rho_j)\n{\n    float p_j = pressure(rho_j);\n    float d = max(h - dist, 0.0);\n    vec3 gradW = pressNorm * d * d * normalize(R_ij);\n    return -(p_i + p_j) * .5 /**  mass *// rho_j * gradW;\n}\n\nvec3 getViscContrib(vec3 R_ij, float dist, vec3 v_i, vec3 v_j, float rho_j)\n{\n    float diff = max(h - dist, 0.0);\n    float laplW = viscNorm * diff;\n    return (v_j - v_i) /** mass *// rho_j * laplW;\n}\n\nvec3 getGradColContrib(vec3 R_ij, float dist, float rho_j)\n{\n    float d = max(h2 - dist * dist, 0.0);\n    vec3 gradW = surfaceNorm * R_ij * d * d;\n    return gradW /** mass*/ / rho_j;\n}\n\nfloat getLaplaceColContrib(vec3 R_ij, float dist, float rho_j)\n{\n    float d1 = max(h2 - dist * dist, 0.0);\n    float d2 = 3.0 * h2 - 7.0 * dist * dist;\n    float laplW = surfaceNorm * d1 * d2;\n    return laplW /** mass *// rho_j;\n}\n\nvoid main() {\n    vec4 posSample = texture2D(positionBuffer, texCoords);\n    vec3 v_i = texture2D(velocityBuffer, texCoords).xyz;\n    vec3 x_i = posSample.xyz;\n    float rho_i = texture2D(densityBuffer, texCoords).x;\n    float p_i = pressure(rho_i);\n    float thisIndex = posSample.w;\n\n    vec3 Fpress = vec3(0.0);\n    vec3 Fvisc = vec3(0.0);\n\n    vec2 bucketUV = getBucketUV(x_i, numCells, cellSize);\n\n    vec3 normal = vec3(0.0);\n    float laplCol = 0.0;\n\n    for (int z = -SAMPLE_RADIUS; z <= SAMPLE_RADIUS; ++z) {\n        for (int y = -SAMPLE_RADIUS; y <= SAMPLE_RADIUS; ++y) {\n            for (int x = -SAMPLE_RADIUS; x <= SAMPLE_RADIUS; ++x) {\n                vec2 uvNeigh = bucketUV + vec2(x, y) * bucketPixelSize;\n                uvNeigh.x += float(z) / numCells.z;\n                vec4 partIndices = texture2D(bucketBuffer, uvNeigh);\n\n                for (int p = 0; p < 4; ++p) {\n                    float index = partIndices[p];\n\n                    if (index > 0.0 && thisIndex != index) {\n                        vec2 uv = getParticleBufferUV(index, particleBufferSize);\n                        vec3 x_j = texture2D(positionBuffer, uv).xyz;\n                        vec3 v_j = texture2D(velocityBuffer, uv).xyz;\n                        float rho_j = texture2D(densityBuffer, uv).x;\n                        vec3 R_ij = x_i - x_j;\n                        float dist = length(R_ij);\n                        Fpress += getPressContrib(R_ij, dist, p_i, rho_j);\n                        Fvisc += getViscContrib(R_ij, dist, v_i, v_j, rho_j);\n                        normal += getGradColContrib(R_ij, dist, rho_j);\n                        laplCol += getLaplaceColContrib(R_ij, dist, rho_j);\n                    }\n                }\n            }\n        }\n    }\n\n    laplCol *= mass;\n    normal *= mass;\n    Fpress *= mass;\n    Fvisc *= mass;\n\n    vec3 Fsurface = vec3(0.0);\n    float normalLen = length(normal);\n    if (normalLen > curvatureThreshold) {\n        float curvature = -laplCol / normalLen;\n        Fsurface = surfaceTension * curvature * normal / normalLen;\n    }\n\n    vec3 dragAccell = -v_i * drag;\n    vec3 F = viscosity * Fvisc + Fpress + Fsurface;\n    vec3 a_i = F / rho_i;\n    a_i.y += gravity;\n    a_i += dragAccell;\n\n    if (thisIndex > maxParticleIndex)\n        a_i = vec3(0.0);\n\n    gl_FragColor.xyz = a_i;\n    gl_FragColor.w = 1.0;\n}\n\n",
  ShaderLibrary["sph_ball_collider_fragment.glsl"] = "uniform vec3 numCells;\nuniform vec3 wallExtent;\nuniform float cellSize;\nuniform vec3 spherePosition;\nuniform float sphereRadius;\n\nfloat getDistance(vec3 pos)\n{\n    float wallDist = signedDistanceWalls(pos, wallExtent);\n    float sphereDist = signedDistanceSphere(pos, spherePosition, sphereRadius);\n    return min(wallDist, sphereDist);\n}\n\nvec3 getNormal(vec3 pos)\n{\n    float r = getDistance(pos + vec3(cellSize, 0.0, 0.0));\n    float l = getDistance(pos - vec3(cellSize, 0.0, 0.0));\n    float t = getDistance(pos + vec3(0.0, cellSize, 0.0));\n    float b = getDistance(pos - vec3(0.0, cellSize, 0.0));\n    float n = getDistance(pos + vec3(0.0, 0.0, cellSize));\n    float f = getDistance(pos - vec3(0.0, 0.0, cellSize));\n\n    // normalization happens in collision test anyway, so no need for it here\n    return normalize(vec3(r - l, t - b, n - f));\n}\n\nvoid main() {\n    vec3 pos = getCellPositionFromFragCoord(gl_FragCoord.xy, numCells, cellSize);\n    float dist = getDistance(pos);\n    vec3 normal = getNormal(pos);\n\n    gl_FragColor = vec4(normal, dist);\n}\n",
  ShaderLibrary["sph_bucket_fragment.glsl"] = "varying float index;\nuniform float numParticles;\n\nvoid main() {\n    gl_FragColor = vec4(index);\n}\n",
  ShaderLibrary["sph_bucket_vertex.glsl"] = 'attribute vec2 positionUV;\nattribute float particleIndex;\n\nuniform sampler2D positionBuffer;\nuniform vec3 numCells;\nuniform float numParticles;\nuniform float cellSize;\n\nvarying float index;\n\nvoid main() {\n    vec4 localPos = vec4(texture2D(positionBuffer, positionUV).xyz, 1.0);\n    vec2 uv = getBucketUV(localPos.xyz, numCells, cellSize);\n\n    // write index to depth\n    gl_Position = vec4(uv * 2.0 - 1.0, particleIndex / numParticles * 2.0 - 1.0, 1.0);\n    gl_PointSize = 1.0;\n\n    // When reading, we assume 0 (clear value) means "no particle"\n    index = particleIndex + 1.0;\n}',
  ShaderLibrary["sph_density_fragment.glsl"] = "uniform sampler2D positionBuffer;\nuniform sampler2D collisionBuffer;\nuniform sampler2D bucketBuffer;\n\nvarying vec2 texCoords;\n\nuniform vec3 numCells;\nuniform float cellSize;\nuniform vec2 particleBufferSize;\nuniform vec2 bucketPixelSize;\nuniform float mass;\nuniform float h2;\nuniform float kernelNorm;\n\nfloat kernel(float dist2)\n{\n    // 6th degree polynomial kernel\n    float diff = max(h2 - dist2, 0.0);\n    return kernelNorm * pow(diff, 3.0);\n}\n\nvoid main() {\n    vec3 x_i = texture2D(positionBuffer, texCoords).xyz;\n\n    // when using half float texture, this messes up\n    float sum = 0.0;\n\n    vec2 bucketUV = getBucketUV(x_i, numCells, cellSize);\n    for (int z = -SAMPLE_RADIUS; z <= SAMPLE_RADIUS; ++z) {\n        for (int y = -SAMPLE_RADIUS; y <= SAMPLE_RADIUS; ++y) {\n            for (int x = -SAMPLE_RADIUS; x <= SAMPLE_RADIUS; ++x) {\n                vec2 uvNeigh = bucketUV + vec2(x, y) * bucketPixelSize;\n                uvNeigh.x += float(z) / numCells.z;\n                vec4 partIndices = texture2D(bucketBuffer, uvNeigh);\n\n                for (int p = 0; p < 4; ++p) {\n                    float index = partIndices[p];\n                    if (index > 0.0) {\n                        vec3 x_j = sampleParticleData(positionBuffer, index, particleBufferSize).xyz;\n                        vec3 r = x_i - x_j;\n                        float dist2 = dot(r, r);\n                        sum += kernel(dist2);\n                    }\n                }\n            }\n        }\n    }\n\n//    float wallDist = texture2D(collisionBuffer, bucketUV).w;\n//    sum += kernel(wallDist * wallDist) * 3.0;\n    sum *= mass;\n\n    gl_FragColor = vec4(sum, sum, sum, 1.0);\n}\n",
  ShaderLibrary["sph_distance_fragment.glsl"] = "varying vec3 particlePosition;\n\nuniform vec3 numCells;\nuniform float cellSize;\nuniform float particleRadius;\n\nvoid main() {\n    vec3 pos = getCellPositionFromFragCoord(gl_FragCoord.xy, numCells, cellSize);\n    // the * 10 is just so that interpolations find the edge quicker\n    float signedDist = distance(particlePosition, pos) - particleRadius * 100.0;\n    gl_FragColor = vec4(signedDist, 0.0, 0.0, 1.0);\n}\n",
  ShaderLibrary["sph_distance_vertex.glsl"] = "attribute vec2 positionUV;\n\nuniform sampler2D positionBuffer;\nuniform vec3 numCells;\nuniform float cellSize;\nuniform float particleRadius;\nuniform float zSliceOffset;\n\nvarying vec3 particlePosition;\n\nvoid main() {\n    vec4 localPos = vec4(texture2D(positionBuffer, positionUV).xyz, 1.0);\n    vec2 uv = getBucketUV(localPos.xyz, numCells, cellSize);\n    uv.x += zSliceOffset / numCells.z;\n\n    gl_Position = vec4(uv * 2.0 - 1.0, 0.0, 1.0);\n\n    float rad = cos(zSliceOffset * cellSize / particleRadius * PI * .5);\n    float pointSize = ceil(particleRadius / cellSize * 2.0 * rad) + 1.0;\n    gl_PointSize = pointSize;\n\n    particlePosition = localPos.xyz;\n}",
  ShaderLibrary["sph_heightmap_collider_fragment.glsl"] = "uniform vec3 wallExtent;\nuniform vec3 numCells;\nuniform float cellSize;\nuniform vec3 spherePosition;\nuniform float sphereRadius;\n\nuniform sampler2D heightMap;\n\nfloat getDistance(vec3 pos)\n{\n    float wallDist = signedDistanceWalls(pos, wallExtent);\n\n    // this is not entirely correct, but let's hope it's good enough\n    vec3 size = numCells * cellSize;\n    vec2 uv = pos.xz / size.xz + .5;\n    uv.y = 1.0 - uv.y;\n    float y =(texture2D(heightMap, uv).x - .5) * size.y;\n    float heightMapDist = pos.y - y;\n\n    return min(wallDist, heightMapDist);\n}\n\nvec3 getNormal(vec3 pos)\n{\n    float r = getDistance(pos + vec3(cellSize, 0.0, 0.0));\n    float l = getDistance(pos - vec3(cellSize, 0.0, 0.0));\n    float t = getDistance(pos + vec3(0.0, cellSize, 0.0));\n    float b = getDistance(pos - vec3(0.0, cellSize, 0.0));\n    float n = getDistance(pos + vec3(0.0, 0.0, cellSize));\n    float f = getDistance(pos - vec3(0.0, 0.0, cellSize));\n\n    // normalization happens in collision test anyway, so no need for it here\n    return normalize(vec3(r - l, t - b, n - f));\n}\n\nvoid main() {\n    vec3 pos = getCellPositionFromFragCoord(gl_FragCoord.xy, numCells, cellSize);\n    float dist = getDistance(pos);\n    vec3 normal = getNormal(pos);\n\n    gl_FragColor = vec4(normal, dist);\n}\n",
  ShaderLibrary["sph_init_velocity_still.glsl"] = "vec3 initVelocity(float index, vec3 numCells, float cellSize)\n{\n    return vec3(0.0);\n}",
  ShaderLibrary["sph_init_velocity_stream.glsl"] = "vec3 initVelocity(float index, vec3 numCells, float cellSize)\n{\n    return vec3(numCells.x, 0.0, numCells.y) * cellSize;\n}",
  ShaderLibrary["sph_particle_depth_fragment.glsl"] = "varying float radius;\nvarying vec2 centerFrag;\nvarying vec3 viewPosition;\n\nuniform float particleSize;\nuniform float cameraNear;\nuniform float rcpCameraRange;\nuniform mat4 projectionMatrix;\n\nvoid main() {\n    float radius2 = radius * radius;\n    vec2 diff = gl_FragCoord.xy - centerFrag;\n    diff /= radius;\n    float dist2 = dot(diff, diff);\n    if (dist2 > 1.0) discard;\n\n    vec3 normal;\n    normal.xy = diff;\n    normal.z = sqrt(1.0 - dist2);\n\n    vec3 pos = viewPosition - normal * particleSize;\n    float linearDepth = (-pos.z - cameraNear) * rcpCameraRange;\n\n    gl_FragColor = floatToRGBA8(linearDepth);\n    gl_FragDepthEXT = linearDepth;\n}\n",
  ShaderLibrary["sph_particle_depth_vertex.glsl"] = "attribute vec2 positionUV;\n\nuniform sampler2D positionBuffer;\nuniform float particleSize;\nuniform vec2 viewportSize;\n\nvarying float radius;\nvarying vec2 centerFrag;\nvarying vec3 viewPosition;\n\nvoid main() {\n    vec4 localPos = vec4(texture2D(positionBuffer, positionUV).xyz, 1.0);\n    vec4 viewPos = modelViewMatrix * localPos;\n    gl_Position = projectionMatrix * viewPos;\n    radius = -projectionMatrix[1][1] * particleSize / viewPos.z * viewportSize.y;\n    gl_PointSize = radius * 2.0;\n\n    centerFrag = (gl_Position.xy / gl_Position.w + 1.0) * viewportSize * .5;\n\n    viewPosition = viewPos.xyz;\n}",
  ShaderLibrary["sph_particle_point_fragment.glsl"] = "#ifdef MAP\nuniform sampler2D colorBuffer;\n\nvarying vec2 texCoords;\n#endif\n\nvoid main() {\n#ifdef MAP\n    gl_FragColor.xyz = (.5 + length(texture2D(colorBuffer, texCoords).xyz)) * vec3(.5, .8, 1.0) * .5;\n    gl_FragColor.w = 1.0;\n#else\n    gl_FragColor = vec4(1.0);\n#endif\n}\n",
  ShaderLibrary["sph_particle_point_vertex.glsl"] = "attribute vec2 positionUV;\n\nuniform sampler2D positionBuffer;\nuniform float particleSize;\n\n#ifdef MAP\nvarying vec2 texCoords;\n#endif\n\nvoid main() {\n    vec4 localPos = vec4(texture2D(positionBuffer, positionUV).xyz, 1.0);\n    vec4 viewPos = modelViewMatrix * localPos;\n    gl_Position = projectionMatrix * viewPos;\n    gl_PointSize = particleSize;\n\n    #ifdef MAP\n    texCoords = positionUV;\n    #endif\n\n}",
  ShaderLibrary["sph_position_fragment.glsl"] = "varying vec2 texCoords;\nuniform sampler2D velocityBuffer;\nuniform sampler2D positionBuffer;\nuniform sampler2D accelBuffer;\n\nuniform float dt;\nuniform vec3 wallExtent;\nuniform float maxParticleIndex;\n\nvoid main() {\n    vec4 posSample = texture2D(positionBuffer, texCoords);\n    vec3 a_i = texture2D(accelBuffer, texCoords).xyz;\n    vec3 v_i = texture2D(velocityBuffer, texCoords).xyz;\n    vec3 x_i = posSample.xyz;\n    float thisIndex = posSample.w;\n\n    vec3 x_i_1 = x_i + dt * (v_i + .5 * a_i * dt);\n\n//    x_i_1 = min(x_i_1, wallExtent);\n//    x_i_1 = max(x_i_1, -wallExtent);\n\n    if (thisIndex > maxParticleIndex)\n        x_i_1 = x_i;\n\n    gl_FragColor = vec4(x_i_1, thisIndex);\n}\n",
  ShaderLibrary["sph_quad_vertex.glsl"] = "varying vec2 texCoords;\n\nvoid main() {\n    texCoords = uv;\n    gl_Position = vec4(position, 1.0);\n}",
  ShaderLibrary["sph_velocity_fragment.glsl"] = "varying vec2 texCoords;\nuniform sampler2D positionBuffer;\nuniform sampler2D velocityBuffer;\nuniform sampler2D accelBuffer1;\nuniform sampler2D accelBuffer2;\nuniform sampler2D collisionBuffer;\n\nuniform float dt;\nuniform vec3 numCells;\nuniform float cellSize;\nuniform float restDistance;\nuniform float maxParticleIndex;\n\nvoid main() {\n    vec4 posSample = texture2D(positionBuffer, texCoords);\n    vec3 a_i = texture2D(accelBuffer1, texCoords).xyz;\n    vec3 a_i_p = texture2D(accelBuffer2, texCoords).xyz;\n    vec3 v_i = texture2D(velocityBuffer, texCoords).xyz;\n    vec3 x_i = posSample.xyz;\n    float thisIndex = posSample.w;\n\n    vec3 v_i_1 = v_i + dt * (a_i + a_i_p) * .5;\n\n    vec3 x_i_1 = x_i + v_i_1 * dt;\n    vec4 boundSample = sampleCellLinear(collisionBuffer, x_i_1, numCells, cellSize);\n    vec3 wallNormal = normalize(boundSample.xyz);\n    float wallDist = max(restDistance * 2.0 - boundSample.w, 0.0);\n    // move the particle back to the correct rest distance, this enforces no-slip condition on velocity\n    x_i_1 += wallDist * wallNormal;\n    // update the velocity to match\n    v_i_1 = (x_i_1 - x_i) / dt;\n\n    if (thisIndex > maxParticleIndex)\n        v_i_1 = initVelocity(thisIndex, numCells, cellSize);\n\n    gl_FragColor = vec4(v_i_1, 1.0);\n}\n",
  ShaderLibrary["sph_wall_collider_fragment.glsl"] = "uniform vec3 wallExtent;\nuniform vec3 numCells;\nuniform float cellSize;\n\nfloat getDistance(vec3 pos)\n{\n    return signedDistanceWalls(pos, wallExtent);\n}\n\nvec3 getNormal(vec3 pos)\n{\n    float r = getDistance(pos + vec3(cellSize, 0.0, 0.0));\n    float l = getDistance(pos - vec3(cellSize, 0.0, 0.0));\n    float t = getDistance(pos + vec3(0.0, cellSize, 0.0));\n    float b = getDistance(pos - vec3(0.0, cellSize, 0.0));\n    float n = getDistance(pos + vec3(0.0, 0.0, cellSize));\n    float f = getDistance(pos - vec3(0.0, 0.0, cellSize));\n\n    // normalization happens in collision test anyway, so no need for it here\n    return normalize(vec3(r - l, t - b, n - f));\n}\n\nvoid main() {\n    vec3 pos = getCellPositionFromFragCoord(gl_FragCoord.xy, numCells, cellSize);\n    float dist = getDistance(pos);\n    vec3 normal = getNormal(pos);\n\n    gl_FragColor = vec4(normal, dist);\n}\n",
  SPHCollider.prototype = {
    get texture() {
      return this._target.texture
    },
    init: function(e, t) {
      this._renderer = t,
        this._halfFloatType = FloatTex.getHalfOrFloat(t),
        this._rectRenderer = new RectRenderer(t),
        this._numCells = e.numCells,
        this._cellSize = e.cellSize,
        this._target = new THREE.WebGLRenderTarget(this._numCells.x * this._numCells.z, this._numCells.y, {
          type: this._halfFloatType,
          minFilter: THREE.LinearFilter,
          magFilter: THREE.LinearFilter,
          generateMipmaps: !1,
          depthBuffer: !1,
          stencilBuffer: !1,
          format: THREE.RGBAFormat
        });
      var n = this._material.uniforms;
      n.numCells.value = this._numCells,
        n.wallExtent.value = e.halfExtent,
        n.cellSize.value = this._cellSize
    },
    invalidate: function() {
      this._invalid = !0
    },
    update: function() {
      this._invalid && (this._updateMaterial(),
        this._rectRenderer.execute(this._material, this._target, !0),
        this._invalid = !1)
    },
    _updateMaterial: function() {}
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
  BillboardComponent = function(e, t) {
    this._camera = e,
      this._constantSize = t,
      this._v = new THREE.Vector3
  },
  BillboardComponent.prototype = Object.create(Component.prototype, {
    constantSize: {
      get: function() {
        return this._constantSize
      },
      set: function(e) {
        this._constantSize = e
      }
    },
    camera: {
      get: function() {
        return this._camera
      },
      set: function(e) {
        this._camera = e
      }
    }
  }),
  BillboardComponent.prototype.onAdded = function() {},
  BillboardComponent.prototype.onRemoved = function() {},
  BillboardComponent.prototype.onUpdate = function(e) {
    this._v.setFromMatrixPosition(this._camera.matrixWorld),
      this.entity.lookAt(this._v),
      this._constantSize && (this._v.copy(this.entity.position),
        this._v.applyMatrix4(this._camera.matrixWorldInverse),
        this.entity.scale.set(-this._v.z, -this._v.z, -this._v.z))
  },
  OrbitController = function(e, t, n) {
    Component.call(this),
      this.enabled = !0,
      this._container = e,
      this._coords = new THREE.Vector3(0, .4 * Math.PI, 2),
      this._localAcceleration = new THREE.Vector3(0, 0, 0),
      this._localVelocity = new THREE.Vector3(0, 0, 0),
      this.lookAtTarget = t || new THREE.Vector3(0, 0, 0),
      this.zoomSpeed = 2,
      this.maxRadius = 20,
      this.minRadius = .1,
      this.dampen = .9,
      this.maxAzimuth = void 0,
      this.minAzimuth = void 0,
      this.minPolar = .1,
      this.maxPolar = Math.PI - .1,
      this.moveAcceleration = .02,
      this._m = new THREE.Matrix4,
      this._oldMouseX = 0,
      this._oldMouseY = 0,
      this._moveWithKeys = n,
      this._moveAcceleration = new THREE.Vector3,
      this._moveVelocity = new THREE.Vector3,
      this._isDown = !1,
      this._initListeners()
  },
  OrbitController.prototype = Object.create(Component.prototype, {
    radius: {
      get: function() {
        return this._coords.z
      },
      set: function(e) {
        this._coords.z = e
      }
    },
    azimuth: {
      get: function() {
        return this._coords.x
      },
      set: function(e) {
        this._coords.x = e
      }
    },
    polar: {
      get: function() {
        return this._coords.y
      },
      set: function(e) {
        this._coords.y = e
      }
    }
  }),
  OrbitController.prototype.onAdded = function() {
    this._isDown = !1;
    var e = /Firefox/i.test(navigator.userAgent) ? "DOMMouseScroll" : "mousewheel";
    this._container.addEventListener(e, this._onMouseWheel),
      this._container.addEventListener("mousemove", this._onMouseMove),
      this._container.addEventListener("touchmove", this._onTouchMove),
      this._container.addEventListener("mousedown", this._onMouseDown),
      this._container.addEventListener("touchstart", this._onTouchDown),
      this._container.addEventListener("mouseup", this._onUp),
      this._container.addEventListener("touchend", this._onUp),
      this._moveWithKeys && (document.addEventListener("keyup", this._onKeyUp),
        document.addEventListener("keydown", this._onKeyDown))
  },
  OrbitController.prototype.onRemoved = function() {
    var e = /Firefox/i.test(navigator.userAgent) ? "DOMMouseScroll" : "mousewheel";
    this._container.removeEventListener(e, this._onMouseWheel),
      this._container.removeEventListener("mousemove", this._onMouseMove),
      this._container.removeEventListener("touchmove", this._onTouchMove),
      this._container.removeEventListener("mousedown", this._onMouseDown),
      this._container.removeEventListener("touchstart", this._onTouchDown),
      this._container.removeEventListener("mouseup", this._onUp),
      this._container.removeEventListener("touchend", this._onUp),
      this._moveWithKeys && (document.removeEventListener("keyup", this._onKeyUp),
        document.removeEventListener("keydown", this._onKeyDown))
  },
  OrbitController.prototype.onUpdate = function(e) {
    if (this.enabled) {
      if (this._moveWithKeys) {
        this._moveVelocity.x *= this.dampen,
          this._moveVelocity.y *= this.dampen,
          this._moveVelocity.z *= this.dampen,
          this._moveVelocity.x += this._moveAcceleration.x,
          this._moveVelocity.y += this._moveAcceleration.y,
          this._moveVelocity.z += this._moveAcceleration.z;
        var t = new THREE.Vector3;
        t.copy(this._moveVelocity),
          t.applyQuaternion(this.entity.quaternion.setFromRotationMatrix(this.entity.matrixWorld)),
          this.lookAtTarget.x += t.x,
          this.lookAtTarget.y += this._moveVelocity.y,
          this.lookAtTarget.z += t.z
      }
      this._localVelocity.x *= this.dampen,
        this._localVelocity.y *= this.dampen,
        this._localVelocity.z *= this.dampen,
        this._localVelocity.x += this._localAcceleration.x,
        this._localVelocity.y += this._localAcceleration.y,
        this._localVelocity.z += this._localAcceleration.z,
        this._localAcceleration.x = 0,
        this._localAcceleration.y = 0,
        this._localAcceleration.z = 0,
        this._coords.add(this._localVelocity),
        this._coords.y = THREE.Math.clamp(this._coords.y, this.minPolar, this.maxPolar),
        this._coords.z = THREE.Math.clamp(this._coords.z, this.minRadius, this.maxRadius),
        void 0 !== this.maxAzimuth && void 0 !== this.minAzimuth && (this._coords.x = THREE.Math.clamp(this._coords.x, this.minAzimuth, this.maxAzimuth));
      var n = this.entity,
        i = this._m,
        r = this._fromSphericalCoordinates(this._coords.z, this._coords.x, this._coords.y);
      r.add(this.lookAtTarget),
        i.lookAt(r, this.lookAtTarget, new THREE.Vector3(0, 1, 0)),
        i.setPosition(r),
        i.decompose(n.position, n.quaternion, n.scale)
    }
  },
  OrbitController.prototype._fromSphericalCoordinates = function(e, t, n) {
    var i = new THREE.Vector3;
    return i.x = e * Math.sin(n) * Math.cos(t),
      i.y = e * Math.cos(n),
      i.z = e * Math.sin(n) * Math.sin(t),
      i
  },
  OrbitController.prototype.setAzimuthImpulse = function(e) {
    this._localAcceleration.x = e
  },
  OrbitController.prototype.setPolarImpulse = function(e) {
    this._localAcceleration.y = e
  },
  OrbitController.prototype.setZoomImpulse = function(e) {
    this._localAcceleration.z = e
  },
  OrbitController.prototype._updateMove = function(e, t) {
    if (void 0 !== this._oldMouseX) {
      var n = e - this._oldMouseX,
        i = t - this._oldMouseY;
      this.setAzimuthImpulse(.0015 * n),
        this.setPolarImpulse(.0015 * -i)
    }
    this._oldMouseX = e,
      this._oldMouseY = t
  },
  OrbitController.prototype._initListeners = function() {
    var e = this;
    this._onMouseWheel = function(t) {
        var n = t.detail ? -120 * t.detail : t.wheelDelta;
        e.setZoomImpulse(-n * e.zoomSpeed * 1e-4)
      },
      this._onMouseDown = function(t) {
        e._oldMouseX = void 0,
          e._oldMouseY = void 0,
          e._isDown = !0
      },
      this._onMouseMove = function(t) {
        e._isDown && e._updateMove(t.screenX, t.screenY)
      },
      this._onTouchDown = function(t) {
        if (e._oldMouseX = void 0,
          e._oldMouseY = void 0,
          2 === t.touches.length) {
          var n = t.touches[0],
            i = t.touches[1],
            r = n.screenX - i.screenX,
            o = n.screenY - i.screenY;
          e._startPitchDistance = Math.sqrt(r * r + o * o),
            e._startZoom = e.radius
        }
        e._isDown = !0
      },
      this._onTouchMove = function(t) {
        if (t.preventDefault(),
          e._isDown) {
          var n = t.touches.length;
          if (1 === n) {
            var i = t.touches[0];
            e._updateMove(i.screenX, i.screenY)
          } else if (2 === n) {
            var r = t.touches[0],
              o = t.touches[1],
              a = r.screenX - o.screenX,
              s = r.screenY - o.screenY,
              l = Math.sqrt(a * a + s * s),
              c = e._startPitchDistance - l;
            e.radius = e._startZoom + .2 * c
          }
        }
      },
      this._onUp = function(t) {
        e._isDown = !1
      },
      this._onKeyUp = function(t) {
        switch (t.keyCode) {
          case 69:
          case 81:
            e._moveAcceleration.y = 0;
            break;
          case 37:
          case 65:
          case 39:
          case 68:
            e._moveAcceleration.x = 0;
            break;
          case 38:
          case 87:
          case 40:
          case 83:
            e._moveAcceleration.z = 0
        }
      },
      this._onKeyDown = function(t) {
        switch (t.keyCode) {
          case 81:
            e._moveAcceleration.y = -e.moveAcceleration;
            break;
          case 69:
            e._moveAcceleration.y = e.moveAcceleration;
            break;
          case 37:
          case 65:
            e._moveAcceleration.x = -e.moveAcceleration;
            break;
          case 38:
          case 87:
            e._moveAcceleration.z = -e.moveAcceleration;
            break;
          case 39:
          case 68:
            e._moveAcceleration.x = e.moveAcceleration;
            break;
          case 40:
          case 83:
            e._moveAcceleration.z = e.moveAcceleration
        }
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
  DielectricMaterial = function(e) {
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
  },
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
  GlassMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype),
  LinearDepthMaterial = function() {
    THREE.ShaderMaterial.call(this, {
      uniforms: {
        cameraNear: {
          value: 0
        },
        rcpCameraRange: {
          value: 0
        }
      },
      vertexShader: ShaderLibrary.get("linear_depth_vertex"),
      fragmentShader: ShaderLibrary.get("linear_depth_fragment")
    })
  },
  LinearDepthMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype, {
    cameraNear: {
      get: function() {
        return this.uniforms.cameraNear.value
      },
      set: function(e) {
        this.uniforms.cameraNear.value = e
      }
    },
    rcpCameraRange: {
      get: function() {
        return this.uniforms.rcpCameraRange.value
      },
      set: function(e) {
        this.uniforms.rcpCameraRange.value = e
      }
    }
  }),
  SkyMaterial = function(e) {
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
  },
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
  }),
  RenderVolumeMaterial = function(e, t, n) {
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
  },
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
  },
  SkyMaterial = function(e) {
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
  },
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
  }),
  SPHParticlePointMaterial = function(e) {
    var t = {};
    e && (t.MAP = ""),
      THREE.ShaderMaterial.call(this, {
        defines: t,
        uniforms: {
          colorBuffer: {
            value: e
          },
          positionBuffer: {
            value: null
          },
          particleSize: {
            value: 10
          }
        },
        vertexShader: ShaderLibrary.get("sph_particle_point_vertex"),
        fragmentShader: ShaderLibrary.get("sph_particle_point_fragment")
      })
  },
  SPHParticlePointMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype, {
    colorBuffer: {
      get: function() {
        return this.uniforms.colorBuffer.value
      },
      set: function(e) {
        this.uniforms.colorBuffer.value = e
      }
    },
    positionBuffer: {
      get: function() {
        return this.uniforms.positionBuffer.value
      },
      set: function(e) {
        this.uniforms.positionBuffer.value = e
      }
    },
    particleSize: {
      get: function() {
        return this.uniforms.particleSize.value
      },
      set: function(e) {
        this.uniforms.particleSize.value = e
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
  Gaussian = {
    estimateGaussianRadius: function(e, t) {
      return Math.sqrt(-2 * e * Math.log(t))
    }
  },
  CenteredGaussianCurve = function(e) {
    this._amplitude = 1 / Math.sqrt(2 * e * Math.PI),
      this._expScale = -1 / (2 * e)
  },
  CenteredGaussianCurve.prototype = {
    getValueAt: function(e) {
      return this._amplitude * Math.pow(Math.E, e * e * this._expScale)
    }
  },
  CenteredGaussianCurve.fromRadius = function(e, t) {
    t = t || .01;
    var n = e / Math.sqrt(-2 * Math.log(t));
    return new CenteredGaussianCurve(n * n)
  },
  PoissonDisk = function(e, t, n, i) {
    this._mode = void 0 === e ? PoissonDisk.CIRCULAR : e,
      this._initialDistance = t || 1,
      this._decayFactor = n || .99,
      this._maxTests = i || 2e4,
      this._currentDistance = 0,
      this._points = null,
      this.reset()
  },
  PoissonDisk.SQUARE = 0,
  PoissonDisk.CIRCULAR = 1,
  PoissonDisk.prototype = {
    getPoints: function() {
      return this._points
    },
    reset: function() {
      this._currentDistance = this._initialDistance,
        this._points = []
    },
    generatePoints: function(e) {
      for (var t = 0; t < e; ++t)
        this.generatePoint()
    },
    generatePoint: function() {
      for (;;) {
        for (var e = 0, t = this._currentDistance * this._currentDistance; e++ < this._maxTests;) {
          var n = this._getCandidate();
          if (this._isValid(n, t))
            return void this._points.push(n)
        }
        this._currentDistance *= this._decayFactor
      }
    },
    _getCandidate: function() {
      for (;;) {
        var e = 2 * Math.random() - 1,
          t = 2 * Math.random() - 1;
        if (this._mode == PoissonDisk.SQUARE || e * e + t * t <= 1)
          return new THREE.Vector2(e, t)
      }
    },
    _isValid: function(e, t) {
      for (var n = this._points.length, i = 0; i < n; ++i) {
        var r = this._points[i],
          o = e.x - r.x,
          a = e.y - r.y;
        if (o * o + a * a < t)
          return !1
      }
      return !0
    }
  },
  PoissonSphere = function(e, t, n, i) {
    this._mode = void 0 === e ? PoissonSphere.SPHERICAL : e,
      this._initialDistance = t || 1,
      this._decayFactor = n || .99,
      this._maxTests = i || 2e4,
      this._currentDistance = 0,
      this._points = null,
      this.reset()
  },
  PoissonSphere.BOX = 0,
  PoissonSphere.SPHERICAL = 1,
  PoissonSphere.prototype = {
    getPoints: function() {
      return this._points
    },
    reset: function() {
      this._currentDistance = this._initialDistance,
        this._points = []
    },
    generatePoints: function(e) {
      for (var t = 0; t < e; ++t)
        this.generatePoint()
    },
    generatePoint: function() {
      for (;;) {
        for (var e = 0, t = this._currentDistance * this._currentDistance; e++ < this._maxTests;) {
          var n = this._getCandidate();
          if (this._isValid(n, t))
            return this._points.push(n),
              n
        }
        this._currentDistance *= this._decayFactor
      }
    },
    _getCandidate: function() {
      for (;;) {
        var e = 2 * Math.random() - 1,
          t = 2 * Math.random() - 1,
          n = 2 * Math.random() - 1;
        if (this._mode === PoissonSphere.BOX || e * e + t * t + n * n <= 1)
          return new THREE.Vector4(e, t, n, 0)
      }
    },
    _isValid: function(e, t) {
      for (var n = this._points.length, i = 0; i < n; ++i) {
        var r = this._points[i],
          o = e.x - r.x,
          a = e.y - r.y,
          s = e.z - r.z;
        if (o * o + a * a + s * s < t)
          return !1
      }
      return !0
    }
  },
  BilateralGaussianBlurShader = {
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
  },
  GaussianBlurHDREShader = {
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
    fragmentShader: ShaderLibrary.get("gaussian_blur_hdre_fragment")
  },
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
  SceneDepthRenderer.prototype = {
    get texture() {
      return this._renderTarget.texture
    },
    resize: function(e, t) {
      e = Math.floor(e * this._scale),
        t = Math.floor(t * this._scale),
        this._renderTarget && this._renderTarget.width === e && this._renderTarget.height === t || (this._renderTarget = new THREE.WebGLRenderTarget(e, t, {
          type: this._textureType,
          minFilter: THREE.LinearFilter,
          magFilter: THREE.LinearFilter,
          generateMipmaps: !1,
          depthBuffer: !0,
          stencilBuffer: !1
        }))
    },
    render: function(e) {
      this._depthMaterial.cameraNear = e.near,
        this._depthMaterial.rcpCameraRange = 1 / (e.far - e.near),
        this._renderer.setClearColor(16777215, 1),
        this._scene.overrideMaterial = this._depthMaterial,
        this._renderer.render(this._scene, e, this._renderTarget, !0),
        this._scene.overrideMaterial = null,
        this._renderer.setClearColor(0, 1)
    }
  },
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
  SPHContent.BALL_MODE = 0,
  SPHContent.CASCADE_MODE = 1,
  SPHContent.prototype = {
    init: function(e) {
      this._numLightSamples = 8,
        this._numVolumeSamples = this._quality === SPH.Quality.HIGH ? 16 : 8,
        this._volume = 1,
        this._numParticles = this._quality === SPH.Quality.EXTREME ? 20480 : 10240,
        this._scene = e.scene,
        this._camera = e.camera,
        this._camera.far = 100,
        this._renderer = e.renderer,
        this._assetLibrary = e.assetLibrary,
        this._container = document.getElementById("webglcontainer");
      var t = this._renderer.extensions;
      if (!t.get("OES_texture_float_linear"))
        throw new Error("Float render targets are unsupported!");
      this._spawnRatio = .003,
        this._mode === SPHContent.BALL_MODE ? this._setup = new SPHBallSetup : this._mode === SPHContent.CASCADE_MODE && (this._setup = new SPHCascadeSetup(this._assetLibrary.get("cascademap")),
          this._spawnRatio = .001),
        this._sph = new SPH(2, 2, 2, this._numParticles, this._volume, this._setup, this._renderer, this._quality),
        this._mie = new THREE.Color((-.01), (-.01), (-.011)),
        this._mie.multiplyScalar(1.5),
        this._fluidAbsorption = new THREE.Color(25, 3, 2),
        this._mode === SPHContent.CASCADE_MODE && (this._fluidAbsorption = new THREE.Color(8, 25, 23),
          this._sph.viscosity = 50,
          this._sph.stiffness = 3,
          this._sph.surfaceTension = .25),
        this._fluidAbsorption.multiplyScalar(3),
        this._particleDepthRenderer = new ParticleDepthRenderer(this._scene, this._renderer, this._sph, .5),
        this._sceneDepthRenderer = new SceneDepthRenderer(this._scene, this._renderer, .5),
        this._distanceFieldRenderer = new SPHDistanceFieldRenderer(this._renderer, this._sph),
        this._initCameraController(),
        this._initScene(),
        this._dragging = !1,
        this._mode === SPHContent.BALL_MODE ? this._initCollider() : this._initTerrain()
    },
    _onMouseDown: function(e) {
      this._updateRaycaster(e.clientX, e.clientY);
      var t = this._rayCaster.intersectObject(this._blocker);
      t.length > 0 && (this._dragging = !0,
        this._cameraController.enabled = !1)
    },
    _onMouseUp: function(e) {
      this._dragging = !1,
        this._cameraController.enabled = !0
    },
    _onMouseMove: function(e) {
      if (this._dragging) {
        var t = this._blocker.position.y;
        this._updateRaycaster(e.clientX, e.clientY);
        var n = this._rayCaster.ray.origin,
          i = this._rayCaster.ray.direction,
          r = (t - n.y) / i.y;
        this._blocker.position.x = THREE.Math.clamp(n.x + r * i.x, -2, 2),
          this._blocker.position.z = THREE.Math.clamp(n.z + r * i.z, -2, 2)
      }
    },
    _updateRaycaster: function(e, t) {
      e = e / window.innerWidth * 2 - 1,
        t = -(t / window.innerHeight * 2 - 1),
        this._rayCaster.setFromCamera(new THREE.Vector2(e, t), this._camera)
    },
    start: function() {},
    destroy: function() {},
    resize: function(e, t) {
      this._particleDepthRenderer.resize(window.innerWidth, window.innerHeight),
        this._sceneDepthRenderer.resize(window.innerWidth, window.innerHeight),
        this._fluidMaterial.pixelSize.x = 1 / e,
        this._fluidMaterial.pixelSize.y = 1 / t
    },
    update: function(e) {
      this._camera.updateMatrixWorld(!0),
        this._sph.spawn(this._numParticles * this._spawnRatio),
        this._mode === SPHContent.BALL_MODE ? (this._setup.collider.spherePosition = this._blocker.position,
          this._sph.update(16)) : this._sph.update(8),
        this._fluidMesh.visible = !1,
        this._sky.visible = !1,
        this._mode === SPHContent.CASCADE_MODE && (this._blocker.visible = !1),
        this._particleDepthRenderer.render(this._camera),
        this._sceneDepthRenderer.render(this._camera),
        this._distanceFieldRenderer.render(),
        this._fluidMesh.visible = !0,
        this._sky.visible = !0,
        this._mode === SPHContent.CASCADE_MODE && (this._blocker.visible = !0),
        this._lightingRenderer.render(this._distanceFieldRenderer.texture, this._fluidMesh, this._camera),
        this._fluidMaterial.update(this._fluidMesh, this._camera, this._lightingRenderer.texture, this._particleDepthRenderer.texture, this._sceneDepthRenderer.texture)
    },
    _initCameraController: function() {
      var e = new OrbitController(document.getElementById("webglcontainer"));
      e.azimuth = .5 * Math.PI,
        e.radius = 3,
        e.minRadius = 1,
        e.maxRadius = 1e3,
        e.zoomSpeed = 5,
        e.lookAtTarget.y = -.5,
        e.maxPolar = .5 * Math.PI + .1,
        Entity.addComponent(this._camera, e),
        this._cameraController = e,
        this._mode === SPHContent.CASCADE_MODE && (e.maxAzimuth = .5 * Math.PI - .5,
          e.minAzimuth = .5 * -Math.PI + .5)
    },
    _addLight: function(e, t, n) {
      var i = new THREE.DirectionalLight;
      i.position.set(e, t, n),
        this._scene.add(i),
        i = new THREE.DirectionalLight,
        i.position.set(e, t, n),
        this._lightingRenderer.addLight(i)
    },
    _initScene: function() {
      var e = this._sph.boxSize,
        t = this._assetLibrary.get("skybox");
      this._sky = new Skybox(t, 50),
        this._scene.add(this._sky),
        this._fluidMaterial = new RenderVolumeMaterial(this._sph, t, this._numVolumeSamples),
        this._fluidMaterial.absorption = this._fluidAbsorption,
        this._fluidMaterial.mie = this._mie;
      var n = new THREE.BoxBufferGeometry(e.x, e.y, e.z);
      this._fluidMesh = new THREE.Mesh(n, this._fluidMaterial),
        this._scene.add(this._fluidMesh),
        this._lightingRenderer = new VolumetricLightRenderer(this._renderer, this._sph.numCells, this._sph.cellSize, this._numLightSamples, (!0), .5),
        this._lightingRenderer.absorption = this._fluidAbsorption,
        this._lightingRenderer.mie = this._mie,
        this._addLight(1, .3, 1)
    },
    _initCollider: function() {
      this._rayCaster = new THREE.Raycaster;
      var e = .15,
        t = new THREE.SphereBufferGeometry(e, 30, 20),
        n = new DielectricMaterial({
          color: 16777215,
          irradianceProbe: this._assetLibrary.get("irradiance"),
          roughness: .5
        });
      this._blocker = new THREE.Mesh(t, n),
        this._blocker.position.y = .5 * -this._sph.boxSize.y + e,
        this._scene.add(this._blocker),
        this._setup.collider.sphereRadius = e,
        document.addEventListener("mousedown", this._onMouseDown.bind(this)),
        document.addEventListener("mouseup", this._onMouseUp.bind(this)),
        document.addEventListener("mousemove", this._onMouseMove.bind(this))
    },
    _initTerrain: function() {
      var e = new THREE.PlaneBufferGeometry(this._sph.boxSize.x, this._sph.boxSize.z, 64, 64);
      e.rotateX(.5 * -Math.PI);
      var t = this._assetLibrary.get("cascademap");
      t.wrapS = THREE.ClampToEdgeWrapping,
        t.wrapT = THREE.ClampToEdgeWrapping;
      var n = new THREE.MeshStandardMaterial({
        displacementMap: t,
        displacementScale: this._sph.boxSize.y,
        displacementBias: .5 * -this._sph.boxSize.y,
        color: 0,
        wireframe: !0
      });
      this._blocker = new THREE.Mesh(e, n),
        this._scene.add(this._blocker)
    }
  },
  Skybox.prototype = Object.create(THREE.Mesh.prototype, {
    texture: {
      get: function() {
        return this.material.envMap
      },
      set: function(e) {
        this.material.envMap = e
      }
    }
  }),
  SPHDistanceFieldRenderer.prototype = {
    get texture() {
      return this._distanceField.texture
    },
    render: function() {
      this._material.positionBuffer = this._sph.positionBuffer,
        this._renderer.setClearColor(new THREE.Color(1e3, 0, 0), 1),
        this._pointRenderer.clear(this._distanceField);
      for (var e = -this._zRange; e <= this._zRange; ++e)
        this._material.zSliceOffset = e,
        this._pointRenderer.execute(this._material, this._distanceField, !1);
      this._renderer.setClearColor(0, 1)
    }
  },
  ParticleBlurredRenderer.prototype = {
    get texture() {
      return this._renderTarget.source
    },
    resize: function(e, t) {
      e = Math.floor(e * this._scale),
        t = Math.floor(t * this._scale),
        this._renderTarget && this._renderTarget.width === e && this._renderTarget.height === t || (this._renderTarget = new DoubleBufferTexture(e, t, {
          type: this._textureType,
          minFilter: THREE.LinearFilter,
          magFilter: THREE.LinearFilter,
          generateMipmaps: !1,
          depthBuffer: !0,
          stencilBuffer: !1
        }))
    },
    render: function(e) {
      this._renderParticles(e, this._renderTarget.target),
        this._renderTarget.swap(),
        this._blur()
    },
    _renderParticles: function(e, t) {
      throw new Error("Abstract method called!")
    },
    _blur: function() {
      this._blurMaterial.uniforms.tDiffuse.value = this._renderTarget.source,
        this._blurMaterial.uniforms.sampleStep.value.x = 1 / this._renderTarget.width,
        this._blurMaterial.uniforms.sampleStep.value.y = 0,
        this._rectRenderer.execute(this._blurMaterial, this._renderTarget.target, !0),
        this._renderTarget.swap(),
        this._blurMaterial.uniforms.tDiffuse.value = this._renderTarget.source,
        this._blurMaterial.uniforms.sampleStep.value.x = 0,
        this._blurMaterial.uniforms.sampleStep.value.y = 1 / this._renderTarget.height,
        this._rectRenderer.execute(this._blurMaterial, this._renderTarget.target, !0),
        this._renderTarget.swap()
    },
    _getGaussian: function(e) {
      for (var t = CenteredGaussianCurve.fromRadius(e, .2), n = [], i = 0, r = 0; r <= e; ++r) {
        var o = t.getValueAt(r);
        n[r] = o,
          i += 0 === r ? o : 2 * o
      }
      for (var r = 0; r <= e; ++r)
        n[r] /= i;
      return n
    }
  },
  ParticleDepthMaterial = function() {
    THREE.ShaderMaterial.call(this, {
        uniforms: {
          positionBuffer: {
            value: null
          },
          particleSize: {
            value: 100
          },
          viewportSize: {
            value: new THREE.Vector2
          },
          cameraNear: {
            value: .1
          },
          rcpCameraRange: {
            value: 0
          }
        },
        vertexShader: ShaderLibrary.get("sph_particle_depth_vertex"),
        fragmentShader: ShaderLibrary.get("sph_particle_depth_fragment")
      }),
      this.extensions.fragDepth = !0
  },
  ParticleDepthMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype, {
    positionBuffer: {
      get: function() {
        return this.uniforms.positionBuffer.value
      },
      set: function(e) {
        this.uniforms.positionBuffer.value = e
      }
    },
    particleSize: {
      get: function() {
        return this.uniforms.particleSize.value
      },
      set: function(e) {
        this.uniforms.particleSize.value = e
      }
    },
    cameraNear: {
      get: function() {
        return this.uniforms.cameraNear.value
      },
      set: function(e) {
        this.uniforms.cameraNear.value = e
      }
    },
    rcpCameraRange: {
      get: function() {
        return this.uniforms.rcpCameraRange.value
      },
      set: function(e) {
        this.uniforms.rcpCameraRange.value = e
      }
    },
    viewportSize: {
      get: function() {
        return this.uniforms.viewportSize.value
      },
      set: function(e) {
        this.uniforms.viewportSize.value = e
      }
    }
  }),
  ParticleDepthRenderer.prototype = Object.create(ParticleBlurredRenderer.prototype),
  ParticleDepthRenderer.prototype._renderParticles = function(e, t) {
    this._depthMaterial.positionBuffer = this._particleSim.positionBuffer,
      this._depthMaterial.cameraNear = e.near,
      this._depthMaterial.rcpCameraRange = 1 / (e.far - e.near),
      this._renderer.setClearColor(16777215, 1),
      this._pointRenderer.execute(this._depthMaterial, t, !0, e),
      this._renderer.setClearColor(0, 1)
  },
  ParticleDepthRenderer.prototype.resize = function(e, t) {
    ParticleBlurredRenderer.prototype.resize.call(this, e, t),
      this._depthMaterial.viewportSize.x = this._renderTarget.width,
      this._depthMaterial.viewportSize.y = this._renderTarget.height
  },
  SPH.Quality = {
    LOW: 1,
    HIGH: 2,
    EXTREME: 2
  },
  SPH.prototype = {
    get quality() {
      return this._quality
    },
    get halfExtent() {
      return this._halfExtent
    },
    get cellSize() {
      return this._cellSize
    },
    get numCells() {
      return this._numCells
    },
    get boxSize() {
      return this._boxSize
    },
    get restDensity() {
      return this._restDensity
    },
    get restDistance() {
      return this._restDistance
    },
    get particleMass() {
      return this._particleMass
    },
    get particleRadius() {
      return this._particleRadius
    },
    get smoothingRadius() {
      return this._smoothingRadius
    },
    get particleBufferSize() {
      return this._particleBufferSize
    },
    get bucketPixelSize() {
      return this._bucketPixelSize
    },
    get pointGeometry() {
      return this._pointGeometry
    },
    get positionBuffer() {
      return this._positionBuffer.source
    },
    get bucketBuffer() {
      return this._bucketBuffer.texture
    },
    get densityBuffer() {
      return this._densityBuffer.texture
    },
    get accelBuffer() {
      return this._accelBuffer.source
    },
    get velocityBuffer() {
      return this._velocityBuffer.source
    },
    get collisionBuffer() {
      return this._setup.collider.texture
    },
    get initVelocityGLSL() {
      return this._setup.getInitVelocityGLSL()
    },
    spawn: function(e) {
      this._numParticles += Math.floor(e),
        this._numParticles > this._maxParticles && (this._numParticles = this._maxParticles)
    },
    reset: function() {
      this._numParticles = 0,
        this._initParticles(),
        this._renderer.setClearColor(0, 1),
        this._renderRect.clear(this._accelBuffer.target),
        this._accelBuffer.swap(),
        this._renderRect.clear(this._accelBuffer.target),
        this._accelBuffer.swap(),
        this._renderRect.clear(this._velocityBuffer.target),
        this._velocityBuffer.swap()
    },
    _initParticles: function() {
      for (var e = new THREE.Vector3, t = [], n = 0; n < this._maxParticles; ++n)
        this._setup.initParticlePosition(n, this._maxParticles, this._halfExtent, e),
        t.push(e.x, e.y, e.z, n + 1);
      var i = this._particleBufferSize.x * this._particleBufferSize.y;
      for (n = this._maxParticles; n < i; ++n)
        t.push(0, 0, 0, n + 1);
      var r = new Float32Array(t);
      CopyDataToRenderTarget.execute(r, this._positionBuffer.target, this._renderer, THREE.FloatType),
        this._positionBuffer.swap()
    },
    _createPointGeometry: function() {
      for (var e = new THREE.BufferGeometry, t = [], n = [], i = [], r = this._particleBufferSize.x, o = this._particleBufferSize.y, a = 0; a < this._maxParticles; ++a) {
        var s = Math.floor(a / r),
          l = a - s * r;
        l = (l + .5) / r,
          s = (s + .5) / o,
          i.push(l, s),
          n.push(a),
          t.push(a)
      }
      return e.setIndex(new THREE.BufferAttribute(new Uint32Array(t), 1)),
        e.addAttribute("positionUV", new THREE.BufferAttribute(new Float32Array(i), 2)),
        e.addAttribute("particleIndex", new THREE.BufferAttribute(new Float32Array(n), 1)),
        e
    },
    update: function(e, t) {
      e *= .001,
        0 === e && (e = .01),
        this._pointGeometry.setDrawRange(0, this._numParticles),
        this._setup.collider.update(),
        t = 2 | t,
        e /= t;
      for (var n = 0; n < t; ++n)
        this._updateBucket(),
        this._updateDensity(),
        this._updateAccel(e),
        this._updateVelocity(e),
        this._updatePosition(e)
    },
    _updateBucket: function() {
      var e = this._renderer.context;
      this._bucketMaterial.positionBuffer = this._positionBuffer.source,
        this._bucketMaterial.numParticles = this._maxParticles,
        this._bucketMaterial.depthFunc = THREE.LessDepth;
      var t = this._renderer.state.buffers.stencil;
      t.setMask(255),
        t.setClear(0),
        t.setTest(!0),
        t.setOp(e.KEEP, e.KEEP, e.KEEP),
        t.setFunc(e.ALWAYS, 0, 255),
        this._renderer.setClearColor(0, 0),
        this._renderBucketPass(!0, !1, !1, !1, !0),
        t.setOp(e.KEEP, e.KEEP, e.INCR),
        t.setFunc(e.GREATER, 1, 255),
        this._bucketMaterial.depthFunc = THREE.GreaterDepth,
        this._renderBucketPass(!1, !0, !1, !1, !1),
        this._renderBucketPass(!1, !1, !0, !1, !1),
        this._renderBucketPass(!1, !1, !1, !0, !1),
        t.setTest(!1),
        t.setOp(e.KEEP, e.KEEP, e.KEEP),
        t.setFunc(e.ALWAYS, 0, 4294967295)
    },
    _renderBucketPass: function(e, t, n, i, r) {
      var o = this._renderer.state.buffers.color;
      this._renderer.clearTarget(this._bucketBuffer, r, r, !0),
        o.setMask(e, t, n, i),
        o.setLocked(!0),
        this._renderPoints.execute(this._bucketMaterial, this._bucketBuffer, !1),
        o.setLocked(!1)
    },
    _updateDensity: function() {
      this._densityMaterial.positionBuffer = this._positionBuffer.source,
        this._densityMaterial.bucketBuffer = this._bucketBuffer.texture,
        this._densityMaterial.particleMass = this.particleMass,
        this._renderRect.execute(this._densityMaterial, this._densityBuffer)
    },
    _updateAccel: function(e) {
      this._accelMaterial.positionBuffer = this._positionBuffer.source,
        this._accelMaterial.bucketBuffer = this._bucketBuffer.texture,
        this._accelMaterial.densityBuffer = this._densityBuffer.texture,
        this._accelMaterial.velocityBuffer = this._velocityBuffer.source,
        this._accelMaterial.restDensity = this.restDensity,
        this._accelMaterial.particleMass = this.particleMass,
        this._accelMaterial.viscosity = this.viscosity,
        this._accelMaterial.stiffness = this.stiffness,
        this._accelMaterial.gravity = this.gravity,
        this._accelMaterial.curvatureThreshold = this.curvatureThreshold,
        this._accelMaterial.surfaceTension = this.surfaceTension,
        this._accelMaterial.maxParticleIndex = this._numParticles + 1,
        this._accelMaterial.dt = e,
        this._renderRect.execute(this._accelMaterial, this._accelBuffer.target),
        this._accelBuffer.swap()
    },
    _updatePosition: function(e) {
      this._positionMaterial.positionBuffer = this._positionBuffer.source,
        this._positionMaterial.velocityBuffer = this._velocityBuffer.source,
        this._positionMaterial.accelBuffer = this._accelBuffer.source,
        this._positionMaterial.maxParticleIndex = this._numParticles + 1,
        this._positionMaterial.dt = e,
        this._renderRect.execute(this._positionMaterial, this._positionBuffer.target),
        this._positionBuffer.swap()
    },
    _updateVelocity: function(e) {
      this._velocityMaterial.positionBuffer = this._positionBuffer.source,
        this._velocityMaterial.velocityBuffer = this._velocityBuffer.source,
        this._velocityMaterial.accelBuffer1 = this._accelBuffer.source,
        this._velocityMaterial.accelBuffer2 = this._accelBuffer.target.texture,
        this._velocityMaterial.maxParticleIndex = this._numParticles + 1,
        this._velocityMaterial.dt = e,
        this._renderRect.execute(this._velocityMaterial, this._velocityBuffer.target),
        this._velocityBuffer.swap()
    },
    _rtOptions: function(e) {
      return {
        type: THREE.FloatType,
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        generateMipmaps: !1,
        depthBuffer: e || !1,
        stencilBuffer: e || !1,
        format: THREE.RGBAFormat
      }
    }
  },
  SPHAccelMaterial = function(e) {
    var t = {
      SAMPLE_RADIUS: e.quality,
      BUCKET_SIZE: 4
    };
    THREE.ShaderMaterial.call(this, {
      defines: t,
      uniforms: {
        positionBuffer: {
          value: null
        },
        bucketBuffer: {
          value: null
        },
        velocityBuffer: {
          value: null
        },
        densityBuffer: {
          value: null
        },
        dt: {
          value: 1
        },
        drag: {
          value: 0
        },
        maxParticleIndex: {
          value: 0
        },
        numCells: {
          value: e.numCells
        },
        cellSize: {
          value: e.cellSize
        },
        stiffness: {
          value: e.stiffness
        },
        restDensity: {
          value: e.restDensity
        },
        gravity: {
          value: -9.81
        },
        particleBufferSize: {
          value: e.particleBufferSize
        },
        bucketPixelSize: {
          value: e.bucketPixelSize
        },
        mass: {
          value: e.particleMass
        },
        h: {
          value: e.smoothingRadius
        },
        h2: {
          value: Math.pow(e.smoothingRadius, 2)
        },
        pressNorm: {
          value: -45 / (Math.PI * Math.pow(e.smoothingRadius, 6))
        },
        viscNorm: {
          value: 45 / (Math.PI * Math.pow(e.smoothingRadius, 6))
        },
        surfaceNorm: {
          value: -945 / (32 * Math.PI * Math.pow(e.smoothingRadius, 9))
        },
        curvatureThreshold: {
          value: e.curvatureThreshold
        },
        surfaceTension: {
          value: e.surfaceTension
        },
        viscosity: {
          value: 0
        }
      },
      vertexShader: ShaderLibrary.get("sph_quad_vertex"),
      fragmentShader: ShaderLibrary.get("sph_accel_fragment")
    })
  },
  SPHAccelMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype, {
    positionBuffer: {
      get: function() {
        return this.uniforms.positionBuffer.value
      },
      set: function(e) {
        this.uniforms.positionBuffer.value = e
      }
    },
    densityBuffer: {
      get: function() {
        return this.uniforms.densityBuffer.value
      },
      set: function(e) {
        this.uniforms.densityBuffer.value = e
      }
    },
    velocityBuffer: {
      get: function() {
        return this.uniforms.velocityBuffer.value
      },
      set: function(e) {
        this.uniforms.velocityBuffer.value = e
      }
    },
    viscosity: {
      get: function() {
        return this.uniforms.viscosity.value
      },
      set: function(e) {
        this.uniforms.viscosity.value = e
      }
    },
    restDensity: {
      get: function() {
        return this.uniforms.restDensity.value
      },
      set: function(e) {
        this.uniforms.restDensity.value = e
      }
    },
    curvatureThreshold: {
      get: function() {
        return this.uniforms.curvatureThreshold.value
      },
      set: function(e) {
        this.uniforms.curvatureThreshold.value = e
      }
    },
    surfaceTension: {
      get: function() {
        return this.uniforms.surfaceTension.value
      },
      set: function(e) {
        this.uniforms.surfaceTension.value = e
      }
    },
    stiffness: {
      get: function() {
        return this.uniforms.stiffness.value
      },
      set: function(e) {
        this.uniforms.stiffness.value = e
      }
    },
    particleMass: {
      get: function() {
        return this.uniforms.mass.value
      },
      set: function(e) {
        this.uniforms.mass.value = e
      }
    },
    gravity: {
      get: function() {
        return this.uniforms.gravity.value
      },
      set: function(e) {
        this.uniforms.gravity.value = e
      }
    },
    bucketBuffer: {
      get: function() {
        return this.uniforms.bucketBuffer.value
      },
      set: function(e) {
        this.uniforms.bucketBuffer.value = e
      }
    },
    dt: {
      get: function() {
        return this.uniforms.dt.value
      },
      set: function(e) {
        this.uniforms.dt.value = e
      }
    },
    drag: {
      get: function() {
        return this.uniforms.drag.value
      },
      set: function(e) {
        this.uniforms.drag.value = e
      }
    },
    maxParticleIndex: {
      get: function() {
        return this.uniforms.maxParticleIndex.value
      },
      set: function(e) {
        this.uniforms.maxParticleIndex.value = e
      }
    }
  }),
  SPHBallCollider.prototype = Object.create(SPHCollider.prototype, {
    sphereRadius: {
      get: function() {
        return this._material.sphereRadius
      },
      set: function(e) {
        this._material.sphereRadius !== e && this.invalidate(),
          this._material.sphereRadius = e
      }
    },
    spherePosition: {
      get: function() {
        return this._material.spherePosition
      },
      set: function(e) {
        this._material.spherePosition.equals(e) || this.invalidate(),
          this._material.spherePosition = e
      }
    }
  }),
  SPHBallCollider.prototype._updateMaterial = function() {},
  SPHBallColliderMaterial = function() {
    THREE.ShaderMaterial.call(this, {
      uniforms: {
        wallExtent: {
          value: null
        },
        numCells: {
          value: null
        },
        cellSize: {
          value: 0
        },
        sphereRadius: {
          value: .2
        },
        spherePosition: {
          value: new THREE.Vector3
        }
      },
      vertexShader: ShaderLibrary.get("sph_quad_vertex"),
      fragmentShader: ShaderLibrary.getInclude("distance_functions") + ShaderLibrary.get("sph_ball_collider_fragment")
    })
  },
  SPHBallColliderMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype, {
    sphereRadius: {
      get: function() {
        return this.uniforms.sphereRadius.value
      },
      set: function(e) {
        this.uniforms.sphereRadius.value = e
      }
    },
    spherePosition: {
      get: function() {
        return this.uniforms.spherePosition.value
      },
      set: function(e) {
        this.uniforms.spherePosition.value.copy(e)
      }
    }
  }),
  SPHBallSetup.prototype = {
    getStartParticleCount: function(e) {
      return 0
    },
    getInitVelocityGLSL: function() {
      return ShaderLibrary.getInclude("sph_init_velocity_stream")
    },
    initParticlePosition: function(e, t, n, i) {
      var r = new THREE.Spherical;
      return function(e, t, n, i) {
        var o = n.length() / 6;
        r.radius = Math.random() * o,
          r.phi = Math.random() * Math.PI,
          r.theta = Math.random() * Math.PI * 2,
          i.setFromSpherical(r),
          i.x -= .5 * n.x,
          i.y += .5 * n.y,
          i.z -= .5 * n.z
      }
    }()
  },
  SPHBucketMaterial = function(e) {
    THREE.ShaderMaterial.call(this, {
      uniforms: {
        positionBuffer: {
          value: null
        },
        numCells: {
          value: e.numCells
        },
        numParticles: {
          value: e.numParticles
        },
        cellSize: {
          value: e.cellSize
        }
      },
      vertexShader: ShaderLibrary.get("sph_bucket_vertex"),
      fragmentShader: ShaderLibrary.get("sph_bucket_fragment")
    })
  },
  SPHBucketMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype, {
    positionBuffer: {
      get: function() {
        return this.uniforms.positionBuffer.value
      },
      set: function(e) {
        this.uniforms.positionBuffer.value = e
      }
    },
    numParticles: {
      get: function() {
        return this.uniforms.numParticles.value
      },
      set: function(e) {
        this.uniforms.numParticles.value = e
      }
    }
  }),
  SPHCascadeSetup.prototype = {
    getStartParticleCount: function(e) {
      return 0
    },
    getInitVelocityGLSL: function() {
      return ShaderLibrary.getInclude("sph_init_velocity_still")
    },
    initParticlePosition: function(e, t, n, i) {
      i.x = -n.x * (.2 * Math.random() + .8),
        i.y = .9 * n.y,
        i.z = (2 * Math.random() - 1) * n.z * .2
    }
  },
  SPHDensityMaterial = function(e) {
    var t = {
      SAMPLE_RADIUS: e.quality,
      BUCKET_SIZE: 4
    };
    THREE.ShaderMaterial.call(this, {
      defines: t,
      uniforms: {
        positionBuffer: {
          value: null
        },
        collisionBuffer: {
          value: e.collisionBuffer
        },
        bucketBuffer: {
          value: null
        },
        numCells: {
          value: e.numCells
        },
        cellSize: {
          value: e.cellSize
        },
        particleBufferSize: {
          value: e.particleBufferSize
        },
        bucketPixelSize: {
          value: e.bucketPixelSize
        },
        mass: {
          value: e.particleMass
        },
        h2: {
          value: e.smoothingRadius * e.smoothingRadius
        },
        kernelNorm: {
          value: 315 / (64 * Math.PI * Math.pow(e.smoothingRadius, 9))
        }
      },
      vertexShader: ShaderLibrary.get("sph_quad_vertex"),
      fragmentShader: ShaderLibrary.get("sph_density_fragment")
    })
  },
  SPHDensityMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype, {
    positionBuffer: {
      get: function() {
        return this.uniforms.positionBuffer.value
      },
      set: function(e) {
        this.uniforms.positionBuffer.value = e
      }
    },
    bucketBuffer: {
      get: function() {
        return this.uniforms.bucketBuffer.value
      },
      set: function(e) {
        this.uniforms.bucketBuffer.value = e
      }
    },
    particleMass: {
      get: function() {
        return this.uniforms.mass.value
      },
      set: function(e) {
        this.uniforms.mass.value = e
      }
    }
  }),
  SPHDistanceMaterial = function(e) {
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
  },
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
  }),
  SPHHeightMapCollider.prototype = Object.create(SPHCollider.prototype),
  SPHHeightMapColliderMaterial = function(e) {
    THREE.ShaderMaterial.call(this, {
      uniforms: {
        numCells: {
          value: null
        },
        cellSize: {
          value: 0
        },
        heightMap: {
          value: e
        },
        wallExtent: {
          value: null
        }
      },
      vertexShader: ShaderLibrary.get("sph_quad_vertex"),
      fragmentShader: ShaderLibrary.getInclude("distance_functions") + ShaderLibrary.get("sph_heightmap_collider_fragment")
    })
  },
  SPHHeightMapColliderMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype),
  SPHPositionMaterial = function(e) {
    THREE.ShaderMaterial.call(this, {
      uniforms: {
        positionBuffer: {
          value: null
        },
        velocityBuffer: {
          value: null
        },
        accelBuffer: {
          value: null
        },
        dt: {
          value: 1
        },
        wallExtent: {
          value: e.halfExtent
        },
        restDistance: {
          value: e.restDistance
        },
        maxParticleIndex: {
          value: 0
        }
      },
      vertexShader: ShaderLibrary.get("sph_quad_vertex"),
      fragmentShader: ShaderLibrary.get("sph_position_fragment")
    })
  },
  SPHPositionMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype, {
    positionBuffer: {
      get: function() {
        return this.uniforms.positionBuffer.value
      },
      set: function(e) {
        this.uniforms.positionBuffer.value = e
      }
    },
    velocityBuffer: {
      get: function() {
        return this.uniforms.velocityBuffer.value
      },
      set: function(e) {
        this.uniforms.velocityBuffer.value = e
      }
    },
    accelBuffer: {
      get: function() {
        return this.uniforms.accelBuffer.value
      },
      set: function(e) {
        this.uniforms.accelBuffer.value = e
      }
    },
    dt: {
      get: function() {
        return this.uniforms.dt.value
      },
      set: function(e) {
        this.uniforms.dt.value = e
      }
    },
    maxParticleIndex: {
      get: function() {
        return this.uniforms.maxParticleIndex.value
      },
      set: function(e) {
        this.uniforms.maxParticleIndex.value = e
      }
    }
  }),
  SPHVelocityMaterial = function(e) {
    THREE.ShaderMaterial.call(this, {
      uniforms: {
        positionBuffer: {
          value: null
        },
        velocityBuffer: {
          value: null
        },
        accelBuffer1: {
          value: null
        },
        accelBuffer2: {
          value: null
        },
        collisionBuffer: {
          value: e.collisionBuffer
        },
        dt: {
          value: 1
        },
        numCells: {
          value: e.numCells
        },
        cellSize: {
          value: e.cellSize
        },
        restDistance: {
          value: e.restDistance
        },
        particleBufferSize: {
          value: e.particleBufferSize
        },
        maxParticleIndex: {
          value: 0
        }
      },
      vertexShader: ShaderLibrary.get("sph_quad_vertex"),
      fragmentShader: e.initVelocityGLSL + ShaderLibrary.get("sph_velocity_fragment")
    })
  },
  SPHVelocityMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype, {
    positionBuffer: {
      get: function() {
        return this.uniforms.positionBuffer.value
      },
      set: function(e) {
        this.uniforms.positionBuffer.value = e
      }
    },
    velocityBuffer: {
      get: function() {
        return this.uniforms.velocityBuffer.value
      },
      set: function(e) {
        this.uniforms.velocityBuffer.value = e
      }
    },
    accelBuffer1: {
      get: function() {
        return this.uniforms.accelBuffer1.value
      },
      set: function(e) {
        this.uniforms.accelBuffer1.value = e
      }
    },
    accelBuffer2: {
      get: function() {
        return this.uniforms.accelBuffer2.value
      },
      set: function(e) {
        this.uniforms.accelBuffer2.value = e
      }
    },
    dt: {
      get: function() {
        return this.uniforms.dt.value
      },
      set: function(e) {
        this.uniforms.dt.value = e
      }
    },
    maxParticleIndex: {
      get: function() {
        return this.uniforms.maxParticleIndex.value
      },
      set: function(e) {
        this.uniforms.maxParticleIndex.value = e
      }
    }
  }),
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
  }),
  VolumetricLightRenderer.prototype = {
    get absorption() {
      return this._material.absorption
    },
    set absorption(e) {
      this._material.absorption = e
    },
    get texture() {
      return this._target.texture
    },
    addLight: function(e) {
      this._rectRenderer._scene.add(e)
    },
    removeLight: function(e) {
      this._rectRenderer._scene.remove(e)
    },
    render: function(e, t, n) {
      var i = new THREE.Matrix4;
      i.getInverse(t.matrixWorld);
      var r = this._material.cameraPos;
      r.copy(n.position),
        r.applyMatrix4(i),
        this._material.densityField = e,
        this._rectRenderer.execute(this._material, this._target, !0)
    }
  },
  VolumetricNormals.prototype = Object.create(THREE.ShaderMaterial.prototype, {
    densityField: {
      get: function() {
        return this.uniforms.densityField.value
      },
      set: function(e) {
        this.uniforms.densityField.value = e
      }
    }
  }),
  VolumetricNormalsRenderer.prototype = {
    render: function(e, t) {
      this._material.densityField = e,
        this._renderer.render(this._scene, this._camera, t, !0)
    }
  };
