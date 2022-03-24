/*
 * decaffeinate suggestions:
 * DS002: Fix invalid constructor
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

class Program {
  constructor(name, globals) {
    this.enableAttributes = this.enableAttributes.bind(this);
    this.use = this.use.bind(this);
    this.setUniforms = this.setUniforms.bind(this);
    this.setUp = this.setUp.bind(this);
    this.checkUniformAssignments = this.checkUniformAssignments.bind(this);
    this.draw = this.draw.bind(this);
    this.name = name;
    this.attributes = {};
    this.uniforms = {};
    this.uniformsAssigned = [];
    let textureUnit = 0;
    for (let line of Array.from(globals)) {
      const words = line.split(' ');
      const last = words[words.length - 1];
      const ident = last.slice(0, +(last.length - 2) + 1 || undefined);
      if (words[0] === 'attribute') {
        this.attributes[ident] = gl.getAttribLocation(this.name, ident);
      }
      if (words[0] === 'uniform') {
        this.uniforms[ident] = {};
        const loc = gl.getUniformLocation(this.name, ident);
        const type = words[words.length - 2];
        this.uniforms[ident].loc = loc;
        this.uniforms[ident].type = type;
        if (type === 'sampler2D') {
          this.uniforms[ident].textureUnit = textureUnit;
          textureUnit += 1;
        }
      }
    }
    this.enableAttributes();
  }

  enableAttributes() {
    return (() => {
      const result = [];
      for (let attrib in this.attributes) {
        result.push(gl.enableVertexAttribArray(this.attributes[attrib]));
      }
      return result;
    })();
  }

  use() {
    gl.useProgram(this.name);
    return this;
  }

  setUniforms(uniforms) {
    for (let ident in uniforms) {
      if (!(ident in this.uniforms)) {
        console.log(this.uniforms);
        throw "Undefined Uniform Variable " + ident;
      }
      const {
        loc
      } = this.uniforms[ident];
      const {
        type
      } = this.uniforms[ident];
      const unit = this.uniforms[ident].textureUnit;
      let val = uniforms[ident];
      if (type === 'vec2') {
        gl.uniform2fv(loc, val);
      } else if (type === 'vec4') {
        gl.uniform4fv(loc, val);
      } else if (type === 'int') {
        gl.uniform1i(loc, val);
      } else if (type === 'float') {
        gl.uniform1f(loc, val);
      } else if (type === 'sampler2D') {
        var filtering;
        if (val instanceof Array) {
          [val, filtering] = Array.from(val);
        }
        if (val instanceof DoubleFramebuffer) {
          val = val.source;
        }
        if (val instanceof Framebuffer) {
          val = val.texture;
        }
        if (!(val instanceof Texture)) {
          throw "Sampler2D is not set to Texture!";
        }
        val.bindTo(unit);
        if (filtering) {
          val.setFiltering(filtering);
        }
        gl.uniform1i(loc, unit);
      } else {
        throw "Unrecognized type " + type;
      }
      this.uniformsAssigned.push(ident);
    }
    return this;
  }

  setUp(parameters) {
    this.use();
    if (parameters.uniforms) {
      this.setUniforms(parameters.uniforms);
    }
    if (parameters.vertexData) {
      if (parameters.vertexData === 'quad') {
        gpu.bindQuadArrays(this);
        this.vertexData = 'quad';
      } else {
        throw 'Unrecognized VertexData' + parameters.vertexData;
      }
    }
    if (parameters.target) {
      this.target = parameters.target;
    }

    return this;
  }

  checkUniformAssignments() {
    return (() => {
      const result = [];
      for (let uniform in this.uniforms) {
        if (!Array.from(this.uniformsAssigned).includes(uniform)) {
          result.push(console.log('Uniform ' + uniform + ' not Assigned!'));
        } else {
          result.push(undefined);
        }
      }
      return result;
    })();
  }

  draw(parameters) {
    let uniformsAssigned;
    if (parameters) {
      this.setUp(parameters);
    }

    this.checkUniformAssignments();

    if (this.clear) {
      this.target.getTargetFB.clear();
    }
    if (this.vertexData === 'quad') {
      if (this.target instanceof DoubleFramebuffer) {
        this.target.drawQuadToTargetAndSwap();
      } else if (this.target instanceof Framebuffer) {
        this.target.bindFB();
        gpu.drawQuad();
      }
    } else {
      throw "Unrecognized VertexData";
    }
    return uniformsAssigned = {};
  }
}

class Texture {
  constructor(width, height, channels) {
    this.setNearest = this.setNearest.bind(this);
    this.setLinear = this.setLinear.bind(this);
    this.setFiltering = this.setFiltering.bind(this);
    this.bindTo = this.bindTo.bind(this);
    const name = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, name);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    if (channels === 4) {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.FLOAT, null);
    } else if (channels === 1) {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    }
    gl.bindTexture(gl.TEXTURE_2D, null);
    this.name = name;
    this.width = width;
    this.height = height;
  }

  setNearest() {
    return this.setFiltering(gl.NEAREST);
  }

  setLinear() {
    return this.setFiltering(gl.LINEAR);
  }

  setFiltering(filtering) {
    gl.bindTexture(gl.TEXTURE_2D, this.name);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filtering);
    return gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filtering);
  }

  bindTo(unit) {
    gl.activeTexture(gl.TEXTURE0 + unit);
    return gl.bindTexture(gl.TEXTURE_2D, this.name);
  }
}

class Framebuffer {
  constructor(width, height, channels) {
    this.bindFB = this.bindFB.bind(this);
    this.clear = this.clear.bind(this);
    this.fill = this.fill.bind(this);
    this.getTargetFB = this.getTargetFB.bind(this);
    if (channels == null) { channels = 4; }
    this.methods = [];
    this.width = width;
    this.height = height;
    const framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    framebuffer.width = width;
    framebuffer.height = height;

    const texture = new Texture(width, height, channels);

    const renderbuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, framebuffer.width, framebuffer.height);

    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture.name, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);

    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    this.name = framebuffer;
    this.texture = texture;
  }

  bindFB() {
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.name);
    gl.viewport(0, 0, this.width, this.height);
    return this;
  }

  clear(color) {
    if (color == null) { color = [0, 0, 0, 0]; }
    gl.clearColor(color[0], color[1], color[2], color[3]);
    gl.clear(gl.COLOR_BUFFER_BIT);
    return this;
  }

  fill(color) {
    return gpu.programs.fill.draw({
      uniforms: {
        color
      },
      vertexData: 'quad',
      target: this
    });
  }

  getTargetFB() {
    return this;
  }
}

class CanvasFB extends Framebuffer {
  constructor() {
    super();
    this.bindFB = this.bindFB.bind(this);
    this.width = canvas.width;
    this.height = canvas.height;
  }

  bindFB() {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.width, this.height);
    return this;
  }
}

class DoubleFramebuffer {
  constructor() {
    this.swap = this.swap.bind(this);
    this.drawQuadToTargetAndSwap = this.drawQuadToTargetAndSwap.bind(this);
    this.getTargetFB = this.getTargetFB.bind(this);
    this.framebuffers = [];

    const args = [null];
    for (let arg of Array.from(arguments)) {
      args.push(arg);
    }

    for (let i = 0; i <= 1; i++) {
      const fb = new(Function.prototype.bind.apply(Framebuffer, args));
      this.framebuffers.push(fb);
    }
    this.pointer = 0;
    this.swap();
  }

  swap() {
    this.pointer ^= 1;
    this.source = this.framebuffers[this.pointer];
    return this.target = this.framebuffers[this.pointer ^ 1];
  }

  drawQuadToTargetAndSwap() {
    this.target.bindFB();
    gpu.drawQuad();
    return this.swap();
  }

  getTargetFB() {
    return this.target;
  }
}

class GPU {
  initialize(programNames, cb) {
    // window.canvas = document.getElementById('main-canvas');
    window.canvas = document.querySelector("canvas")
    const gl = canvas.getContext('experimental-webgl');
    gl.disable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);
    if (!gl.getExtension('OES_texture_float')) {
      alert("Error: no float texture support!");
    }
    if (!gl.getExtension('OES_texture_float_linear')) {
      alert("Error: no float texture lerp support!");
    }
    for (let ext of Array.from(gl.getSupportedExtensions())) {
      gl.getExtension(ext);
    }
    window.gl = gl;
    this.initializeQuadVBOs();
    this.programNames = programNames.concat(['plot', 'fill']);
    this.programs = [];
    this.loadAllPrograms();
    window.canvasFb = new CanvasFB();
    let stats = new Stats();
    stats.setMode(1);
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';
    document.body.appendChild(stats.domElement);
    this.timeingStats = stats;
    stats = new Stats();
    stats.setMode(0);
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '80px';
    stats.domElement.style.top = '0px';
    document.body.appendChild(stats.domElement);
    this.fpsStats = stats;

  }

  bindQuadArrays(prog) {
    gl.bindBuffer(gl.ARRAY_BUFFER, gpu.quadVertexPosbuffer);
    gl.vertexAttribPointer(prog.attributes.position, gpu.quadVertexPosbuffer.itemSize, gl.FLOAT, false, 0, 0);
    return gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gpu.quadVertexIndbuffer);
  }

  drawQuad() {
    return gl.drawElements(gl.TRIANGLES, gpu.quadVertexIndbuffer.numItems, gl.UNSIGNED_SHORT, 0);
  }

  parseProgram(code) {
    let fsStart, vsStart;
    const lines = code.split('\n');
    let globals = [];
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      line = line.trim();
      if (line.startsWith("//***")) {
        line = line.substring(5, line.length - 3);
        line = line.trim().toLowerCase();
        if (line === "globals") {
          const globalStart = i;
        }
        if (line === "vertex shader") {
          vsStart = i;
        }
        if (line === "fragment shader") {
          fsStart = i;
        }
      }
    }

    globals = lines.slice(0, vsStart);
    const nonAttributes = globals.filter(line => !line.startsWith('attribute'));
    const vertexShaderLines = globals.concat(lines.slice(vsStart, fsStart));
    let fragmentShaderLines = nonAttributes.concat(lines.slice(fsStart, lines.length));
    fragmentShaderLines = ['precision highp float;\nprecision highp int;'].concat(fragmentShaderLines);

    const vertexShader = vertexShaderLines.join('\n');
    const fragmentShader = fragmentShaderLines.join('\n');

    return [globals, vertexShader, fragmentShader];
  }

  initializeQuadVBOs() {
    const quadVertexPosbuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadVertexPosbuffer);
    const vtxPos = [
      -1.0, -1.0,
      1.0, -1.0,
      1.0, 1.0,
      -1.0, 1.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vtxPos), gl.STATIC_DRAW);
    quadVertexPosbuffer.itemSize = 2;
    quadVertexPosbuffer.numItems = 4;

    const quadVertexIndbuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, quadVertexIndbuffer);
    const vtxInd = [0, 1, 2, 0, 2, 3];
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(vtxInd), gl.STATIC_DRAW);
    quadVertexIndbuffer.itemSize = 1;
    quadVertexIndbuffer.numItems = 6;
    this.quadVertexPosbuffer = quadVertexPosbuffer;
    return this.quadVertexIndbuffer = quadVertexIndbuffer;
  }

  plotTexture(texture, offset, log) {
    if (offset == null) { offset = [0, 0]; }
    return gpu.programs.plot.draw({
      uniforms: {
        bufSize: [texture.width, texture.height],
        screenSize: [canvasFb.width, canvasFb.height],
        texture: [texture, gl.NEAREST],
        offset,
        transform: log
      },
      vertexData: 'quad',
      target: canvasFb,
      clear: true
    });
  }

  constructor() {
    this.loadProgram = this.loadProgram.bind(this);
    this.onStart = this.onStart.bind(this);
    this.start = this.start.bind(this);
    this.bindCanvas = this.bindCanvas.bind(this);
    this.textures = [];
    this.programs = [];
  }

  createTexture(width, height) {}

  createGlobal(name) {}

  getShader(type, code) {
    const shader = gl.createShader(type, code);

    gl.shaderSource(shader, code);
    gl.compileShader(shader);
    const log = gl.getShaderInfoLog(shader);
    if (log) {
      console.log(code);
      console.log(log);
      throw "Shader Error";
    }
    return shader;
  }

  createProgram(vs, fs) {
    const prog = gl.createProgram();
    gl.attachShader(prog, this.getShader(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, this.getShader(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog);
    const log = gl.getProgramInfoLog(prog);
    if (log) {
      console.log(log);
    }
    return prog;
  }

  async loadProgram(name) {
    const msg = window.shaderLib[name]
    const [globals, vs, fs] = Array.from(this.parseProgram(msg));
    this.programs[name] = new Program((this.createProgram(vs, fs)), globals);
    return this.programs[name];
  }

  loadAllPrograms() {
    this.numProgramsLeft = this.programNames.length;
    return Array.from(this.programNames).map((programName) =>
      this.loadProgram(programName));
  }

  onStart(func) {
    return this.onStartFunc = func;
  }

  start() {
    console.log('GL Loaded');
    return this.onStartFunc();
  }

  bindCanvas() {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return gl.viewport(0, 0, canvas.width, canvas.height);
  }
}

window.Program = Program;
window.Texture = Texture;
window.Framebuffer = Framebuffer;
window.DoubleFramebuffer = DoubleFramebuffer;
window.GPU = GPU;
