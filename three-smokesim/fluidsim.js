function AsyncTaskQueue() {
  this.onComplete = new Signal,
    this.onProgress = new Signal,
    this._queue = [],
    this._childQueues = [],
    this._currentIndex = 0,
    this._isRunning = !1
}

function DoubleBufferTexture(e, t, n) {
  this._sourceFBO = new THREE.WebGLRenderTarget(e, t, n),
    this._targetFBO = new THREE.WebGLRenderTarget(e, t, n),
    this._sourceFBO.texture.generateMipmaps = n.generateMipmaps || !1,
    this._targetFBO.texture.generateMipmaps = n.generateMipmaps || !1
}

function isPlatformMobile() {
  var e = /AppleWebKit/.test(navigator.userAgent) && /Mobile\/\w+/.test(navigator.userAgent);
  return e || /Android|webOS|BlackBerry|Opera Mini|Opera Mobi|IEMobile/i.test(navigator.userAgent)
}

function RectRenderer(e) {
  this._renderer = e,
    this._scene = new THREE.Scene,
    this._camera = new THREE.OrthographicCamera((-1), 1, 1, (-1), 0, 1),
    this._quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), null),
    this._scene.add(this._quad)
}

function startUp() {
  highPerformance = !isPlatformMobile() && !QueryString.lowPerformance,
    assetLibrary = new AssetLibrary(""),
    assetLibrary.queueAsset("skybox", "textures/specular/", AssetLibrary.Type.TEXTURE_CUBE),
    assetLibrary.queueAsset("irradiance", "textures/irradiance/", AssetLibrary.Type.TEXTURE_CUBE),
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
  n.style.display = "none";
  var i = document.getElementById("info");
  i.style.display = "block",
    i = document.getElementById("infoOverlay"),
    i.style.display = "block";
  var r = document.getElementById("debugBox");
  r && (r.style.display = debugMode ? "inline" : "none"),
    mainProject = new SimpleThreeProject,
    mainProject.init(debugMode, assetLibrary),
    mainProject.content = new SmokeSimContent(e, t),
    mainProject.start(),
    document.body.addEventListener("mousedown", onMouseDown)
}

function onMouseDown() {
  document.getElementById("infoOverlay").style.display = "none",
    document.body.removeEventListener("mousedown", onMouseDown)
}

function resetSim() {
  mainProject.content.reset()
}

function AddDensity(e) {
  THREE.ShaderMaterial.call(this, {
    uniforms: {
      source: {
        value: null
      },
      amount: {
        value: 0
      },
      numCells: {
        value: new THREE.Vector3(e.numCellsX, e.numCellsY, e.numCellsZ)
      },
      sourcePosition: {
        value: new THREE.Vector3(0, 0, 0)
      },
      sourceRadius: {
        value: 6
      },
      temperature: {
        value: 100
      }
    },
    vertexShader: ShaderLibrary.get("fluid_vertex"),
    fragmentShader: ShaderLibrary.get("add_density_fragment")
  })
}

function AddWater(e) {
  THREE.ShaderMaterial.call(this, {
    uniforms: {
      source: {
        value: null
      },
      edgeMask: {
        value: null
      },
      radius: {
        value: 0
      },
      numCells: {
        value: new THREE.Vector3(e.numCellsX, e.numCellsY, e.numCellsZ)
      },
      sourcePosition: {
        value: new THREE.Vector3(.5, .5, .5)
      }
    },
    vertexShader: ShaderLibrary.get("fluid_vertex"),
    fragmentShader: ShaderLibrary.get("add_water_fragment")
  })
}

function AdvectMacCormack(e) {
  THREE.ShaderMaterial.call(this, {
    uniforms: {
      source: {
        value: null
      },
      velocity: {
        value: null
      },
      advected: {
        value: null
      },
      advectedReverse: {
        value: null
      },
      temperatureDissipation: {
        value: 1
      },
      rcpNumCellsZ: {
        value: 1 / e.numCellsZ
      },
      rcpTexSize: {
        value: new THREE.Vector2(e.pixelWidth, e.pixelHeight)
      },
      dt: {
        value: 0
      }
    },
    vertexShader: ShaderLibrary.get("fluid_vertex"),
    fragmentShader: ShaderLibrary.get("advect_maccormack_fragment")
  })
}

function AdvectSemiLagrangian(e) {
  THREE.ShaderMaterial.call(this, {
    uniforms: {
      velocity: {
        value: null
      },
      source: {
        value: null
      },
      edgeMask: {
        value: e.edgeMask
      },
      numCells: {
        value: new THREE.Vector3(e.numCellsX, e.numCellsY, e.numCellsZ)
      },
      dt: {
        value: 0
      }
    },
    vertexShader: ShaderLibrary.get("fluid_vertex"),
    fragmentShader: ShaderLibrary.get("advect_semi_lagrangian_fragment")
  })
}

function ApplyForces(e) {
  var t = "";
  e.mode === FluidSim.Mode.WATER && (t = "#define WATER\n"),
    THREE.ShaderMaterial.call(this, {
      uniforms: {
        velocity: {
          value: null
        },
        fluid: {
          value: null
        },
        dt: {
          value: null
        },
        buoyancy: {
          value: .05
        },
        gravity: {
          value: 0
        },
        sourcePosition: {
          value: new THREE.Vector3(.5, .5, .5)
        },
        numCells: {
          value: new THREE.Vector3(e.numCellsX, e.numCellsY, e.numCellsZ)
        },
        force: {
          value: new THREE.Vector3(0, 0, 0)
        },
        sourceRadius: {
          value: 12
        }
      },
      vertexShader: t + ShaderLibrary.get("fluid_vertex"),
      fragmentShader: t + ShaderLibrary.get("apply_forces_fragment")
    })
}

function ApplyProjection(e) {
  THREE.ShaderMaterial.call(this, {
    uniforms: {
      velocity: {
        value: null
      },
      divPress: {
        value: null
      },
      fluid: {
        value: null
      },
      rcpNumCellsZ: {
        value: 1 / e.numCellsZ
      },
      rcpTexSize: {
        value: new THREE.Vector2(e.pixelWidth, e.pixelHeight)
      }
    },
    vertexShader: ShaderLibrary.get("fluid_vertex"),
    fragmentShader: ShaderLibrary.get("apply_projection_fragment")
  })
}

function CalculateCurl(e) {
  THREE.ShaderMaterial.call(this, {
    uniforms: {
      velocity: {
        value: null
      },
      rcpNumCellsZ: {
        value: 1 / e.numCellsZ
      },
      rcpTexSize: {
        value: new THREE.Vector2(e.pixelWidth, e.pixelHeight)
      }
    },
    vertexShader: ShaderLibrary.get("fluid_vertex"),
    fragmentShader: ShaderLibrary.get("calculate_curl_fragment")
  })
}

function CalculateDivergence(e) {
  THREE.ShaderMaterial.call(this, {
    uniforms: {
      velocity: {
        value: null
      },
      rcpNumCellsZ: {
        value: 1 / e.numCellsZ
      },
      rcpTexSize: {
        value: new THREE.Vector2(e.pixelWidth, e.pixelHeight)
      }
    },
    vertexShader: ShaderLibrary.get("fluid_vertex"),
    fragmentShader: ShaderLibrary.get("calculate_divergence_fragment")
  })
}

function ConfineVorticity(e) {
  THREE.ShaderMaterial.call(this, {
    uniforms: {
      velocity: {
        value: null
      },
      source: {
        value: null
      },
      curl: {
        value: null
      },
      vorticity: {
        value: .02
      },
      rcpNumCellsZ: {
        value: 1 / e.numCellsZ
      },
      rcpTexSize: {
        value: new THREE.Vector2(e.pixelWidth, e.pixelHeight)
      }
    },
    vertexShader: ShaderLibrary.get("fluid_vertex"),
    fragmentShader: ShaderLibrary.get("confine_vorticity_fragment")
  })
}

function DivPressBorders(e) {
  THREE.ShaderMaterial.call(this, {
    uniforms: {
      divPress: {
        value: null
      },
      edgeMask: {
        value: e.edgeMask
      },
      numCells: {
        value: new THREE.Vector3(e.numCellsX, e.numCellsY, e.numCellsZ)
      }
    },
    vertexShader: ShaderLibrary.get("fluid_vertex"),
    fragmentShader: ShaderLibrary.get("div_press_borders_fragment")
  })
}

function FluidSim(e, t, n, i, r) {
  this._mode = r || FluidSim.Mode.SMOKE,
    this.projectionIterations = r === FluidSim.Mode.SMOKE ? 3 : 20,
    this._renderer = e,
    this._numCellsX = t,
    this._numCellsY = n,
    this._numCellsZ = i,
    this._textureWidth = t * i,
    this._textureHeight = n,
    this._floatTextureType = null;
  var o = e.extensions;
  if (o.get("OES_texture_half_float_linear"))
    this._floatTextureType = THREE.HalfFloatType;
  else {
    if (!o.get("OES_texture_float_linear"))
      throw new Error("Float render targets are unsupported!");
    this._floatTextureType = THREE.FloatType
  }
  this._velocityBuffer = this._createDoubleBuffer(),
    this._dataBuffer = this._createDoubleBuffer(),
    this._auxBuffer = this._createDoubleBuffer(),
    this._edgeMask = new THREE.DataTexture(this._createEdgeMaskData(), this._textureWidth, this._textureHeight, THREE.RGBAFormat, this._floatTextureType, null, THREE.CLAMP_TO_EDGE, THREE.CLAMP_TO_EDGE, THREE.NearestFilter, THREE.NearestFilter, 0),
    this._edgeMask.needsUpdate = !0,
    this.reset(),
    this._rectRenderer = new RectRenderer(e),
    this._advectSemiLagrangian = new AdvectSemiLagrangian(this),
    this._advectMacCormack = new AdvectMacCormack(this),
    this._calculateDivergence = new CalculateDivergence(this),
    this._solvePressure = new SolvePressure(this),
    this._applyProjection = new ApplyProjection(this),
    this._applyForces = new ApplyForces(this),
    this._velocityBorders = new VelocityBorders(this),
    this._divPressBorders = new DivPressBorders(this),
    this._mode === FluidSim.Mode.SMOKE ? (this._addDensity = new AddDensity(this),
      this._calculateCurl = new CalculateCurl(this),
      this._confineVorticity = new ConfineVorticity(this),
      this._applyForces.buoyancy = .05,
      this._applyForces.gravity = 0) : (this._addWater = new AddWater(this),
      this._addWater.edgeMask = this._edgeMask,
      this._applyForces.buoyancy = 0,
      this._applyForces.gravity = 300)
}

