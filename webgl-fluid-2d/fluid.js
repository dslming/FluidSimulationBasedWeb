/*
 * decaffeinate suggestions:
 * DS002: Fix invalid constructor
 * DS102: Remove unnecessary code created because of implicit returns
 * DS202: Simplify dynamic range loops
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

class MAC {
  constructor() {
    this.delete = this.delete.bind(this);
    this.initializeMouse = this.initializeMouse.bind(this);
    this.initializeFbs = this.initializeFbs.bind(this);
    this.initialize = this.initialize.bind(this);
    this.initializeSimulation = this.initializeSimulation.bind(this);
    this.renderParticles = this.renderParticles.bind(this);
    this.buildSystem = this.buildSystem.bind(this);
    this.moveMarkers = this.moveMarkers.bind(this);
    this.applyPressure = this.applyPressure.bind(this);
    this.applyExternalForces = this.applyExternalForces.bind(this);
    this.extrapolate = this.extrapolate.bind(this);
    this.applyBoundaryCondAndMarkValid = this.applyBoundaryCondAndMarkValid.bind(this);
    this.advectVelocity = this.advectVelocity.bind(this);
    this.substep = this.substep.bind(this);
    this.animate = this.animate.bind(this);
    this.simulate = this.simulate.bind(this);
    console.log("GLSLFluid initialzing");

    this.dim = parseInt(settings.resolution);
    this.gravity = [0, -1];
    this.t = 0.0;
    this.initializeFbs();
    this.initializeMouse();
    this.deleted = false;
    this.simulate();
  }

  delete() {
    return this.deleted = true;
  }

  initializeMouse() {
    this.mouseStrength = 0.5;
    this.dragging = false;
    this.mouseCoord = [0, 0];

    window.onCanvasMouseDown = e => {
      return this.dragging = true;
    };
    window.onCanvasMouseUp = e => {
      return this.dragging = false;
    };
    return window.onCanvasMouseMove = e => {
      const x = (e.pageX - canvas.offsetLeft) / canvas.width;
      const y = (canvas.height - (e.pageY - canvas.offsetTop)) / canvas.height;
      return this.mouseCoord = [x, y];
    };
  }


  initializeFbs() {
    this.particleFbs = new DoubleFramebuffer(this.dim, this.dim);
    this.pressureFbs = new DoubleFramebuffer(this.dim, this.dim);
    this.uFbs = new DoubleFramebuffer(this.dim + 1, this.dim);
    this.vFbs = new DoubleFramebuffer(this.dim, this.dim + 1);
    this.cellsFb = new Framebuffer(this.dim, this.dim);
    this.backBuffer = new Framebuffer(canvas.width, canvas.height);
    this.systemFb = new Framebuffer(this.dim, this.dim);
    return this.poissonSolver = new PoissonSolver(this.dim);
  }

  markCells() {
    const prog = gpu.programs.markCells.use().setUniforms({
      bufSize: [this.cellsFb.width, this.cellsFb.height],
      texture: this.particleFbs
    });

    gl.bindBuffer(gl.ARRAY_BUFFER, this.pointIdBuffer);
    gl.vertexAttribPointer(prog.attributes.id, this.pointIdBuffer.itemSize, gl.FLOAT, false, 0, 0);

    this.cellsFb.bindFB().clear();
    return gl.drawArrays(gl.POINTS, 0, this.pointIdBuffer.numItems);
  }

  initialize() {
    const numPoints = this.dim * this.dim;
    const pointIdBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pointIdBuffer);
    const pointIds = __range__(0, numPoints - 1, true);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pointIds), gl.STATIC_DRAW);
    pointIdBuffer.itemSize = 1;
    pointIdBuffer.numItems = numPoints;
    this.pointIdBuffer = pointIdBuffer;
    return this.initializeSimulation();
  }

  initializeSimulation() {
    const type = settings.initialState;
    let scene = 0;
    let offset = [0.0, 0.0];
    if (type === 'dam-left') {
      scene = 0;
      offset = [0.05, 0.02];
    } else if (type === 'dam-middle') {
      scene = 0;
      offset = [0.25, 0.05];
    } else if (type === 'dam-leftmost') {
      scene = 0;
      offset = [0.0, 0.0];
    } else if (type === 'dam-double') {
      scene = 1;
    } else if (type === 'block-top') {
      scene = 2;
    } else if (type === 'block-bottom') {
      scene = 3;
    }

    // {value: 'stationary-bottom', label: 'Stationary (Bottom)'},
    // {value: 'stationary-top', label: 'Stationary (Top)'}
    gpu.programs.initialize.draw({
      uniforms: {
        bufSize: [this.dim, this.dim],
        offset,
        scene
      },
      target: this.particleFbs,
      vertexData: 'quad'
    });

    return this.poissonSolver.reset();
  }

  renderParticles() {
    const prog = gpu.programs.points.use().setUniforms({
      texture: this.particleFbs,
      bufSize: [this.dim, this.dim],
      particleSize: parseFloat(settings.particleSize)
    });

    gl.bindBuffer(gl.ARRAY_BUFFER, this.pointIdBuffer);
    gl.vertexAttribPointer(prog.attributes.id, this.pointIdBuffer.itemSize, gl.FLOAT, false, 0, 0);

    this.backBuffer.bindFB().clear([0, 0, 0, 1]);
    gl.enable(gl.BLEND);
    // gl.blendFunc gl.SRC_ALPHA, gl.ONE
    // gl.blendFunc gl.ONE_MINUS_SRC_ALPHA, gl.SRC_ALPHA
    // gl.blendFunc gl.ONE, gl.SRC_ALPHA
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.drawArrays(gl.POINTS, 0, this.pointIdBuffer.numItems);
    return gl.disable(gl.BLEND);
  }

  buildSystem() {
    return gpu.programs.buildSystem.draw({
      uniforms: {
        bufSize: [this.dim, this.dim],
        cells: [this.cellsFb, gl.LINEAR],
        uTexture: [this.uFbs, gl.NEAREST],
        vTexture: [this.vFbs, gl.NEAREST]
      },
      vertexData: 'quad',
      target: this.systemFb
    });
  }

  moveMarkers(deltaT) {
    return gpu.programs.moveMarkers.draw({
      uniforms: {
        bufSize: [this.dim, this.dim],
        deltaT,
        uTexture: [this.uFbs, gl.LINEAR],
        vTexture: [this.vFbs, gl.LINEAR],
        particleTexture: [this.particleFbs, gl.NEAREST]
      },
      vertexData: 'quad',
      target: this.particleFbs
    });
  }

  applyPressure() {
    gpu.programs.applyPressure.draw({
      uniforms: {
        bufSize: [this.dim, this.dim + 1],
        column: 0,
        vTexture: [this.vFbs, gl.NEATEST],
        pressureTexture: [this.pressureFbs, gl.NEATEST]
      },
      vertexData: 'quad',
      target: this.vFbs
    });

    return gpu.programs.applyPressure.draw({
      uniforms: {
        bufSize: [this.dim + 1, this.dim],
        column: 1,
        vTexture: [this.uFbs, gl.NEATEST],
        pressureTexture: [this.pressureFbs, gl.NEATEST]
      },
      vertexData: 'quad',
      target: this.uFbs
    });
  }

  getUseRK2() {
    if (settings.rk2Advection) { return 1; } else { return 0; }
  }

  shouldBackupVelocity() {
    return 0;
  }

  applyExternalForces(deltaT) {
    let prog = gpu.programs.applyExternalForces.draw({
      uniforms: {
        bufSize: [this.dim + 1, this.dim],
        deltaT,
        acc: this.gravity[0],
        dragging: this.dragging * 1,
        mouseCoord: this.mouseCoord,
        vTexture: [this.uFbs, gl.NEATEST],
        isU: 1,
        strength: this.mouseStrength
      },
      vertexData: 'quad',
      target: this.uFbs
    });
    return prog = gpu.programs.applyExternalForces.draw({
      uniforms: {
        bufSize: [this.dim, this.dim + 1],
        deltaT,
        acc: this.gravity[1],
        dragging: this.dragging * 1,
        mouseCoord: this.mouseCoord,
        vTexture: [this.vFbs, gl.NEATEST],
        isU: 0,
        strength: this.mouseStrength
      },
      vertexData: 'quad',
      target: this.vFbs
    });
  }

  extrapolate() {
    gpu.programs.extrapolate.draw({
      uniforms: {
        bufSize: [this.dim, this.dim + 1],
        column: 0,
        vTexture: [this.vFbs, gl.LINEAR]
      },
      target: this.vFbs,
      vertexData: 'quad'
    });
    return gpu.programs.extrapolate.draw({
      uniforms: {
        bufSize: [this.dim + 1, this.dim],
        column: 0,
        vTexture: [this.uFbs, gl.LINEAR]
      },
      target: this.uFbs,
      vertexData: 'quad'
    });
  }

  applyBoundaryCondAndMarkValid() {
    gpu.programs.applyBoundaryCondAndMarkValid.draw({
      uniforms: {
        bufSize: [this.dim, this.dim + 1],
        column: 0,
        vTexture: this.vFbs,
        cellTexture: [this.cellsFb, gl.LINEAR]
      },
      target: this.vFbs,
      vertexData: 'quad'
    });
    return gpu.programs.applyBoundaryCondAndMarkValid.draw({
      uniforms: {
        bufSize: [this.dim + 1, this.dim],
        column: 1,
        vTexture: this.uFbs,
        cellTexture: [this.cellsFb, gl.LINEAR]
      },
      target: this.uFbs,
      vertexData: 'quad'
    });
  }

  advectVelocity(deltaT) {
    gpu.programs.advect.draw({
      uniforms: {
        bufSize: [this.dim, this.dim],
        column: 0,
        deltaT,
        uTexture: [this.uFbs, gl.LINEAR],
        vTexture: [this.vFbs, gl.LINEAR]
      },
      vertexData: 'quad',
      target: this.vFbs.target
    });

    gpu.programs.advect.draw({
      uniforms: {
        bufSize: [this.dim, this.dim],
        column: 1,
        deltaT,
        uTexture: [this.uFbs, gl.LINEAR],
        vTexture: [this.vFbs, gl.LINEAR]
      },
      vertexData: 'quad',
      target: this.uFbs.target
    });

    this.uFbs.swap();
    return this.vFbs.swap();
  }

  substep(deltaT) {
    this.moveMarkers(deltaT);
    this.markCells();
    this.applyExternalForces(deltaT);
    this.applyBoundaryCondAndMarkValid();
    this.extrapolate();
    this.advectVelocity(deltaT);
    this.buildSystem();
    this.poissonSolver.solve(this.systemFb, this.pressureFbs);
    return this.applyPressure();
  }

  animate() {
    if (this.deleted) {
      return;
    }
    if (paused) {
      requestAnimationFrame(this.animate);
      return;
    }

    const deltaT = settings.timeStep;
    gpu.timeingStats.end();
    gpu.fpsStats.end();
    gpu.timeingStats.begin();
    gpu.fpsStats.begin();
    const steps = settings.substeps;
    for (let i = 1, end = steps, asc = 1 <= end; asc ? i <= end : i >= end; asc ? i++ : i--) {
      this.substep(deltaT / steps);
    }
    this.renderParticles();
    gpu.plotTexture(this.backBuffer, [0, 0], 1);
    return requestAnimationFrame(this.animate);
  }

  simulate() {
    this.initialize();
    return requestAnimationFrame(this.animate);
  }
}

class PIC extends MAC {
  animate() {
    return super.animate();
  }
  constructor() {
    super();
    this.animate = this.animate.bind(this);
    this.moveParticles = this.moveParticles.bind(this);
    this.applyExternalForcesPIC = this.applyExternalForcesPIC.bind(this);
    this.rasterize = this.rasterize.bind(this);
    this.getFlipAlpha = this.getFlipAlpha.bind(this);
    this.resample = this.resample.bind(this);
    this.applyBoundaryConditions = this.applyBoundaryConditions.bind(this);
    this.substep = this.substep.bind(this);
    this.dim = parseFloat(settings.resolution);
    this.particleFbs = new DoubleFramebuffer(this.dim, this.dim);
    this.pressureFbs = new DoubleFramebuffer(this.dim, this.dim, 1);
    this.uFbs = new DoubleFramebuffer(this.dim + 1, this.dim);
    this.vFbs = new DoubleFramebuffer(this.dim, this.dim + 1);
    this.cellsFb = new Framebuffer(this.dim, this.dim);
    this.systemFb = new Framebuffer(this.dim, this.dim);
    this.backBuffer = new Framebuffer(canvas.width, canvas.height, 1);
    this.poissonSolver = new PoissonSolver(this.dim);
    this.gravity = [0, -1];
    this.t = 0.0;
    this.deleted = false;
    this.initializeMouse();
    this.simulate();
  }

  moveParticles(deltaT) {
    return gpu.programs.moveParticles.draw({
      uniforms: {
        bufSize: [this.dim, this.dim],
        deltaT,
        uTexture: [this.uFbs, gl.LINEAR],
        vTexture: [this.vFbs, gl.LINEAR],
        particleTexture: [this.particleFbs, gl.NEAREST]
      },
      vertexData: 'quad',
      target: this.particleFbs
    });
  }

  applyExternalForcesPIC(deltaT) {
    return gpu.programs.applyExternalForcesPIC.draw({
      uniforms: {
        bufSize: [this.dim, this.dim],
        gravity: this.gravity,
        deltaT,
        particleTexture: [this.particleFbs, gl.NEAREST]
      },
      vertexData: 'quad',
      target: this.particleFbs
    });
  }

  rasterize() {
    const rasterizeCompoment = (isU, fbs) => {
      const prog = gpu.programs.scatterVelocity.use().setUniforms({
        bufSize: [this.dim, this.dim],
        isU,
        texture: [this.particleFbs, gl.NEAREST]
      });

      fbs.target.bindFB().clear();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.pointIdBuffer);
      gl.vertexAttribPointer(prog.attributes.id, this.pointIdBuffer.itemSize, gl.FLOAT, false, 0, 0);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
      gl.drawArrays(gl.POINTS, 0, this.pointIdBuffer.numItems);
      gl.disable(gl.BLEND);
      fbs.swap();

      return gpu.programs.normalizeVelocity.draw({
        uniforms: {
          bufSize: [this.dim + (isU), this.dim + (1 - isU)],
          vTexture: fbs,
          backup: 1
        },
        target: fbs,
        vertexData: 'quad'
      });
    };

    rasterizeCompoment(1, this.uFbs);
    // gpu.plotTexture @uFbs.source.texture, [-1, 0]
    return rasterizeCompoment(0, this.vFbs);
  }

  getFlipAlpha(deltaT) {
    const flipAlphaPerSecond = Math.pow(0.1, (1 - settings.flipBlending) * 10) - 1e-10;
    return Math.pow(flipAlphaPerSecond, deltaT);
  }

  resample(deltaT) {
    return gpu.programs.resample.draw({
      uniforms: {
        bufSize: [this.dim, this.dim],
        uTexture: [this.uFbs, gl.LINEAR],
        vTexture: [this.vFbs, gl.LINEAR],
        flipAlpha: this.getFlipAlpha(deltaT),
        particleTexture: [this.particleFbs, gl.NEAREST],
        deltaT,
        rk2: this.getUseRK2()
      },
      vertexData: 'quad',
      target: this.particleFbs
    });
  }

  applyBoundaryConditions() {
    gpu.programs.applyBoundaryConditions.draw({
      uniforms: {
        bufSize: [this.dim, this.dim + 1],
        column: 0,
        vTexture: this.vFbs,
        cellTexture: [this.cellsFb, gl.LINEAR]
      },
      target: this.vFbs,
      vertexData: 'quad'
    });
    return gpu.programs.applyBoundaryConditions.draw({
      uniforms: {
        bufSize: [this.dim + 1, this.dim],
        column: 1,
        vTexture: this.uFbs,
        cellTexture: [this.cellsFb, gl.LINEAR]
      },
      target: this.uFbs,
      vertexData: 'quad'
    });
  }

  substep(deltaT) {
    this.markCells();
    this.rasterize();
    this.applyExternalForces(deltaT);
    this.applyBoundaryConditions();
    this.buildSystem();
    this.poissonSolver.solve(this.systemFb, this.pressureFbs);
    this.applyPressure();
    this.resample(deltaT);
    return this.moveParticles(deltaT);
  }
}

class PoissonSolver {
  constructor(dim) {
    this.reset = this.reset.bind(this);
    this.solve = this.solve.bind(this);
    this.dim = dim;
    this.fbs = ([1, 2].map((i) => new Framebuffer(this.dim, this.dim)));
    this.reset();
  }

  reset() {
    return this.first = true;
  }

  solve(systemFb, pressureFbs) {
    if (this.first || !settings.warmStarting) {
      pressureFbs.source.bindFB().clear([0.5, 0, 0, 0]);
      this.first = false;
    }

    const iterations = parseInt(settings.iterations);
    if (iterations === 0) {
      return;
    }
    return __range__(1, iterations, true).map((i) =>
      gpu.programs.jacobiSolver.draw({
        uniforms: {
          bufSize: [this.dim, this.dim],
          systemTexture: systemFb,
          pressure: pressureFbs,
          damping: parseFloat(settings.jacobiDamping)
        },
        target: pressureFbs,
        vertexData: 'quad'
      }));
  }
}



function initialize() {
  window.settings = {
    flipBlending: 0.8,
    initialState: "dam-left",
    iterations: 5,
    jacobiDamping: 0.67,
    method: "pic",
    particleSize: 2,
    resolution: "128",
    rk2Advection: false,
    substeps: 2,
    timeStep: 0.03,
    warmStarting: true,
  };

  window.gpu = new GPU();
  const programs = ['initialize', 'iterate', 'points',
    'markCells', 'buildSystem', 'applyExternalForcesPIC',
    'jacobiSolver', 'advect', 'applyBoundaryConditions',
    'extrapolate', 'jacobiSolver', 'applyPressure', 'moveParticles',
    'scatterVelocity', 'normalizeVelocity', 'resample', 'applyExternalForces',
    'initialize', 'iterate', 'points',
    'markCells', 'buildSystem', 'applyExternalForcesPIC',
    'jacobiSolver', 'advect', 'applyBoundaryConditions',
    'extrapolate', 'jacobiSolver', 'applyPressure', 'moveParticles',
    'scatterVelocity', 'normalizeVelocity', 'resample', 'applyExternalForces', 'moveMarkers', 'applyBoundaryCondAndMarkValid', 'plot', 'fill'
  ];

  loadShader(programs).then(() => {
    gpu.initialize(programs)
    resetFluid();
  })
};

window.resetFluid = () => {
  window.Fluid = settings.method === 'mac' ? MAC : PIC;
  if (window.fluid) {
    window.fluid.delete();
  }
  window.fluid = new Fluid();
  return window.paused = false;
};

window.PoissonSolver = PoissonSolver;
window.paused = false;
window.simulationPause = () => {
  return window.paused = !paused;
};

window.canvasClick = e => {
  return console.log(e);
};


function __range__(left, right, inclusive) {
  let range = [];
  let ascending = left < right;
  let end = !inclusive ? right : ascending ? right + 1 : right - 1;
  for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
    range.push(i);
  }
  return range;
}


window.onload = () => {
  initialize()
}