function SolvePressure(e) {
  THREE.ShaderMaterial.call(this, {
    uniforms: {
      divPress: {
        value: null
      },
      rcpNumCellsZ: {
        value: 1 / e.numCellsZ
      },
      rcpTexSize: {
        value: new THREE.Vector2(e.pixelWidth, e.pixelHeight)
      }
    },
    vertexShader: ShaderLibrary.get("fluid_vertex"),
    fragmentShader: ShaderLibrary.get("solve_pressure_fragment")
  })
}

function VelocityBorders(e) {
  THREE.ShaderMaterial.call(this, {
    uniforms: {
      velocity: {
        value: null
      },
      edgeMask: {
        value: e.edgeMask
      },
      rcpNumCellsZ: {
        value: 1 / e.numCellsZ
      },
      rcpTexSize: {
        value: new THREE.Vector2(1 / e.textureWidth, 1 / e.textureHeight)
      }
    },
    vertexShader: ShaderLibrary.get("fluid_vertex"),
    fragmentShader: ShaderLibrary.get("velocity_borders_fragment")
  })
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

function SmokeSimContent(e, t) {
  this._highPerformance = e,
    this._disco = t
}

function WaterSimContent(e, t) {
  this._highPerformance = e,
    this._disco = t
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

function VolumetricLighting(e, t, n, i, r) {
  var o = "#define NUM_SAMPLES " + i + "\n";
  r && (o += "#define WATER\n");
  var s = e,
    a = t,
    l = n,
    c = Math.sqrt(s * s + a * a + l * l),
    u = THREE.UniformsUtils.merge([{
      densityField: {
        value: null
      },
      irradiance: {
        value: null
      },
      cameraPos: {
        value: new THREE.Vector3
      },
      mieG: {
        value: -.05
      },
      absorption: {
        value: new THREE.Color(.01, .01, .01)
      },
      numCells: {
        value: new THREE.Vector3(e, t, n)
      },
      sampleStep: {
        value: c / (i - 1)
      }
    }, THREE.UniformsLib.lights]);
  THREE.ShaderMaterial.call(this, {
    uniforms: u,
    lights: !0,
    vertexShader: o + ShaderLibrary.get("volumetric_lighting_vertex"),
    fragmentShader: o + ShaderLibrary.get("volumetric_lighting_fragment")
  })
}

function VolumetricLightRenderer(e, t, n, i, r, o) {
  this._renderer = e,
    this._scene = new THREE.Scene,
    this._camera = new THREE.OrthographicCamera((-1), 1, 1, (-1), 0, 1),
    this._material = new VolumetricLighting(t, n, i, r, o),
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
    var s = Date.now();
    return {
      domElement: e,
      update: function(e) {
        if (console.assert(e instanceof THREE.WebGLRenderer),
          !(Date.now() - s < 1e3 / 30)) {
          s = Date.now();
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
      var s, a;
      this.clearColor && (s = e.getClearColor().getHex(),
          a = e.getClearAlpha(),
          e.setClearColor(this.clearColor, this.clearAlpha)),
        e.render(this.scene, this.camera, this.renderToScreen ? null : n, this.clear),
        this.clearColor && e.setClearColor(s, a),
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
  execute: function(e, t, n) {
    var i = new RectRenderer(n),
      r = t.texture,
      o = new THREE.DataTexture(e, t.width, t.height, r.format, r.type, null, THREE.CLAMP_TO_EDGE, THREE.CLAMP_TO_EDGE, THREE.NearestFilter, THREE.NearestFilter, 0);
    o.needsUpdate = !0;
    var s = new THREE.ShaderMaterial(THREE.CopyShader);
    s.uniforms.tDiffuse.value = o,
      i.execute(s, t)
  }
};
DoubleBufferTexture.prototype = {
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
var QueryString = function() {
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
    execute: function(e, t) {
      this._quad.material = e,
        this._renderer.render(this._scene, this._camera, t, !0)
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
  ShaderLibrary = {
    get: function(e) {
      return ShaderLibrary["include_fluid.glsl"] + ShaderLibrary["include_common.glsl"] + "\n" + ShaderLibrary[e + ".glsl"]
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
      for (var n = !1, i = e._components.length, r = 0, o = [], s = 0; s < i; ++s) {
        var a = e._components[s];
        a !== t && (o[r++] = a,
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
  ShaderLibrary["include_common.glsl"] = "vec4 encodeHDRE(vec3 color)\n{\n#ifdef HDRE\n    float maxValue = max(max(color.r, color.g), color.b) + .01;\n    float e = floor(max(log(maxValue), 0.0));\n    color /= exp(e);\n    return vec4(color, e / 5.0);\n#else\n    return vec4(color, 1.0);\n#endif\n}\n\nvec3 decodeHDRE(vec4 hdre)\n{\n#ifdef HDRE\n    float e = hdre.a * 5.0;\n    hdre.xyz *= exp(e);\n    return hdre.xyz;\n#else\n    return hdre.xyz;\n#endif\n}\n\nfloat luminance(vec3 color)\n{\n    return dot(color, vec3(.30, 0.59, .11));\n}\n\nfloat luminance(vec4 color)\n{\n    return luminance(color.xyz);\n}\n\nfloat linearStep(float lower, float upper, float x)\n{\n    return clamp((x - lower) / (upper - lower), 0.0, 1.0);\n}\n\n// Only for 0 - 1\nvec4 floatToRGBA8(float value)\n{\n    vec4 enc = value * vec4(1.0, 255.0, 65025.0, 16581375.0);\n    // cannot fract first value or 1 would not be encodable\n    enc.yzw = fract(enc.yzw);\n    return enc - enc.yzww * vec4(1.0/255.0, 1.0/255.0, 1.0/255.0, 0.0);\n}\n\nfloat RGBA8ToFloat(vec4 rgba)\n{\n    return dot(rgba, vec4(1.0, 1.0/255.0, 1.0/65025.0, 1.0/16581375.0));\n}\n\nvec2 floatToRG8(float value)\n{\n    vec2 enc = vec2(1.0, 255.0) * value;\n    enc.y = fract(enc.y);\n    enc.x -= enc.y / 255.0;\n    return enc;\n}\n\nfloat RG8ToFloat(vec2 rg)\n{\n    return dot(rg, vec2(1.0, 1.0/255.0));\n}\n\nvec3 intersectCubeMap(vec3 rayOrigin, vec3 rayDir, float cubeSize)\n{\n    vec3 t = (cubeSize * sign(rayDir) - rayOrigin) / rayDir;\n    float minT = min(min(t.x, t.y), t.z);\n    return rayOrigin + minT * rayDir;\n}",
  ShaderLibrary["add_density_fragment.glsl"] = "varying vec2 texCoords;\n\nuniform sampler2D source;\n\nuniform vec3 sourcePosition;    // in cell coords\nuniform float sourceRadius;\nuniform float amount;\nuniform float temperature;\nuniform vec3 numCells;\n\nvoid main() {\n//    vec4 mask = texture2D(boundaries, texCoords);\n    vec4 data = texture2D(source, texCoords);\n\n    vec3 cell = getCell(texCoords, numCells);\n    float dist = distance(cell, sourcePosition);\n\n    float fallOff = clamp(1.0 - dist / sourceRadius, 0.0, 1.0);\n\n    data.x += fallOff * amount;\n    data.y += fallOff * temperature;\n\n    gl_FragColor = data;\n}",
  ShaderLibrary["add_water_fragment.glsl"] = "varying vec2 texCoords;\n\nuniform sampler2D source;\nuniform sampler2D edgeMask;\n\nuniform vec3 sourcePosition;    // in 3D UV coords\nuniform float radius;\nuniform vec3 numCells;\n\nvoid main() {\n    vec4 data = texture2D(source, texCoords);\n\n    vec3 cell = getCell(texCoords, numCells);\n    float dist = distance(cell, sourcePosition) - radius;\n\n    if (data.x >= 0.0) {\n        data.x = min(data.x, dist);\n    }\n    else if (data.x < 0.0 && dist < 0.0) {\n        data.x = max(data.x, dist);\n    }\n\n    data.x *= texture2D(edgeMask, texCoords).w;\n\n    gl_FragColor = data;\n}",
  ShaderLibrary["advect_maccormack_fragment.glsl"] = "varying vec2 texCoords;\n\nuniform sampler2D velocity;\nuniform sampler2D source;\nuniform sampler2D advected;\nuniform sampler2D advectedReverse;\n\nuniform float rcpNumCellsZ;\nuniform float temperatureDissipation;\nuniform float dt;\nuniform vec2 rcpTexSize;\n\n// See: https://developer.nvidia.com/gpugems/GPUGems3/gpugems3_ch30.html\nvoid main()\n{ \n    vec3 vel = texture2D(velocity, texCoords).xyz;\n    vel *= dt;\n    vec3 roundedVel = floor(-vel + .5);\n    vec2 cellCenterUV = texCoords + roundedVel.xy * rcpTexSize;\n    cellCenterUV.x += roundedVel.z * rcpNumCellsZ;\n\n    // cannot exceed any of the surrounding values\n    vec4 nnn = texture2D(source, cellCenterUV + vec2(-rcpTexSize.x - rcpNumCellsZ, -rcpTexSize.y));\n    vec4 nnp = texture2D(source, cellCenterUV + vec2(-rcpTexSize.x + rcpNumCellsZ, -rcpTexSize.y));\n    vec4 npn = texture2D(source, cellCenterUV + vec2(-rcpTexSize.x - rcpNumCellsZ, rcpTexSize.y));\n    vec4 npp = texture2D(source, cellCenterUV + vec2(-rcpTexSize.x + rcpNumCellsZ, rcpTexSize.y));\n    vec4 pnn = texture2D(source, cellCenterUV + vec2(rcpTexSize.x - rcpNumCellsZ, -rcpTexSize.y));\n    vec4 pnp = texture2D(source, cellCenterUV + vec2(rcpTexSize.x + rcpNumCellsZ, -rcpTexSize.y));\n    vec4 ppn = texture2D(source, cellCenterUV + vec2(rcpTexSize.x - rcpNumCellsZ, rcpTexSize.y));\n    vec4 ppp = texture2D(source, cellCenterUV + vec2(rcpTexSize.x + rcpNumCellsZ, rcpTexSize.y));\n    vec4 minVal = min(min(min(min(min(min(min(nnn,  nnp), npn), npp), pnn), pnp), ppn), ppp);\n    vec4 maxVal = max(max(max(max(max(max(max(nnn,  nnp), npn), npp), pnn), pnp), ppn), ppp);\n\n    vec4 r = texture2D(advected, texCoords) + 0.5 * (texture2D(source, texCoords) - texture2D(advectedReverse, texCoords));\n\n    r.y *= 1.0 - temperatureDissipation * dt;\n\n    // Clamp result to the desired range\n    gl_FragColor = max(min(r, maxVal), minVal);\n}",
  ShaderLibrary["advect_semi_lagrangian_fragment.glsl"] = "varying vec2 texCoords;\n\nuniform sampler2D source;\nuniform sampler2D velocity;\nuniform sampler2D edgeMask;\n\nuniform vec3 numCells;\nuniform float dt;\n\nvoid main()\n{\n    // standard backtracking advection\n    vec4 mask = texture2D(edgeMask, texCoords);\n    vec3 vel = texture2D(velocity, texCoords).xyz;\n    vec3 cell = getCell(texCoords, numCells);\n    cell -= vel * dt;\n\n    // make sure we don't sample in a different plane\n//    cell.x = clamp(cell.x, 0.0, numCells.x - 1.0);\n    cell = reflectCell(cell, numCells);\n\n    gl_FragColor = sampleCellLinear(source, cell, numCells);\n    gl_FragColor *= float(mask.w > 0.0);\n}",
  ShaderLibrary["apply_forces_fragment.glsl"] = "varying vec2 texCoords;\n\nuniform sampler2D velocity;\nuniform sampler2D fluid;\n\nuniform float dt;\nuniform float buoyancy;\nuniform float gravity;\n\nuniform vec3 sourcePosition;    // in 3D UV coords\nuniform float sourceRadius;\nuniform vec3 force;\nuniform vec3 numCells;\n\nvoid main() {\n    vec4 data = texture2D(fluid, texCoords);\n    vec4 vel = texture2D(velocity, texCoords);\n\n    vec3 cell = getCell(texCoords, numCells);\n    float dist = distance(cell, sourcePosition);\n\n    float fallOff = clamp(1.0 - dist / sourceRadius, 0.0, 1.0);\n\n    float buoyF = buoyancy * data.y;\n    vec3 F = force * fallOff;\n    F.y += buoyF - gravity;\n\n    #ifdef WATER\n        // only apply forces inside the water\n        F *= float(data.x < 0.0);\n    #endif\n    vel.xyz += F * dt;\n\n    gl_FragColor = vel;\n}",
  ShaderLibrary["apply_projection_fragment.glsl"] = "varying vec2 texCoords;\n\nuniform sampler2D velocity;\nuniform sampler2D divPress;\n\nuniform float rcpNumCellsZ;\nuniform vec2 rcpTexSize;\n\n\nvoid main() {\n    float right = texture2D(divPress, texCoords + vec2(rcpTexSize.x, 0.0)).y;\n    float left = texture2D(divPress, texCoords - vec2(rcpTexSize.x, 0.0)).y;\n    float top = texture2D(divPress, texCoords + vec2(0.0, rcpTexSize.y)).y;\n    float bottom = texture2D(divPress, texCoords - vec2(0.0, rcpTexSize.y)).y;\n    float far = texture2D(divPress, texCoords + vec2(rcpNumCellsZ, 0.0)).y;\n    float near = texture2D(divPress, texCoords - vec2(rcpNumCellsZ, 0.0)).y;\n\n    vec3 diff;\n    diff.x = right - left;\n    diff.y = top - bottom;\n    diff.z = far - near;\n\n    vec4 vel = texture2D(velocity, texCoords);\n    vel.xyz -= diff * .5;\n    gl_FragColor = vel;\n\n}",
  ShaderLibrary["calculate_curl_fragment.glsl"] = "varying vec2 texCoords;\n\nuniform sampler2D velocity;\n\nuniform float rcpNumCellsZ;\nuniform vec2 rcpTexSize;\n\nvec3 getVelocity(vec2 uv)\n{\n    return texture2D(velocity, uv).xyz;\n}\n\nvoid main() {\n    vec3 right = getVelocity(texCoords + vec2(rcpTexSize.x, 0.0));\n    vec3 left = getVelocity(texCoords - vec2(rcpTexSize.x, 0.0));\n    vec3 top = getVelocity(texCoords + vec2(0.0, rcpTexSize.y));\n    vec3 bottom = getVelocity(texCoords - vec2(0.0, rcpTexSize.y));\n    vec3 far = getVelocity(texCoords + vec2(rcpNumCellsZ, 0.0));\n    vec3 near = getVelocity(texCoords - vec2(rcpNumCellsZ, 0.0));\n    vec3 dx = (right - left) * .5;\n    vec3 dy = (top - bottom) * .5;\n    vec3 dz = (far - near) * .5;\n\n    vec3 curl = vec3(dy.z - dz.y, dz.x - dx.z, dx.y - dy.x);\n    gl_FragColor = vec4(curl, length(curl));\n}",
  ShaderLibrary["calculate_divergence_fragment.glsl"] = "varying vec2 texCoords;\n\nuniform sampler2D velocity;\n\nuniform float rcpNumCellsZ;\nuniform vec2 rcpTexSize;\n\nvec3 getVelocity(vec2 uv)\n{\n    vec3 velocity = texture2D(velocity, uv).xyz;\n    return velocity;\n}\n\nvoid main() {\n    vec3 right = getVelocity(texCoords + vec2(rcpTexSize.x, 0.0));\n    vec3 left = getVelocity(texCoords - vec2(rcpTexSize.x, 0.0));\n    vec3 top = getVelocity(texCoords + vec2(0.0, rcpTexSize.y));\n    vec3 bottom = getVelocity(texCoords - vec2(0.0, rcpTexSize.y));\n    vec3 far = getVelocity(texCoords + vec2(rcpNumCellsZ, 0.0));\n    vec3 near = getVelocity(texCoords - vec2(rcpNumCellsZ, 0.0));\n    float xDiff = right.x - left.x;\n    float yDiff = top.y - bottom.y;\n    float zDiff = far.z - near.z;\n\n    gl_FragColor = vec4(.5 * (xDiff + yDiff + zDiff), 0.0, 0.0, 1.0);\n}",
  ShaderLibrary["confine_vorticity_fragment.glsl"] = "varying vec2 texCoords;\n\nuniform sampler2D velocity;\nuniform sampler2D curl;\n\nuniform vec3 numCells;\nuniform float rcpNumCellsZ;\nuniform float vorticity;\nuniform vec2 rcpTexSize;\n\nvoid main()\n{\n    vec4 vel = texture2D(velocity, texCoords);\n    vec3 c = texture2D(curl, texCoords).xyz;\n    vec3 curlLenGradient;\n    curlLenGradient.x = texture2D(curl, texCoords + vec2(rcpTexSize.x, 0.0)).w - texture2D(curl, texCoords - vec2(rcpTexSize.x, 0.0)).w;\n    curlLenGradient.y = texture2D(curl, texCoords + vec2(0.0, rcpTexSize.y)).w - texture2D(curl, texCoords - vec2(0.0, rcpTexSize.y)).w;\n    curlLenGradient.z = texture2D(curl, texCoords + vec2(rcpNumCellsZ, 0.0)).w - texture2D(curl, texCoords - vec2(rcpNumCellsZ, 0.0)).w;\n    float len = max(length(curlLenGradient), .0001);\n    curlLenGradient /= len;\n    vec3 force = cross(curlLenGradient, c);\n    vel.xyz += force * vorticity;\n    gl_FragColor = vel;\n}",
  ShaderLibrary["debug_merged_fragment.glsl"] = "varying vec2 texCoords;\n\nuniform sampler2D map;\n\nuniform vec2 texelSize;\n\n// B-spline weights\n\nvoid main() {\n    vec2 uv = texCoords;\n    uv.x /= float(NUM_CELLS_Z);\n    vec4 samp = vec4(0.0);\n\n    vec4 color = vec4(1.0);\n\n    for (int i = 1; i < NUM_CELLS_Z - 1; ++i) {\n        uv.x += 1.0 / float(NUM_CELLS_Z);\n\n        // TODO: Apply bicubic interpolation for smoother looks\n        float density = texture2D(map, uv).x;\n        float alpha = density / 100.0;\n        samp = mix(samp, color, alpha);\n    }\n    gl_FragColor = vec4(samp.xxx, 1.0);\n}\n",
  ShaderLibrary["debug_merged_vertex.glsl"] = "varying vec2 texCoords;\n\nvoid main() {\n    vec3 localPos = position;\n    vec4 viewPos = modelViewMatrix * vec4(localPos, 1.0);\n    gl_Position = projectionMatrix * viewPos;\n    texCoords = uv;\n}",
  ShaderLibrary["div_press_borders_fragment.glsl"] = "varying vec2 texCoords;\n\nuniform sampler2D divPress;\nuniform sampler2D edgeMask;\nuniform vec3 numCells;\n\nvoid main() {\n    vec4 mask = texture2D(edgeMask, texCoords);\n    vec3 cell = getCell(texCoords, numCells) + mask.xyz;\n    vec4 sourceData = sampleCellPoint(divPress, cell, numCells);\n//    sourceData.x *= float(mask.w > 0.0);\n    gl_FragColor = sourceData;\n}",
  ShaderLibrary["fluid_vertex.glsl"] = "varying vec2 texCoords;\n\nvoid main() {\n    gl_Position = vec4(position, 1.0);\n    texCoords = uv;\n}\n",
  ShaderLibrary["include_fluid.glsl"] = '// these are the 3D "UV" coordinates (as if it would be a real 3D texture)\nvec3 getUV3D(vec2 uv, vec3 numCells)\n{\n    vec3 position;\n    position.x = fract(uv.x * numCells.z);\n    position.y = uv.y;\n    position.z = uv.x - position.x/numCells.z;\n    return position;\n}\n\nbool isBoundary(vec4 bound)\n{\n    return bound.w > .9;\n}\n\nvec3 getCell(vec2 uv, vec3 numCells)\n{\n    vec3 cell;\n    // coordinates in pixels (cell Y matches pixel Y)\n    cell.xy = uv * vec2(numCells.x * numCells.z, numCells.y);\n    cell.z = floor(cell.x / numCells.x);\n    cell.x -= cell.z * numCells.x;\n    return cell;\n}\n\nvec4 sampleCellPoint(sampler2D tex, vec3 cell, vec3 numCells)\n{\n    vec2 uv;\n    uv.xy = cell.xy / vec2(numCells.x * numCells.z, numCells.y);\n    uv.x += cell.z / numCells.z;\n    return texture2D(tex, uv);\n}\n\nvec4 sampleCellLinear(sampler2D tex, vec3 cell, vec3 numCells)\n{\n    vec2 uv;\n    uv.xy = cell.xy / vec2(numCells.x * numCells.z, numCells.y);\n    float flZ = floor(cell.z);\n    uv.x += flZ / numCells.z;\n\n    vec4 val1 = texture2D(tex, uv);\n    uv.x += 1.0 / numCells.z;\n    vec4 val2 = texture2D(tex, uv);\n\n    return mix(val1, val2, cell.z - flZ);\n}\n\nvec3 clampCell(vec3 cell, vec3 numCells)\n{\n    vec3 bound = numCells - vec3(1.0);\n    return clamp(cell, vec3(0.0), bound);\n}\n\nvec3 reflectCell(vec3 cell, vec3 numCells)\n{\n    // reflect against boundaries\n    if (cell.x < 1.0) cell.x = 1.0 + 1.0 - cell.x;\n    if (cell.y < 1.0) cell.y = 1.0 + 1.0 - cell.y;\n    if (cell.z < 1.0) cell.z = 1.0 + 1.0 - cell.z;\n\n    vec3 bound = numCells - vec3(2.0);\n\n    if (cell.x > bound.x) cell.x = bound.x - (cell.x - bound.x);\n    if (cell.y > bound.y) cell.y = bound.y - (cell.y - bound.y);\n    if (cell.z > bound.z) cell.z = bound.z - (cell.z - bound.z);\n\n    return cell;\n}\n\nbool isInsideFluidDomain(vec3 cell, vec3 numCells)\n{\n    bvec3 g = greaterThan(cell, vec3(0.0));\n    bvec3 l = lessThan(cell, numCells);\n    return all(g) && all(l);\n}',
  ShaderLibrary["solve_pressure_fragment.glsl"] = "varying vec2 texCoords;\n\nuniform sampler2D divPress;\n\nuniform float rcpNumCellsZ;\nuniform vec2 rcpTexSize;\n\nvoid main() {\n    float div = texture2D(divPress, texCoords).x;\n\n    float right = texture2D(divPress, texCoords + vec2(rcpTexSize.x, 0.0)).y;\n    float left = texture2D(divPress, texCoords - vec2(rcpTexSize.x, 0.0)).y;\n    float top = texture2D(divPress, texCoords + vec2(0.0, rcpTexSize.y)).y;\n    float bottom = texture2D(divPress, texCoords - vec2(0.0, rcpTexSize.y)).y;\n    float far = texture2D(divPress, texCoords + vec2(rcpNumCellsZ, 0.0)).y;\n    float near = texture2D(divPress, texCoords - vec2(rcpNumCellsZ, 0.0)).y;\n\n    float d = (left + right + top + bottom + near + far - div) / 6.0;\n    gl_FragColor = vec4(div, d, 0.0, 1.0);\n}",
  ShaderLibrary["velocity_borders_fragment.glsl"] = "varying vec2 texCoords;\n\nuniform sampler2D velocity;\nuniform sampler2D edgeMask;\n\nuniform float rcpNumCellsZ;\nuniform vec2 rcpTexSize;\n\n\nvoid main() {\n\n    vec4 mask = texture2D(edgeMask, texCoords);\n\n    vec2 texCoord = texCoords;\n\n    texCoord.x += mask.x * rcpTexSize.x;\n    texCoord.y += mask.y * rcpTexSize.y;\n    texCoord.x += mask.z * rcpNumCellsZ;\n\n    vec4 sourceData = texture2D(velocity, texCoord);\n\n    if (mask.x != 0.0) sourceData.x = -sourceData.x;\n    if (mask.y != 0.0) sourceData.y = -sourceData.y;\n    if (mask.z != 0.0) sourceData.z = -sourceData.z;\n\n    gl_FragColor = sourceData;\n}",
  ShaderLibrary["volumetric_lighting_fragment.glsl"] = "varying vec2 texCoords;\n\nuniform sampler2D densityField;\nuniform samplerCube irradiance;\nuniform vec3 numCells;\nuniform vec3 absorption;\nuniform vec3 cameraPos;\nuniform float sampleStep;\nuniform float mieG;\n\nstruct DirectionalLight {\n    vec3 direction;\n    vec3 color;\n    int shadow;\n    float shadowBias;\n    float shadowRadius;\n    vec2 shadowMapSize;\n};\n\nstruct PointLight {\n    vec3 position;\n    vec3 color;\n    float distance;\n    float decay;\n    int shadow;\n    float shadowBias;\n    float shadowRadius;\n    vec2 shadowMapSize;\n};\n\n#if NUM_DIR_LIGHTS > 0\nuniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];\n#endif\n\n#if NUM_POINT_LIGHTS > 0\nuniform PointLight pointLights[ NUM_POINT_LIGHTS ];\n#endif\n\nfloat mieFactor(vec3 lightDir, vec3 viewDir)\n{\n    float cosAng = dot(lightDir, viewDir);\n    float num = 1.0 - mieG;\n    // assume 4PI factor is encoded in light color\n    return num * num / pow(1.0 + mieG*mieG - 2.0 * mieG * cosAng, 1.5);\n}\n\nfloat sampleDensity(vec3 cell)\n{\n    vec4 samp = sampleCellLinear(densityField, cell, numCells);\n    #ifdef WATER\n        samp.x = samp.x < 0.0? 1.0 : 0.0;\n    #endif\n    return isInsideFluidDomain(cell, numCells)? samp.x : 0.0;\n}\n\nvec3 getTransmittedLight(vec3 cell, DirectionalLight light, vec3 viewDir)\n{\n    float amount = 0.0;\n    vec3 marchStep = light.direction * sampleStep;\n    for (int i = 0; i < NUM_SAMPLES; ++i) {\n        cell += marchStep;\n        amount += sampleDensity(cell);\n    }\n\n    float mie = mieFactor(light.direction, viewDir);\n\n    return exp(-amount * absorption * sampleStep) * mie * light.color;\n}\n\nvec3 getTransmittedLight(vec3 cell, PointLight light, vec3 viewDir, vec3 localPos)\n{\n    float amount = 0.0;\n    vec3 lightDir = light.position - localPos;\n    float len = length(lightDir);\n    float step = min(len / float(NUM_SAMPLES), sampleStep);\n    lightDir = normalize(lightDir);\n    vec3 marchStep = lightDir * step;\n\n    for (int i = 0; i < NUM_SAMPLES; ++i) {\n        cell += marchStep;\n        amount += sampleDensity(cell);\n    }\n\n    float mie = mieFactor(lightDir, viewDir);\n\n// pretend the light has some sort of size\n//    len = max(len, 10.0);\n    return exp(-amount * absorption * step) * mie * light.color / (len * len);\n}\n\nvec3 getGlobalIllum()\n{\n#ifdef WATER\n    return vec3(.0);\n#else\n    float occlStrength = .1;\n    float sampleDist = 2.0;\n    vec2 rcpTexSize = vec2(1.0 / (numCells.x * numCells.z), 1.0 / numCells.y) * sampleDist;\n    float right = texture2D(densityField, texCoords + vec2(rcpTexSize.x, 0.0)).x;\n    float left = texture2D(densityField, texCoords - vec2(rcpTexSize.x, 0.0)).x;\n    float top = texture2D(densityField, texCoords + vec2(0.0, rcpTexSize.y)).x;\n    float bottom = texture2D(densityField, texCoords - vec2(0.0, rcpTexSize.y)).x;\n    float far = texture2D(densityField, texCoords + vec2(sampleDist/numCells.z, 0.0)).x;\n    float near = texture2D(densityField, texCoords - vec2(sampleDist/numCells.z, 0.0)).x;\n    // use the inverse gradient as the hint of direction where most light comes from (similar to bent normals)\n    vec3 grad = -normalize(vec3(right - left, top - bottom, far - near));\n    right = clamp(right * occlStrength, 0.0, 1.0);\n    left = clamp(left * occlStrength, 0.0, 1.0);\n    top = clamp(top * occlStrength, 0.0, 1.0);\n    bottom = clamp(bottom * occlStrength, 0.0, 1.0);\n    far = clamp(far * occlStrength, 0.0, 1.0);\n    near = clamp(near * occlStrength, 0.0, 1.0);\n\n    float occl = (6.0 - right - left - top - bottom - far - near) / 6.0;\n    vec3 cube = textureCube(irradiance, grad).xyz;\n    return cube * cube * occl;\n#endif\n}\n\nvoid main() {\n    vec4 data = texture2D(densityField, texCoords);\n    vec3 cell = getCell(texCoords, numCells);\n    vec3 color = vec3(0.0);\n    vec3 localPos = cell - numCells * .5;\n    vec3 viewDir = normalize(cameraPos - localPos);\n\n    // TODO: If we pass in view vector (approximated constant), can we apply phase scattering?\n\n    #if NUM_DIR_LIGHTS > 0\n        for (int i = 0; i < NUM_DIR_LIGHTS; ++i) {\n            color += getTransmittedLight(cell, directionalLights[i], viewDir);\n        }\n    #endif\n\n    #if NUM_POINT_LIGHTS > 0\n        for (int i = 0; i < NUM_POINT_LIGHTS; ++i) {\n            color += getTransmittedLight(cell, pointLights[i], viewDir, localPos);\n        }\n    #endif\n\n    color += getGlobalIllum() * clamp(data.x, 0.0, 1.0);\n\n    gl_FragColor.xyz = color;\n\n    #ifdef WATER\n        gl_FragColor.w = data.x < -0.001? 1.0 : 0.0;\n    #else\n        gl_FragColor.w = data.x;\n    #endif\n\n\n}",
  ShaderLibrary["volumetric_lighting_vertex.glsl"] = "varying vec2 texCoords;\n\nvoid main() {\n    gl_Position = vec4(position, 1.0);\n    texCoords = uv;\n}\n",
  ShaderLibrary["debug_alpha_fragment.glsl"] = "varying vec2 texCoords;\nuniform sampler2D map;\n\nvoid main() {\n    vec4 samp = texture2D(map, texCoords);\n    gl_FragColor = vec4(samp.www, 1.0);\n}\n",
  ShaderLibrary["debug_alpha_vertex.glsl"] = "varying vec2 texCoords;\n\nvoid main() {\n    vec3 localPos = position;\n    vec4 viewPos = modelViewMatrix * vec4(localPos, 1.0);\n    gl_Position = projectionMatrix * viewPos;\n    texCoords = uv;\n}",
  ShaderLibrary["debug_vec3_fragment.glsl"] = "varying vec2 texCoords;\nuniform sampler2D map;\n\nvoid main() {\n    vec4 samp = texture2D(map, texCoords);\n    gl_FragColor = vec4(samp.xyz * .5 + .5, 1.0);\n}\n",
  ShaderLibrary["debug_vec3_vertex.glsl"] = "varying vec2 texCoords;\n\nvoid main() {\n    vec3 localPos = position;\n    vec4 viewPos = modelViewMatrix * vec4(localPos, 1.0);\n    gl_Position = projectionMatrix * viewPos;\n    texCoords = uv;\n}",
  ShaderLibrary["render_volume_fragment.glsl"] = "varying vec3 viewPos;\nvarying vec3 viewWorldDir;\nvarying vec3 cellStart;\n\n\nuniform sampler2D fluid;\nuniform float transparency;\n\n#ifdef SKYBOX\nuniform samplerCube skybox;\n#endif\n\nuniform vec3 numCells;\n\nuniform vec3 absorption;\nuniform vec3 smokeColor;\nuniform mat4 modelViewMatrixInverse;\nuniform float samplePlaneDistance;\n\nvec4 sampleData(vec3 cell)\n{\n    vec4 samp = sampleCellLinear(fluid, cell, numCells);\n    if (!isInsideFluidDomain(cell, numCells))\n        samp.w = 0.0;\n    return samp;\n}\n\n/*vec3 getRayOrigin()\n{\n//    return (modelViewMatrixInverse * vec4(viewPos, 1.0)).xyz + numCells / 2.0;\n\n    // make sure every ray starts at one of the discrete samples planes to avoid visual artefacts\n    float corrZ = ceil(viewPos.z / samplePlaneDistance) * samplePlaneDistance;\n    float t = (corrZ - viewPos.z) / viewPos.z;\n    vec4 o = vec4(viewPos + t * viewPos, 1.0);\n    return (modelViewMatrixInverse * o).xyz + numCells / 2.0;\n}*/\n\nvoid main()\n{\n//    vec3 cell = getRayOrigin();\n    vec3 cell = cellStart;\n    vec3 rayStep = mat3(modelViewMatrixInverse) * (-viewPos / viewPos.z * samplePlaneDistance);\n\n    vec3 stepDens = absorption * samplePlaneDistance;\n    vec3 transmittance = vec3(1.0);\n    vec3 color = vec3(0.0);\n\n    for (int i = 0; i < NUM_SAMPLES; ++i) {\n        vec4 data = sampleData(cell);\n        float smoke = data.w;\n        vec3 light = data.xyz;\n\n        vec3 absorb = exp(-smoke * stepDens);\n\n        // of that light, only the following amount is transmitted (beer-lambert)\n        color += light * clamp(smoke * transparency, 0.0, 1.0) * /*(1.0 - absorb) * */transmittance;\n\n        transmittance *= absorb;\n\n        cell += rayStep;\n    }\n\n    color.xyz *= smokeColor;\n    vec3 viewDir = normalize(viewWorldDir.xyz);\n\n    #ifdef SKYBOX\n    vec3 cube = textureCube(skybox, viewDir).xyz;\n    color.xyz += transmittance * cube * cube;\n    #endif\n\n    gl_FragColor.xyz = sqrt(color);\n    gl_FragColor.w = 1.0;\n}",
  ShaderLibrary["render_volume_vertex.glsl"] = "varying vec3 viewPos;\nvarying vec3 viewWorldDir;\nvarying vec3 cellStart;\n\nuniform vec3 numCells;\nuniform mat4 modelViewMatrixInverse;\n\nuniform float samplePlaneDistance;\n\n\n#if NUM_DIR_LIGHTS > 0\nstruct DirectionalLight {\n    vec3 direction;\n    vec3 color;\n    int shadow;\n    float shadowBias;\n    float shadowRadius;\n    vec2 shadowMapSize;\n};\n\nuniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];\n\nvarying vec3 localLightDirections[NUM_DIR_LIGHTS];\n\n#endif\n\nvoid main()\n{\n    vec4 view = modelViewMatrix * vec4(position, 1.0);\n    gl_Position = projectionMatrix * view;\n    viewPos = view.xyz;\n\n    vec3 worldPosition = (modelMatrix * vec4(position, 1.0)).xyz;\n\n    viewWorldDir = worldPosition - cameraPosition;\n\n    #if NUM_DIR_LIGHTS > 0\n    for (int i = 0; i < NUM_DIR_LIGHTS; ++i) {\n        localLightDirections[i] = normalize(mat3(modelViewMatrixInverse) * directionalLights[i].direction);\n    }\n    #endif\n\n    cellStart = (modelViewMatrixInverse * vec4(viewPos, 1.0)).xyz + numCells / 2.0;\n}",
  ShaderLibrary["sky_fragment.glsl"] = "varying vec3 worldViewDir;\n\nuniform samplerCube envMap;\nuniform vec3 color;\nuniform float invert;\n\nvoid main()\n{\n    vec3 elementDir = normalize(worldViewDir * invert);\n    gl_FragColor = textureCube(envMap, elementDir) * vec4(color, 1.0);\n}\n",
  ShaderLibrary["sky_vertex.glsl"] = "varying vec3 worldViewDir;\n\nvoid main() {\n    vec3 worldPosition = (modelMatrix * vec4(position, 1.0)).xyz;\n    worldViewDir = worldPosition - cameraPosition;\n    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n}";
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
  MoveAroundComponent = function(e, t, n, i, r, o, s) {
    Component.call(this),
      this._time = 0,
      this._phaseOffset = new THREE.Vector3(i, r, o),
      this._speed = new THREE.Vector3(e, t, n),
      this._radius = s
  },
  MoveAroundComponent.prototype = Object.create(Component.prototype),
  MoveAroundComponent.prototype.onAdded = function() {},
  MoveAroundComponent.prototype.onRemoved = function() {},
  MoveAroundComponent.prototype.onUpdate = function(e) {
    this._time += e;
    var t = this.entity.position;
    t.x = Math.sin(this._time * this._speed.x + this._phaseOffset.x) * this._radius,
      t.y = Math.sin(this._time * this._speed.y + this._phaseOffset.y) * this._radius,
      t.z = Math.sin(this._time * this._speed.z + this._phaseOffset.z) * this._radius
  },
  OrbitController = function(e, t, n) {
    Component.call(this),
      this._container = e,
      this._coords = new THREE.Vector3(.5 * Math.PI, .5 * Math.PI, 2),
      this._localAcceleration = new THREE.Vector3(0, 0, 0),
      this._localVelocity = new THREE.Vector3(0, 0, 0),
      this.lookAtTarget = t || new THREE.Vector3(0, 0, 0),
      this.shiftKey = n,
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
      this._container.addEventListener("touchend", this._onUp)
  },
  OrbitController.prototype.onRemoved = function() {
    var e = /Firefox/i.test(navigator.userAgent) ? "DOMMouseScroll" : "mousewheel";
    this._container.removeEventListener(e, this._onMouseWheel),
      this._container.removeEventListener("mousemove", this._onMouseMove),
      this._container.removeEventListener("touchmove", this._onTouchMove),
      this._container.removeEventListener("mousedown", this._onMouseDown),
      this._container.removeEventListener("touchstart", this._onTouchDown),
      this._container.removeEventListener("mouseup", this._onUp),
      this._container.removeEventListener("touchend", this._onUp)
  },
  OrbitController.prototype.onUpdate = function(e) {
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
    var t = this.entity,
      n = this._m,
      i = this._fromSphericalCoordinates(this._coords.z, this._coords.x, this._coords.y);
    i.add(this.lookAtTarget),
      n.lookAt(i, this.lookAtTarget, new THREE.Vector3(0, 1, 0)),
      n.setPosition(i),
      n.decompose(t.position, t.quaternion, t.scale)
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
        e.shiftKey && !t.shiftKey || (e._oldMouseX = void 0,
          e._oldMouseY = void 0,
          e._isDown = !0)
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
              s = r.screenX - o.screenX,
              a = r.screenY - o.screenY,
              l = Math.sqrt(s * s + a * a),
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
  AddDensity.prototype = Object.create(THREE.ShaderMaterial.prototype, {
    source: {
      get: function() {
        return this.uniforms.source.value
      },
      set: function(e) {
        this.uniforms.source.value = e
      }
    },
    amount: {
      get: function() {
        return this.uniforms.amount.value
      },
      set: function(e) {
        this.uniforms.amount.value = e
      }
    },
    sourcePosition: {
      get: function() {
        return this.uniforms.sourcePosition.value
      },
      set: function(e) {
        this.uniforms.sourcePosition.value = e
      }
    },
    sourceRadius: {
      get: function() {
        return this.uniforms.sourceRadius.value
      },
      set: function(e) {
        this.uniforms.sourceRadius.value = e
      }
    }
  }),
  AddWater.prototype = Object.create(THREE.ShaderMaterial.prototype, {
    source: {
      get: function() {
        return this.uniforms.source.value
      },
      set: function(e) {
        this.uniforms.source.value = e
      }
    },
    edgeMask: {
      get: function() {
        return this.uniforms.edgeMask.value
      },
      set: function(e) {
        this.uniforms.edgeMask.value = e
      }
    },
    radius: {
      get: function() {
        return this.uniforms.radius.value
      },
      set: function(e) {
        this.uniforms.radius.value = e
      }
    },
    sourcePosition: {
      get: function() {
        return this.uniforms.sourcePosition.value
      },
      set: function(e) {
        this.uniforms.sourcePosition.value = e
      }
    }
  }),
  AdvectMacCormack.prototype = Object.create(THREE.ShaderMaterial.prototype, {
    source: {
      get: function() {
        return this.uniforms.source.value
      },
      set: function(e) {
        this.uniforms.source.value = e
      }
    },
    velocity: {
      get: function() {
        return this.uniforms.velocity.value
      },
      set: function(e) {
        this.uniforms.velocity.value = e
      }
    },
    advected: {
      get: function() {
        return this.uniforms.advected.value
      },
      set: function(e) {
        this.uniforms.advected.value = e
      }
    },
    advectedReverse: {
      get: function() {
        return this.uniforms.advectedReverse.value
      },
      set: function(e) {
        this.uniforms.advectedReverse.value = e
      }
    },
    dt: {
      get: function() {
        return this.uniforms.dt.value
      },
      set: function(e) {
        this.uniforms.dt.value = e
      }
    }
  }),
  AdvectSemiLagrangian.prototype = Object.create(THREE.ShaderMaterial.prototype, {
    source: {
      get: function() {
        return this.uniforms.source.value
      },
      set: function(e) {
        this.uniforms.source.value = e
      }
    },
    velocity: {
      get: function() {
        return this.uniforms.velocity.value
      },
      set: function(e) {
        this.uniforms.velocity.value = e
      }
    },
    dt: {
      get: function() {
        return this.uniforms.dt.value
      },
      set: function(e) {
        this.uniforms.dt.value = e
      }
    }
  }),
  ApplyForces.prototype = Object.create(THREE.ShaderMaterial.prototype, {
    velocity: {
      get: function() {
        return this.uniforms.velocity.value
      },
      set: function(e) {
        this.uniforms.velocity.value = e
      }
    },
    fluid: {
      get: function() {
        return this.uniforms.fluid.value
      },
      set: function(e) {
        this.uniforms.fluid.value = e
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
    buoyancy: {
      get: function() {
        return this.uniforms.buoyancy.value
      },
      set: function(e) {
        this.uniforms.buoyancy.value = e
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
    force: {
      get: function() {
        return this.uniforms.force.value
      },
      set: function(e) {
        this.uniforms.force.value = e
      }
    },
    sourcePosition: {
      get: function() {
        return this.uniforms.sourcePosition.value
      },
      set: function(e) {
        this.uniforms.sourcePosition.value = e
      }
    },
    sourceRadius: {
      get: function() {
        return this.uniforms.sourceRadius.value
      },
      set: function(e) {
        this.uniforms.sourceRadius.value = e
      }
    }
  }),
  ApplyProjection.prototype = Object.create(THREE.ShaderMaterial.prototype, {
    velocity: {
      get: function() {
        return this.uniforms.velocity.value
      },
      set: function(e) {
        this.uniforms.velocity.value = e
      }
    },
    divPress: {
      get: function() {
        return this.uniforms.divPress.value
      },
      set: function(e) {
        this.uniforms.divPress.value = e
      }
    }
  }),
  CalculateCurl.prototype = Object.create(THREE.ShaderMaterial.prototype, {
    velocity: {
      get: function() {
        return this.uniforms.velocity.value
      },
      set: function(e) {
        this.uniforms.velocity.value = e
      }
    }
  }),
  CalculateDivergence.prototype = Object.create(THREE.ShaderMaterial.prototype, {
    velocity: {
      get: function() {
        return this.uniforms.velocity.value
      },
      set: function(e) {
        this.uniforms.velocity.value = e
      }
    }
  }),
  ConfineVorticity.prototype = Object.create(THREE.ShaderMaterial.prototype, {
    velocity: {
      get: function() {
        return this.uniforms.velocity.value
      },
      set: function(e) {
        this.uniforms.velocity.value = e
      }
    },
    curl: {
      get: function() {
        return this.uniforms.curl.value
      },
      set: function(e) {
        this.uniforms.curl.value = e
      }
    },
    vorticity: {
      get: function() {
        return this.uniforms.vorticity.value
      },
      set: function(e) {
        this.uniforms.vorticity.value = e
      }
    }
  }),
  DivPressBorders.prototype = Object.create(THREE.ShaderMaterial.prototype, {
    divPress: {
      get: function() {
        return this.uniforms.divPress.value
      },
      set: function(e) {
        this.uniforms.divPress.value = e
      }
    }
  }),
  FluidSim.Mode = {
    SMOKE: 0,
    WATER: 1
  },
  FluidSim.prototype = {
    get mode() {
      return this._mode
    },
    addWater: function(e, t) {
      console.assert(this._mode === FluidSim.Mode.WATER, "Mode is set to SMOKE. Use addDensity instead."),
        this._addWater.source = this._dataBuffer.source;
      var n = this._addWater.sourcePosition;
      n.copy(e),
        n.x += .5 * this._numCellsX,
        n.y += .5 * this._numCellsY,
        n.z += .5 * this._numCellsZ,
        this._addWater.radius = t,
        this._rectRenderer.execute(this._addWater, this._dataBuffer.target),
        this._dataBuffer.swap()
    },
    addDensity: function(e, t) {
      console.assert(this._mode === FluidSim.Mode.SMOKE, "Mode is set to WATER. Use addWater instead."),
        this._addDensity.source = this._dataBuffer.source;
      var n = this._addDensity.sourcePosition;
      n.copy(e),
        n.x += .5 * this._numCellsX,
        n.y += .5 * this._numCellsY,
        n.z += .5 * this._numCellsZ,
        this._addDensity.amount = t,
        this._rectRenderer.execute(this._addDensity, this._dataBuffer.target),
        this._dataBuffer.swap()
    },
    setExternalForce: function(e, t, n) {
      var i = this._applyForces.sourcePosition;
      i.copy(e),
        i.x += .5 * this._numCellsX,
        i.y += .5 * this._numCellsY,
        i.z += .5 * this._numCellsZ,
        this._applyForces.force.copy(t),
        this._applyForces.force.multiplyScalar(n)
    },
    get textureWidth() {
      return this._textureWidth
    },
    get textureHeight() {
      return this._textureHeight
    },
    get pixelWidth() {
      return 1 / this._textureWidth
    },
    get pixelHeight() {
      return 1 / this._textureHeight
    },
    get numCellsX() {
      return this._numCellsX
    },
    get numCellsY() {
      return this._numCellsY
    },
    get numCellsZ() {
      return this._numCellsZ
    },
    get velocityBuffer() {
      return this._velocityBuffer
    },
    get dataBuffer() {
      return this._dataBuffer
    },
    get auxBuffer() {
      return this._auxBuffer
    },
    get edgeMask() {
      return this._edgeMask
    },
    _createEdgeMaskData: function() {
      return this._floatTextureType === THREE.FloatType ? this._createEdgeMaskData32() : this._createEdgeMaskData16()
    },
    _createEdgeMaskData32: function() {
      for (var e = [], t = 0, n = this._numCellsX, i = this._numCellsY, r = this._numCellsZ, o = n - 1, s = i - 1, a = r - 1, l = 0; l < i; ++l)
        for (var c = 0; c < r; ++c)
          for (var u = 0; u < n; ++u) {
            var d = 0 === u ? 1 : u === o ? -1 : 0,
              h = 0 === l ? 1 : l === s ? -1 : 0,
              m = 0 === c ? 1 : c === a ? -1 : 0;
            e[t] = d,
              e[t + 1] = h,
              e[t + 2] = m,
              e[t + 3] = 0 === d && 0 === h && 0 === m ? 1 : 0,
              t += 4
          }
      return new Float32Array(e)
    },
    _createEdgeMaskData16: function() {
      for (var e = [], t = 0, n = this._numCellsX, i = this._numCellsY, r = this._numCellsZ, o = n - 1, s = i - 1, a = r - 1, l = 0; l < i; ++l)
        for (var c = 0; c < r; ++c)
          for (var u = 0; u < n; ++u) {
            var d = 0 === u ? 15360 : u === o ? 48128 : 0,
              h = 0 === l ? 15360 : l === s ? 48128 : 0,
              m = 0 === c ? 15360 : c === a ? 48128 : 0;
            e[t] = d,
              e[t + 1] = h,
              e[t + 2] = m,
              e[t + 3] = 0 === d && 0 === h && 0 === m ? 15360 : 0,
              t += 4
          }
      return new Uint16Array(e)
    },
    _createInitialFieldData: function() {
      return this._floatTextureType === THREE.FloatType ? this._createInitialFieldData32() : this._createInitialFieldData16()
    },
    _createInitialFieldData32: function() {
      for (var e = [], t = 0, n = this._numCellsX, i = this._numCellsY, r = this._numCellsZ, o = 0; o < i; ++o)
        for (var s = 0; s < r; ++s)
          for (var a = 0; a < n; ++a)
            e[t] = 0,
            e[t + 1] = 0,
            e[t + 2] = 0,
            e[t + 3] = 0,
            t += 4;
      return new Float32Array(e)
    },
    _createInitialFieldData16: function() {
      for (var e = [], t = 0, n = this._numCellsX, i = this._numCellsY, r = this._numCellsZ, o = 0; o < i; ++o)
        for (var s = 0; s < r; ++s)
          for (var a = 0; a < n; ++a)
            e[t] = 0,
            e[t + 1] = 0,
            e[t + 2] = 0,
            e[t + 3] = 0,
            t += 4;
      return new Uint16Array(e)
    },
    reset: function() {
      var e = this._createInitialFieldData();
      CopyDataToRenderTarget.execute(e, this._velocityBuffer.target, this._renderer),
        this._velocityBuffer.swap(),
        CopyDataToRenderTarget.execute(e, this._dataBuffer.target, this._renderer),
        this._dataBuffer.swap()
    },
    update: function(e) {
      e *= .001,
        e > .01 && (e = .01),
        this._executeAdvectMacCormack(e, this._dataBuffer),
        this._executeAdvectSemiLagrangian(e, this._velocityBuffer),
        this._applyExternalForces(e),
        this._project(),
        this._mode === FluidSim.Mode.SMOKE && this._executeConfineVorticity(),
        this._project()
    },
    _executeAdvectSemiLagrangian: function(e, t) {
      this._advectSemiLagrangian.velocity = this._velocityBuffer.source,
        this._advectSemiLagrangian.source = t.source,
        this._advectSemiLagrangian.dt = e,
        this._rectRenderer.execute(this._advectSemiLagrangian, t.target),
        t.swap(),
        this._applyVelocityBorders()
    },
    _executeConfineVorticity: function() {
      this._calculateCurl.velocity = this._velocityBuffer.source,
        this._rectRenderer.execute(this._calculateCurl, this._auxBuffer.target),
        this._auxBuffer.swap(),
        this._confineVorticity.velocity = this._velocityBuffer.source,
        this._confineVorticity.curl = this._auxBuffer.source,
        this._rectRenderer.execute(this._confineVorticity, this._velocityBuffer.target),
        this._velocityBuffer.swap(),
        this._applyVelocityBorders()
    },
    _applyExternalForces: function(e) {
      this._applyForces.velocity = this._velocityBuffer.source,
        this._applyForces.fluid = this._dataBuffer.source,
        this._applyForces.dt = e,
        this._rectRenderer.execute(this._applyForces, this._velocityBuffer.target),
        this._velocityBuffer.swap(),
        this._applyVelocityBorders()
    },
    _executeAdvectMacCormack: function(e, t) {
      this._advectSemiLagrangian.velocity = this._velocityBuffer.source,
        this._advectSemiLagrangian.source = t.source,
        this._advectSemiLagrangian.dt = e,
        this._rectRenderer.execute(this._advectSemiLagrangian, this._auxBuffer.target),
        this._auxBuffer.swap(),
        this._advectSemiLagrangian.velocity = this._velocityBuffer.source,
        this._advectSemiLagrangian.source = this._auxBuffer.source,
        this._advectSemiLagrangian.dt = -e,
        this._rectRenderer.execute(this._advectSemiLagrangian, this._auxBuffer.target),
        this._advectMacCormack.source = t.source,
        this._advectMacCormack.velocity = this._velocityBuffer.source,
        this._advectMacCormack.advected = this._auxBuffer.source,
        this._advectMacCormack.advectedReverse = this._auxBuffer.target.texture,
        this._advectMacCormack.dt = e,
        this._rectRenderer.execute(this._advectMacCormack, t.target),
        t.swap(),
        this._applyVelocityBorders()
    },
    _project: function() {
      this._calculateDivergence.velocity = this._velocityBuffer.source,
        this._rectRenderer.execute(this._calculateDivergence, this._auxBuffer.target),
        this._auxBuffer.swap(),
        this._applyDivPressBorders();
      for (var e = 0; e < this.projectionIterations; ++e)
        this._solvePressure.divPress = this._auxBuffer.source,
        this._rectRenderer.execute(this._solvePressure, this._auxBuffer.target),
        this._auxBuffer.swap(),
        this._applyDivPressBorders();
      this._applyProjection.velocity = this._velocityBuffer.source,
        this._applyProjection.divPress = this._auxBuffer.source,
        this._rectRenderer.execute(this._applyProjection, this._velocityBuffer.target),
        this._velocityBuffer.swap(),
        this._applyVelocityBorders()
    },
    _createDoubleBuffer: function() {
      return new DoubleBufferTexture(this._textureWidth, this._textureHeight, this._getRTOptions())
    },
    _getRTOptions: function() {
      return {
        type: this._floatTextureType,
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        generateMipmaps: !1,
        depthBuffer: !1,
        stencilBuffer: !1
      }
    },
    _applyVelocityBorders: function() {
      this._velocityBorders.velocity = this._velocityBuffer.source,
        this._rectRenderer.execute(this._velocityBorders, this._velocityBuffer.target),
        this._velocityBuffer.swap()
    },
    _applyDivPressBorders: function() {
      this._divPressBorders.divPress = this._auxBuffer.source,
        this._rectRenderer.execute(this._divPressBorders, this._auxBuffer.target),
        this._auxBuffer.swap()
    }
  },
  SolvePressure.prototype = Object.create(THREE.ShaderMaterial.prototype, {
    divPress: {
      get: function() {
        return this.uniforms.divPress.value
      },
      set: function(e) {
        this.uniforms.divPress.value = e
      }
    }
  }),
  VelocityBorders.prototype = Object.create(THREE.ShaderMaterial.prototype, {
    velocity: {
      get: function() {
        return this.uniforms.velocity.value
      },
      set: function(e) {
        this.uniforms.velocity.value = e
      }
    }
  }),
  DebugAlphaMaterial = function(e) {
    e = e || {};
    var t = {
      map: {
        value: e.map
      }
    };
    THREE.ShaderMaterial.call(this, {
      uniforms: t,
      vertexShader: ShaderLibrary.get("debug_alpha_vertex"),
      fragmentShader: ShaderLibrary.get("debug_alpha_fragment")
    })
  },
  DebugAlphaMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype),
  DebugMergedMaterial = function(e) {
    this._fluidSim = e;
    var t = "#define NUM_CELLS_Z " + e.numCellsZ + "\n",
      n = {
        map: {
          value: null
        },
        texelSize: {
          value: new THREE.Vector2(e.pixelWidth, e.pixelHeight)
        }
      };
    THREE.ShaderMaterial.call(this, {
      uniforms: n,
      vertexShader: t + ShaderLibrary.get("debug_merged_vertex"),
      fragmentShader: t + ShaderLibrary.get("debug_merged_fragment")
    })
  },
  DebugMergedMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype),
  DebugMergedMaterial.prototype.update = function() {
    this.uniforms.map.value = this._fluidSim.dataBuffer.source
  },
  DebugVec3Material = function(e) {
    var t = {
      map: {
        value: e.map
      }
    };
    THREE.ShaderMaterial.call(this, {
      uniforms: t,
      vertexShader: ShaderLibrary.get("debug_vec3_vertex"),
      fragmentShader: ShaderLibrary.get("debug_vec3_fragment")
    })
  },
  DebugVec3Material.prototype = Object.create(THREE.ShaderMaterial.prototype),
  RenderVolumeMaterial = function(e, t, n) {
    var i = "#define NUM_SAMPLES " + n + "\n";
    t && (i += "#define SKYBOX\n");
    var r = e.numCellsX,
      o = e.numCellsY,
      s = e.numCellsZ,
      a = Math.sqrt(r * r + o * o + s * s),
      l = {
        fluid: {
          value: null
        },
        numCells: {
          value: new THREE.Vector3(e.numCellsX, e.numCellsY, e.numCellsZ)
        },
        modelViewMatrixInverse: {
          value: new THREE.Matrix4
        },
        absorption: {
          value: new THREE.Color(.01, .01, .01)
        },
        transparency: {
          value: .01
        },
        smokeColor: {
          value: new THREE.Color(16777215)
        },
        samplePlaneDistance: {
          value: a / (n - 1)
        },
        skybox: {
          value: t
        }
      };
    THREE.ShaderMaterial.call(this, {
        uniforms: l,
        vertexShader: i + ShaderLibrary.get("render_volume_vertex"),
        fragmentShader: i + ShaderLibrary.get("render_volume_fragment")
      }),
      this._fluidSim = e
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
    transparency: {
      get: function() {
        return this.uniforms.transparency.value
      },
      set: function(e) {
        this.uniforms.transparency.value = e
      }
    }
  }),
  RenderVolumeMaterial.prototype.update = function(e, t, n) {
    this.uniforms.fluid.value = n;
    var i = this.uniforms.modelViewMatrixInverse.value;
    i.multiplyMatrices(t.matrixWorldInverse, e.matrixWorld),
      i.getInverse(i)
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
          this._content && this._content.resize(e, t)
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
  SmokeSimContent.prototype = {
    init: function(e) {
      var t = this._highPerformance ? 64 : 32;
      this._forceStrength = 60,
        this._numLightSamples = t / 4,
        this._numDensitySamples = t,
        this._fluidAbsorption = new THREE.Color(.02, .015, .01),
        this._fluidAbsorption.multiplyScalar(this._highPerformance ? .2 : .4),
        this._scene = e.scene,
        this._camera = e.camera,
        this._camera.far = 1e3,
        this._renderer = e.renderer,
        this._assetLibrary = e.assetLibrary,
        this._container = document.getElementById("webglcontainer"),
        this._fluidSim = new FluidSim(this._renderer, t, t, t),
        this._mouseDown = !1,
        this._mouseMovement = new THREE.Vector3,
        this._mouseCell = new THREE.Vector3,
        this._hasMousePos = !1,
        this._lightingRenderer = new VolumetricLightRenderer(this._renderer, this._fluidSim.numCellsX, this._fluidSim.numCellsY, this._fluidSim.numCellsZ, this._numLightSamples),
        this._lightingRenderer.absorption = this._fluidAbsorption,
        this._lightingRenderer.absorption.multiplyScalar(4),
        this._lightingRenderer.irradiance = this._assetLibrary.get("irradiance"),
        this._initCameraController(),
        this._initScene(),
        document.addEventListener("mousemove", this.onMouseMove.bind(this)),
        document.addEventListener("mousedown", this.onMouseDown.bind(this)),
        document.addEventListener("mouseup", this.onMouseUp.bind(this))
    },
    onMouseDown: function(e) {
      this._projectMouse(e.clientX, e.clientY),
        e.shiftKey || (this._mouseDown = !0)
    },
    onMouseUp: function(e) {
      this._mouseDown = !1
    },
    onMouseMove: function(e) {
      var t = this._hasMousePos,
        n = this._mouseCell.clone();
      this._projectMouse(e.clientX, e.clientY),
        t && this._mouseMovement.subVectors(this._mouseCell, n)
    },
    start: function() {},
    destroy: function() {},
    resize: function(e, t) {},
    update: function(e) {
      this._hasMousePos && (this._fluidSim.setExternalForce(this._mouseCell, this._mouseMovement, e * this._forceStrength),
          this._mouseDown && this._fluidSim.addDensity(this._mouseCell, .2 * e)),
        this._fluidSim.update(e),
        this._lightingRenderer.render(this._fluidSim.dataBuffer.source, this._fluidSim.auxBuffer.target, this._fluidMesh, this._camera),
        this._fluidSim.auxBuffer.swap(),
        this._renderSmokeMaterial.update(this._fluidMesh, this._camera, this._fluidSim.auxBuffer.source)
    },
    _initCameraController: function() {
      var e = new OrbitController(document.getElementById("webglcontainer"), null, (!0));
      e.radius = this._highPerformance ? 150 : 80,
        e.minRadius = 1,
        e.maxRadius = 1e3,
        e.zoomSpeed = 50,
        Entity.addComponent(this._camera, e)
    },
    _initScene: function() {
      var e = this._disco ? null : this._assetLibrary.get("irradiance");
      this._renderSmokeMaterial = new RenderVolumeMaterial(this._fluidSim, e, this._numDensitySamples),
        this._renderSmokeMaterial.transparency = .005,
        this._renderSmokeMaterial.absorption = this._fluidAbsorption;
      var t = new THREE.BoxBufferGeometry(this._fluidSim.numCellsX, this._fluidSim.numCellsY, this._fluidSim.numCellsZ);
      if (this._fluidMesh = new THREE.Mesh(t, this._renderSmokeMaterial),
        this._scene.add(this._fluidMesh),
        this._disco)
        this._addPointLight(.001, .0015, 8e-4, 0, .5, 1.4, 16711680),
        this._addPointLight(8e-4, .001, 95e-5, .2, .9, .88, 65280),
        this._addPointLight(.0015, 85e-5, .001, .7, .3, .5, 255);
      else {
        var n = new Skybox(e, 500);
        this._scene.add(n);
        var i = new THREE.DirectionalLight(16768443);
        i.position.set(1, 1, 1),
          this._lightingRenderer.addLight(i),
          i = new THREE.DirectionalLight(16768443),
          i.position.set(1, 1, 1),
          this._scene.add(i)
      }
    },
    _addPointLight: function(e, t, n, i, r, o, s) {
      var a = new THREE.PointLight(s);
      a.position.set(0, 0, 0),
        a.intensity = 100,
        Entity.addComponent(a, new MoveAroundComponent(e, t, n, i, r, o, this._highPerformance ? 40 : 20)),
        this._lightingRenderer.addLight(a),
        a = new THREE.PointLight(s),
        a.position.set(0, 0, 0),
        a.intensity = 100,
        Entity.addComponent(a, new MoveAroundComponent(e, t, n, i, r, o, this._highPerformance ? 40 : 20)),
        this._scene.add(a)
    },
    _projectMouse: function(e, t) {
      e = e / window.innerWidth * 2 - 1,
        t = -(t / window.innerHeight * 2 - 1);
      var n = (new THREE.Matrix4).getInverse(this._camera.projectionMatrix),
        i = new THREE.Vector3(e, t, 0).applyProjection(n),
        r = this._fluidMesh.modelViewMatrix.elements[14],
        o = r / i.z;
      this._mouseCell.set(o * i.x, o * i.y, o * i.z),
        this._mouseCell.applyMatrix4(this._camera.matrixWorld),
        this._hasMousePos = !0
    },
    reset: function() {
      this._fluidSim.reset()
    }
  },
  WaterSimContent.prototype = {
    init: function(e) {
      var t = this._highPerformance ? 64 : 32;
      this._forceStrength = 200,
        this._numLightSamples = t / 4,
        this._numDensitySamples = t,
        this._fluidAbsorption = new THREE.Color(.1, .05, .03),
        this._fluidAbsorption.multiplyScalar(this._highPerformance ? 4 : 8),
        this._scene = e.scene,
        this._camera = e.camera,
        this._camera.far = 1e3,
        this._renderer = e.renderer,
        this._assetLibrary = e.assetLibrary,
        this._container = document.getElementById("webglcontainer"),
        this._fluidSim = new FluidSim(this._renderer, t, t, t, FluidSim.Mode.WATER),
        this._mouseDown = !1,
        this._mouseMovement = new THREE.Vector3,
        this._mouseCell = new THREE.Vector3,
        this._hasMousePos = !1,
        this._lightingRenderer = new VolumetricLightRenderer(this._renderer, this._fluidSim.numCellsX, this._fluidSim.numCellsY, this._fluidSim.numCellsZ, this._numLightSamples, (!0)),
        this._lightingRenderer.absorption = this._fluidAbsorption,
        this._lightingRenderer.irradiance = this._assetLibrary.get("irradiance"),
        this._initCameraController(),
        this._initScene(),
        document.addEventListener("mousemove", this.onMouseMove.bind(this)),
        document.addEventListener("mousedown", this.onMouseDown.bind(this)),
        document.addEventListener("mouseup", this.onMouseUp.bind(this))
    },
    onMouseDown: function(e) {
      this._projectMouse(e.clientX, e.clientY),
        e.shiftKey || (this._mouseDown = !0)
    },
    onMouseUp: function(e) {
      this._mouseDown = !1
    },
    onMouseMove: function(e) {
      var t = this._hasMousePos,
        n = this._mouseCell.clone();
      this._projectMouse(e.clientX, e.clientY),
        t && this._mouseMovement.subVectors(this._mouseCell, n)
    },
    start: function() {},
    destroy: function() {},
    resize: function(e, t) {},
    update: function(e) {
      this._hasMousePos && (this._fluidSim.setExternalForce(this._mouseCell, this._mouseMovement, e * this._forceStrength),
          this._mouseDown && this._fluidSim.addWater(this._mouseCell, 3)),
        this._fluidSim.update(e),
        this._lightingRenderer.render(this._fluidSim.dataBuffer.source, this._fluidSim.auxBuffer.target, this._fluidMesh, this._camera),
        this._fluidSim.auxBuffer.swap(),
        this._renderWaterMaterial.update(this._fluidMesh, this._camera, this._fluidSim.auxBuffer.source)
    },
    _initCameraController: function() {
      var e = new OrbitController(document.getElementById("webglcontainer"), null, (!0));
      e.radius = this._highPerformance ? 150 : 80,
        e.minRadius = 1,
        e.maxRadius = 1e3,
        e.zoomSpeed = 50,
        Entity.addComponent(this._camera, e)
    },
    _initScene: function() {
      var e = this._disco ? null : this._assetLibrary.get("skybox");
      this._renderWaterMaterial = new RenderVolumeMaterial(this._fluidSim, e, this._numDensitySamples),
        this._renderWaterMaterial.absorption = this._fluidAbsorption;
      var t = new THREE.BoxBufferGeometry(this._fluidSim.numCellsX, this._fluidSim.numCellsY, this._fluidSim.numCellsZ);
      if (this._fluidMesh = new THREE.Mesh(t, this._renderWaterMaterial),
        this._scene.add(this._fluidMesh),
        this._disco)
        this._addPointLight(.001, .0015, 8e-4, 0, .5, 1.4, 16711680),
        this._addPointLight(8e-4, .001, 95e-5, .2, .9, .88, 65280),
        this._addPointLight(.0015, 85e-5, .001, .7, .3, .5, 255);
      else {
        var n = new Skybox(e, 500);
        this._scene.add(n);
        var i = new THREE.DirectionalLight(16777215);
        i.position.set(1, 1, 1),
          this._lightingRenderer.addLight(i)
      }
    },
    _addPointLight: function(e, t, n, i, r, o, s) {
      var a = new THREE.PointLight(s);
      a.position.set(0, 0, 0),
        a.intensity = 100,
        Entity.addComponent(a, new MoveAroundComponent(e, t, n, i, r, o, this._highPerformance ? 40 : 20)),
        this._lightingRenderer.addLight(a)
    },
    _projectMouse: function(e, t) {
      e = e / window.innerWidth * 2 - 1,
        t = -(t / window.innerHeight * 2 - 1);
      var n = (new THREE.Matrix4).getInverse(this._camera.projectionMatrix),
        i = new THREE.Vector3(e, t, 0).applyProjection(n),
        r = this._fluidMesh.modelViewMatrix.elements[14],
        o = r / i.z;
      this._mouseCell.set(o * i.x, o * i.y, o * i.z),
        this._mouseCell.applyMatrix4(this._camera.matrixWorld),
        this._hasMousePos = !0
    },
    reset: function() {
      this._fluidSim.reset()
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
  VolumetricLighting.prototype = Object.create(THREE.ShaderMaterial.prototype, {
    densityField: {
      get: function() {
        return this.uniforms.densityField.value
      },
      set: function(e) {
        this.uniforms.densityField.value = e
      }
    },
    irradiance: {
      get: function() {
        return this.uniforms.irradiance.value
      },
      set: function(e) {
        this.uniforms.irradiance.value = e
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
    get irradiance() {
      return this._material.irradiance
    },
    set irradiance(e) {
      this._material.irradiance = e
    },
    addLight: function(e) {
      this._scene.add(e)
    },
    removeLight: function(e) {
      this._scene.remove(e)
    },
    render: function(e, t, n, i) {
      var r = new THREE.Matrix4;
      r.getInverse(n.matrixWorld);
      var o = this._material.cameraPos;
      o.copy(i.position),
        o.applyMatrix4(r),
        this._material.densityField = e,
        this._renderer.render(this._scene, this._camera, t, !0)
    }
  };
