function main() {
  simulation = new SPHSimulation(
    document.getElementById("simulation"), // Canvas
    document.getElementById("time"), // FPS counter
    8, // Simulation width
    4, // Simulation heigh
    60, // No. of divisions X
    30, // No. of divisions Y
    20, // Kernel particles
    2048, // Maximum capacity of grid bucket.
    new Material(
      3, // Gas constant
      3.5, // Viscosity mu
      998.29, // Rest Density
      0.728, // Surface tension
      0.001, // Point Damping
      0.2, // Bouncyness
      0.66 // Restitution
    ),
    0.01, // Delta time
    433, // Threshold
    "#0088FF" // Color
  );
}

//---------------------------------------------------

var Array1D = function(w) {
  var output = new Array();
  output.length = w;

  return output;
}

var Array2D = function(w, h) {
  var outer = new Array();
  outer.length = h;

  for (var y = 0; y < h; y++) {
    var inner = new Array();
    inner.length = w;

    for (var x = 0; x < w; x++)
      inner[x] = 0;

    outer[y] = inner;
  }

  return outer;
};

//---------------------------------------------------

var Vector = function(x, y) {
  this.v = new Float32Array([
    (x === undefined) ? 0 : x,
    (y === undefined) ? 0 : y
  ]);
};

Vector.prototype = {
  set: function(x, y) {
    this.v[0] = x;
    this.v[1] = y;
    return this;
  },

  copy: function(v) {
    this.v[0] = v.v[0];
    this.v[1] = v.v[1];
    return this;
  },

  clone: function(v) {
    return new Vector(this.v[0], this.v[1]);
  },

  add: function(v, out) {
    if (out === undefined)
      out = this;

    return out.set(this.v[0] + v.v[0], this.v[1] + v.v[1]);
  },

  addScaled: function(v, scale, out) {
    if (out === undefined)
      out = this;

    return out.set(this.v[0] + v.v[0] * scale, this.v[1] + v.v[1] * scale);
  },

  sub: function(v, out) {
    if (out === undefined)
      out = this;

    return out.set(this.v[0] - v.v[0], this.v[1] - v.v[1]);
  },

  subScaled: function(v, scale, out) {
    if (out === undefined)
      out = this;

    return out.set(this.v[0] - v.v[0] * scale, this.v[1] - v.v[1] * scale);
  },

  mul: function(s, out) {
    if (out === undefined)
      out = this;

    return out.set(this.v[0] * s, this.v[1] * s);
  },

  div: function(s, out) {
    if (out === undefined)
      out = this;

    var i = 1 / s;
    return out.set(this.v[0] * i, this.v[1] * i);
  },

  negate: function(out) {
    if (out === undefined)
      out = this;

    return out.set(-this.v[0], -this.v[1]);
  },

  offset: function(x, y, out) {
    if (out === undefined)
      out = this;

    return out.set(this.v[0] + x, this.v[1] + y);
  },

  dot: function(v) {
    return this.v[0] * v.v[0] + this.v[1] * v.v[1];
  },

  magnitude: function() {
    return Math.sqrt(this.v[0] * this.v[0] + this.v[1] * this.v[1]);
  },

  magnitudeSqr: function() {
    return this.v[0] * this.v[0] + this.v[1] * this.v[1];
  },

  normalize: function(out) {
    if (out === undefined)
      out = this;

    var mag = this.magnitude();
    if (mag != 0.0)
      mag = 1.0 / mag;

    return this.mul(mag, out);
  },

  perpendicular: function(out) {
    if (out === undefined)
      out = this;

    var x = this.v[0];
    var y = this.v[1];

    out.v[0] = y;
    out.v[1] = -x;
    return this;
  },

  lerp: function(v, t, out) {
    if (out === undefined)
      out = this;

    return out.set(this.v[0] + (v.v[0] - this.v[0]) * t, this.v[1] + (v.v[1] - this.v[1]) * t);
  },

  angle: function() {
    return Math.atan2(this.v[0], this.v[1]);
  },

  toString: function() {
    return this.v[0] + ", " + this.v[1];
  }
};

//---------------------------------------------------

var Particle = function(id, x, y) {
  this.id = id;
  this.alive = false;
  this.position = new Vector(x, y);
  this.prevPosition = new Vector(x, y);
  this.velocity = new Vector(0, 0);
  this.acceleration = new Vector(0, 0);
  this.forces = new Vector(0, 0);
  this.normal = new Vector(0, 0);
  this.restitution = new Vector(0, 0);
  this.restCount = 0;
  this.color = 0;
  this.density = 0;
  this.pressure = 0;
};

//---------------------------------------------------

var Material = function(gasConstant, viscosityMu, restDensity, sigma, pointDamping, bouncyness, restitution) {
  this.mass = 0;
  this.gasConstant = gasConstant;
  this.viscosityMu = viscosityMu;
  this.restDensity = restDensity;
  this.sigma = sigma;
  this.pointDamping = pointDamping;
  this.bouncyness = bouncyness;
  this.restitution = restitution;
};

//---------------------------------------------------

var Bucket = function(capacity) {
  this.values = Array1D(capacity);
  this.count = 0;
  this.capacity = capacity;
};


Bucket.prototype.clear = function() {
  this.count = 0;
  return this;
};

Bucket.prototype.add = function(id) {
  if (this.count < this.capacity) {
    this.values[this.count] = id;
    this.count++;
  }

  return this;
};

Bucket.prototype.forEach = function(data, callback) {
  for (var i = this.count - 1; i >= 0; i--)
    callback(data, this.values[i]);
};

//---------------------------------------------------

var Grid = function(width, height, ndivsX, ndivsY, capacity) {
  this.width = width;
  this.height = height;
  this.ndivsX = ndivsX;
  this.ndivsY = ndivsY;

  this.gridSizeX = (this.width / this.ndivsX);
  this.gridSizeY = (this.height / this.ndivsY);

  this.buckets = Array2D(this.ndivsY, this.ndivsX);

  for (var y = 0; y < this.ndivsY; y++)
    for (var x = 0; x < this.ndivsX; x++)
      this.buckets[y][x] = new Bucket(capacity);
};

Grid.prototype.clear = function() {
  for (var y = 0; y < this.ndivsY; y++)
    for (var x = 0; x < this.ndivsX; x++)
      this.buckets[y][x].clear();

  return this;
};

Grid.prototype.add = function(position, value) {
  // Determine grid coordinates.
  var x = Math.floor(position.v[0] / this.gridSizeX);
  var y = Math.floor(position.v[1] / this.gridSizeY);

  // Clamp to domain
  if (x < 0) x = 0;
  if (y < 0) y = 0;
  if (x >= this.ndivsX) x = this.ndivsX - 1;
  if (y >= this.ndivsY) y = this.ndivsY - 1;

  // Add to bucket.
  this.buckets[y][x].add(value);

  return this;
};

Grid.prototype.forEachInRange = function(data, position, radius, callback) {
  // Determine boundaries
  var minX = Math.floor((position.v[0] - radius) / this.gridSizeX);
  var minY = Math.floor((position.v[1] - radius) / this.gridSizeY);
  var maxX = Math.floor((position.v[0] + radius) / this.gridSizeX);
  var maxY = Math.floor((position.v[1] + radius) / this.gridSizeY);

  // Clamp to domain.
  if (minX < 0) minX = 0;
  if (minY < 0) minY = 0;
  if (maxX >= this.ndivsX) maxX = this.ndivsX - 1;
  if (maxY >= this.ndivsY) maxY = this.ndivsY - 1;

  // For each...
  for (var y = minY; y <= maxY; y++)
    for (var x = minX; x <= maxX; x++)
      this.buckets[y][x].forEach(data, callback);

  return this;
};

//---------------------------------------------------

var SPHSimulation = function(canvas, time, width, height, ndivsX, ndivsY, kernelParticles, capacity, material, deltaTime, marchingThreshold, color) {
  this.canvas = canvas;
  this.context = canvas.getContext("2d");
  this.time = time;
  this.width = width;
  this.height = height;
  this.scaleX = this.canvas.width / this.width;
  this.scaleY = this.canvas.height / this.height;
  this.ndivsX = ndivsX;
  this.ndivsY = ndivsY;
  this.gridSizeX = (this.width / this.ndivsX);
  this.gridSizeY = (this.height / this.ndivsY);
  this.material = material;
  this.kernelParticles = kernelParticles;
  this.deltaTime = deltaTime;

  // Determine optimal simulation parameters
  var area = this.width * this.height;
  this.numParticles = Math.pow((ndivsX + ndivsY) / 2 + 1, 2);
  this.material.mass = this.material.restDensity * area / this.numParticles;
  this.kernelRadius = Math.sqrt((this.kernelParticles * area) / (this.numParticles * Math.PI));

  // Generate particles
  this.particles = Array1D(this.numParticles);
  this.grid = new Grid(this.width, this.height, this.ndivsX, this.ndivsY, capacity);
  this.marching = new MarchingSquares(this.width, this.height, this.ndivsX, this.ndivsY, marchingThreshold, color);

  for (var i = 0; i < this.numParticles; i++) {
    var x = 0.25 * this.width + (i % this.ndivsX * this.gridSizeX) * 0.5;
    var y = 0.5 + 0.125 * this.height + (Math.floor(i / this.ndivsX) * this.gridSizeY) * 0.25;
    this.particles[i] = new Particle(i, x, y);
  }

  // Precompute operations and store useful references.
  this.kernelRadiusSqr = Math.pow(this.kernelRadius, 2);
  this.wPoly6Scalar = 315 / (64 * Math.PI * Math.pow(this.kernelRadius, 9)); // Smoothing kernel constant
  this.wPoly6GradScalar = -945 / (32 * Math.PI * Math.pow(this.kernelRadius, 9)); // Smoothing kernel constant
  this.wPoly6LaplacianScalar = 3 * Math.pow(this.kernelRadius, 2); // Smoothing kernel constant
  this.wSpikyGradScalar = -45 / (Math.PI * Math.pow(this.kernelRadius, 6)); // Smoothing kernel constant
  this.wViscosityLaplacianScalar = 45 / (Math.PI * Math.pow(this.kernelRadius, 6)); // Smoothing kernel constant
  this.loopCallback = this.update.bind(this); // Update loop
  this.vaux = new Vector(0, 0); // Auxiliar - Vector computation
  this.gradaux = new Vector(0, 0); // Auxiliar - Gradient computation
  this.vrelaux = new Vector(0, 0); // Auxiliar - Vrel computation
  this.threshold = Math.sqrt(this.material.restDensity / this.kernelParticles) / 7; // Surface normal threshold
  this.radii = this.kernelRadius / 2; // Particle radius

  // Other scene vars.
  this.numAlive = 0;

  // Start loop
  this.update();
};

// Assumed to be within range.
SPHSimulation.prototype.wPoly6 = function(rSqr, offset) {
  var dif = Math.abs(this.kernelRadiusSqr - rSqr);
  return this.wPoly6Scalar * dif * dif * dif;
};

SPHSimulation.prototype.wPoly6Grad = function(r, rSqr, offset, out) {
  if (r >= 1e-4) {
    var dif = (this.kernelRadiusSqr - rSqr) * (this.kernelRadiusSqr - rSqr);
    dif *= this.wPoly6GradScalar;
    return offset.mul(dif, out);
  } else {
    return out.set(0, 0, 0);
  }
};

SPHSimulation.prototype.wPoly6Laplacian = function(r, rSqr, offset) {
  var dif = (this.kernelRadiusSqr - rSqr);
  dif *= this.wPoly6GradScalar;
  dif *= this.wPoly6LaplacianScalar - (7 * rSqr);
  return dif;
};

SPHSimulation.prototype.wSpikyGrad = function(r, rSqr, offset, out) {
  if (r >= 1e-6) {
    var aux = this.wSpikyGradScalar * (this.kernelRadiusSqr - rSqr) / r;
    return offset.mul(aux, out);
  } else {
    return out.set(0, 0, 0);
  }
};

SPHSimulation.prototype.wViscosityLaplacian = function(r, offset) {
  return this.wViscosityLaplacianScalar * (this.kernelRadius - r);
};

SPHSimulation.prototype.updateNeighbors = function() {
  // Clear all neighbors.
  this.grid.clear();

  // For each particle, add to grid.
  for (var i = (this.numParticles - 1); i >= 0; i--) {
    var pi = this.particles[i];

    if (pi.alive) {
      // Add to grid.
      this.grid.add(pi.position, i);

      // Reset density and forces.
      pi.forces.set(0, 0);
      pi.normal.set(0, 0);
      pi.restitution.set(0, 0);
      pi.restCount = 0;
      pi.density = 0;
      pi.pressure = 0;
      pi.color = 0;
    }
  }
};

SPHSimulation.prototype.updateDensities = function() {
  // Update density.
  for (var i = (this.numParticles - 1); i >= 0; i--) {
    var pi = this.particles[i];

    if (pi.alive) {
      // ----------------------------------------------------------------------------------
      // NOTE: This loop has been unrolled from the grid method. The method is there just
      // for convenience.
      // ----------------------------------------------------------------------------------

      // Own density.
      pi.density += this.material.mass * this.wPoly6(0, null);

      // Determine boundaries
      var minX = Math.floor((pi.position.v[0] - this.kernelRadius) / this.gridSizeX);
      var minY = Math.floor((pi.position.v[1] - this.kernelRadius) / this.gridSizeY);
      var maxX = Math.floor((pi.position.v[0] + this.kernelRadius) / this.gridSizeX);
      var maxY = Math.floor((pi.position.v[1] + this.kernelRadius) / this.gridSizeY);

      // Clamp to domain.
      if (minX < 0) minX = 0;
      if (minY < 0) minY = 0;
      if (maxX >= this.ndivsX) maxX = this.ndivsX - 1;
      if (maxY >= this.ndivsY) maxY = this.ndivsY - 1;

      // For each...
      for (var y = minY; y <= maxY; y++) {
        for (var x = minX; x <= maxX; x++) {
          var bucket = this.grid.buckets[y][x];

          for (var k = (bucket.count - 1); k >= 0; k--) {
            var j = bucket.values[k];

            if (j > i) {
              var pj = this.particles[j];

              pi.position.sub(pj.position, this.vaux); // offset = pi.position - pj.position
              var rSqr = this.vaux.magnitudeSqr();

              if (rSqr <= this.kernelRadiusSqr) {
                var w = this.wPoly6(rSqr, this.vaux);
                pi.density += this.material.mass * w;
                pj.density += this.material.mass * w;
              }
            }
          }
        }
      }
    }
  }

  // Update pressure.
  for (var i = (this.numParticles - 1); i >= 0; i--) {
    var pi = this.particles[i];

    if (pi.alive)
      pi.pressure = this.material.gasConstant * (pi.density - this.material.restDensity);
  }
};


SPHSimulation.prototype.updateInternalForces = function() {
  for (var i = (this.numParticles - 1); i >= 0; i--) {
    var pi = this.particles[i];

    if (pi.alive) {
      // ----------------------------------------------------------------------------------
      // NOTE: This loop has been unrolled from the grid method. The method is there just
      // for convenience.
      // ----------------------------------------------------------------------------------

      // Determine boundaries
      var minX = Math.floor((pi.position.v[0] - this.kernelRadius) / this.gridSizeX);
      var minY = Math.floor((pi.position.v[1] - this.kernelRadius) / this.gridSizeY);
      var maxX = Math.floor((pi.position.v[0] + this.kernelRadius) / this.gridSizeX);
      var maxY = Math.floor((pi.position.v[1] + this.kernelRadius) / this.gridSizeY);

      // Clamp to domain.
      if (minX < 0) minX = 0;
      if (minY < 0) minY = 0;
      if (maxX >= this.ndivsX) maxX = this.ndivsX - 1;
      if (maxY >= this.ndivsY) maxY = this.ndivsY - 1;

      // For each...
      for (var y = minY; y <= maxY; y++) {
        for (var x = minX; x <= maxX; x++) {
          var bucket = this.grid.buckets[y][x];

          for (var k = (bucket.count - 1); k >= 0; k--) {
            var j = bucket.values[k];

            if (j > i) {
              var pj = this.particles[j];

              pi.position.sub(pj.position, this.vaux); // offset = pi.position - pj.position
              var rSqr = this.vaux.magnitudeSqr();

              if (rSqr <= this.kernelRadiusSqr) {
                var r = Math.sqrt(rSqr);

                // Compute pressure
                var pressAuxM = (pi.pressure + pj.pressure) * 0.5;
                var pressAuxI = (this.material.mass / pj.density) * pressAuxM;
                var pressAuxJ = (this.material.mass / pi.density) * pressAuxM;
                this.wSpikyGrad(r, rSqr, this.vaux, this.gradaux);
                pi.forces.subScaled(this.gradaux, pressAuxI);
                pj.forces.addScaled(this.gradaux, pressAuxJ);

                // Compute viscosity
                var viscLap = this.material.viscosityMu * this.wViscosityLaplacian(r, this.vaux);
                var viscAuxI = (this.material.mass / pi.density) * viscLap;
                var viscAuxJ = (this.material.mass / pj.density) * viscLap;
                pj.velocity.sub(pi.velocity, this.vrelaux); // vrel = pj.velocity - pi.velocity
                pi.forces.addScaled(this.vrelaux, viscAuxI);
                pj.forces.subScaled(this.vrelaux, viscAuxJ);

                // Compute normal
                var normAuxI = (this.material.mass / pj.density);
                var normAuxJ = (this.material.mass / pi.density);
                this.wPoly6Grad(r, rSqr, this.vaux, this.gradaux);
                pi.normal.addScaled(this.gradaux, normAuxI);
                pj.normal.subScaled(this.gradaux, normAuxJ);

                // Compute color
                var colorAux = this.wPoly6Laplacian(r, rSqr, this.vaux);
                pi.color += colorAux * normAuxI;
                pj.color += colorAux * normAuxJ;

                // Compute restitution
                var d = r - this.radii;
                if ((d < 0) && (r > 0.0001)) {
                  pi.restitution.subScaled(this.vaux, (d / r));
                  pj.restitution.addScaled(this.vaux, (d / r));
                  pi.restCount++;
                  pj.restCount++;
                }
              }
            }
          }
        }
      }
    }
  };
};

SPHSimulation.prototype.updateExternalForces = function() {
  for (var i = (this.numParticles - 1); i >= 0; i--) {
    var pi = this.particles[i];

    if (pi.alive) {
      // Surface tension
      var m = pi.normal.magnitude();

      if (m > this.threshold) {
        pi.forces.addScaled(pi.normal, (-this.material.sigma * pi.color) / m);
        pi.normal.div(m);
      } else
        pi.normal.set(0, 0);

      // Other forces.
      pi.forces.v[1] += 9.81 * pi.density;
      pi.forces.subScaled(pi.velocity, this.material.pointDamping);
    }
  }
};

SPHSimulation.prototype.updateMarching = function() {
  for (var y = 0; y <= this.ndivsY; y++) {
    for (var x = 0; x <= this.ndivsX; x++) {
      // Compute mean density.
      var density = 0;

      // Determine origin.
      var xx = x * this.gridSizeX;
      var yy = y * this.gridSizeY;

      // Determine boundaries
      var minX = Math.floor((xx - this.kernelRadius) / this.gridSizeX);
      var minY = Math.floor((yy - this.kernelRadius) / this.gridSizeY);
      var maxX = Math.floor((xx + this.kernelRadius) / this.gridSizeX);
      var maxY = Math.floor((yy + this.kernelRadius) / this.gridSizeY);

      // Clamp to domain.
      if (minX < 0) minX = 0;
      if (minY < 0) minY = 0;
      if (maxX >= this.ndivsX) maxX = this.ndivsX - 1;
      if (maxY >= this.ndivsY) maxY = this.ndivsY - 1;

      // For each...
      for (var j = minY; j <= maxY; j++) {
        for (var i = minX; i <= maxX; i++) {
          var bucket = this.grid.buckets[j][i];

          for (var k = (bucket.count - 1); k >= 0; k--) {
            var l = bucket.values[k];
            var p = this.particles[l];

            this.vaux.set(xx, yy).sub(p.position);
            var rSqr = this.vaux.magnitudeSqr();

            if (rSqr <= this.kernelRadiusSqr) {
              var w = this.wPoly6(rSqr, this.vaux);
              density += this.material.mass * w;
            }
          }
        }
      }

      // Store density at point.
      var current = this.marching.values[y][x];
      this.marching.values[y][x] = current + (density - current) * 0.2;
    }
  }
};

SPHSimulation.prototype.integrate = function(deltaTime) {
  for (var i = (this.numParticles - 1); i >= 0; i--) {
    var pi = this.particles[i];

    if (pi.alive) {
      // Euler integration
      pi.velocity.addScaled(pi.forces, deltaTime / pi.density);
      pi.position.addScaled(pi.velocity, deltaTime);

      // Restitution
      if (pi.restCount > 0)
        pi.position.addScaled(pi.restitution, this.material.restitution / pi.restCount);

      // Domain collision
      if (pi.position.v[0] < this.radii) {
        pi.position.v[0] = this.radii;

        if (pi.velocity.v[0] < 0)
          pi.velocity.v[0] = -pi.velocity.v[0] * this.material.bouncyness;
      }

      if (pi.position.v[0] > (this.width - this.radii)) {
        pi.position.v[0] = this.width - this.radii;

        if (pi.velocity.v[0] > 0)
          pi.velocity.v[0] = -pi.velocity.v[0] * this.material.bouncyness;
      }

      if (pi.position.v[1] > (this.height - this.radii)) {
        pi.position.v[1] = this.height - this.radii;

        if (pi.velocity.v[1] > 0)
          pi.velocity.v[1] = -pi.velocity.v[1] * this.material.bouncyness;
      }
    }
  }
};

SPHSimulation.prototype.draw = function() {
  // Setup context.
  this.context.save();
  this.context.scale(this.scaleX, this.scaleY);
  this.context.clearRect(0, 0, this.width, this.height);
  this.context.lineWidth = 1.0 / Math.min(this.scaleX, this.scaleY);

  // Render particles.
  for (var i = (this.numParticles - 1); i >= 0; i--) {
    var pi = this.particles[i];

    if (pi.alive) {
      this.context.fillStyle = HsvColor(180 - Math.min((pi.density / 5000) * 180, 180), 100, 100);

      this.context.beginPath();
      this.context.arc(pi.position.v[0], pi.position.v[1], this.radii / 4, 0, 2 * Math.PI);
      this.context.fill();

      pi.prevPosition.copy(pi.position);
    }
  }

  // Render grid.
  /*
  for (var y = 0; y < this.ndivsX; y++)
  {
  	for (var x = 0; x < this.ndivsY; x++)
  	{
  		var bucket = this.grid.buckets[y][x];
  		if (bucket.count > 0)
  		{
  			var xx = x * this.gridSizeX;
  			var yy = y * this.gridSizeY;
  			this.context.beginPath();
  			this.context.rect(xx, yy, this.gridSizeX, this.gridSizeY);
  			this.context.stroke();
  		}
  	}
  }
  */

  // Render marching squares.
  this.marching.draw(this.context);

  this.context.restore();
};

SPHSimulation.prototype.update = function() {
  //
  if (this.numAlive < this.numParticles / 3) {
    var particle = this.particles[this.numAlive++];
    particle.alive = true;
    particle.position.set(this.width / 5, this.height / 4);
    particle.velocity.set(Math.random(15) - 30, 10);
  }

  // Update simulation
  var updateStart = Date.now();
  this.updateNeighbors();
  this.updateDensities();
  this.updateInternalForces();
  this.updateExternalForces();
  this.updateMarching();
  this.integrate(this.deltaTime);
  var updateEnd = Date.now();

  // Draw particles
  var drawStart = Date.now();
  this.draw();
  var drawEnd = Date.now();

  // Update FPS
  this.time.innerHTML = (updateEnd - updateStart);

  // Next step.
  requestAnimationFrame(this.loopCallback);
};

//---------------------------------------------------

var MarchingSquares = function(width, height, ndivsX, ndivsY, threshold, color) {
  this.width = width;
  this.height = height;
  this.ndivsX = ndivsX;
  this.ndivsY = ndivsY;

  this.gridSizeX = this.width / this.ndivsX;
  this.gridSizeY = this.height / this.ndivsY;

  this.threshold = threshold;
  this.color = color;
  this.values = Array2D(this.ndivsX + 1, this.ndivsY + 1);

  this.lutEdges = [
    0x0, // 0000
    0x9, // 1001
    0x3, // 0011
    0xa, // 1010
    0x6, // 0110
    0xf, // 1111
    0x5, // 0101
    0xc, // 1100
    0xc, // 1100
    0x5, // 0101
    0xf, // 1111
    0x6, // 0110
    0xa, // 1010
    0x3, // 0011
    0x9, // 1001
    0x0 // 0000
  ];

  this.lutSegments = [
    [],
    [0, 3],
    [1, 0],
    [1, 3],
    [2, 1],
    [2, 1, 0, 3],
    [2, 0],
    [2, 3],
    [3, 2],
    [0, 2],
    [1, 0, 3, 2],
    [1, 2],
    [3, 1],
    [0, 1],
    [3, 0],
    []
  ];

  this.tempVertices = [new Vector(), new Vector(), new Vector(), new Vector()];
  this.epsilon = 1e-6;
};

MarchingSquares.prototype = {
  interpolate: function(x1, y1, x2, y2, value1, value2, out) {
    if (Math.abs(this.threshold - value1) < this.epsilon) {
      out.set(x1, y1);
    } else if ((Math.abs(this.threshold - value2) < this.epsilon) || (Math.abs(value1 - value2) < this.epsilon)) {
      out.set(x2, y2);
    } else {
      var mu = (this.threshold - value1) / (value2 - value1);
      out.set(x1 + mu * (x2 - x1), y1 + mu * (y2 - y1));
    }
  },

  draw: function(context) {
    context.strokeStyle = this.color;

    for (var y = 0; y < this.ndivsY; y++) {
      for (var x = 0; x < this.ndivsX; x++) {
        // Compute top left position.
        var minX = x * this.gridSizeX;
        var minY = y * this.gridSizeY;
        var maxX = minX + this.gridSizeX;
        var maxY = minY + this.gridSizeY;

        // Get values
        var value0 = this.values[y][x];
        var value1 = this.values[y][x + 1];
        var value2 = this.values[y + 1][x + 1];
        var value3 = this.values[y + 1][x];

        // Compute bitfields.
        var value = 0;
        if (value0 > this.threshold) value |= 1;
        if (value1 > this.threshold) value |= 2;
        if (value2 > this.threshold) value |= 4;
        if (value3 > this.threshold) value |= 8;

        // If the value is different from 0, we can render this
        // cell.
        if (value != 0) {
          var edges = this.lutEdges[value];
          var segments = this.lutSegments[value];

          if (segments.length > 0) {
            // Compute vertex positions.
            if (edges & 1) this.interpolate(minX, minY, maxX, minY, value0, value1, this.tempVertices[0]);
            if (edges & 2) this.interpolate(maxX, minY, maxX, maxY, value1, value2, this.tempVertices[1]);
            if (edges & 4) this.interpolate(maxX, maxY, minX, maxY, value2, value3, this.tempVertices[2]);
            if (edges & 8) this.interpolate(minX, maxY, minX, minY, value3, value0, this.tempVertices[3]);

            // Render segments.
            var v = this.tempVertices[segments[0]];

            context.beginPath();
            context.moveTo(v.v[0], v.v[1]);
            for (var i = 1; i < segments.length; i++) {
              var v = this.tempVertices[segments[i]];
              context.lineTo(v.v[0], v.v[1]);
            }
            context.stroke();
          }
        }
      }
    }
  }
};

//---------------------------------------------------

var HsvColor = function(h, s, v) {
  var s = s / 100;
  var v = v / 100;

  var hi = Math.floor((h / 60) % 6);
  var f = (h / 60) - hi;
  var p = v * (1 - s);
  var q = v * (1 - f * s);
  var t = v * (1 - (1 - f) * s);

  var r, g, b;

  switch (hi) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    case 5:
      r = v;
      g = p;
      b = q;
      break;
  }

  r = Math.min(255, Math.round(r * 256));
  g = Math.min(255, Math.round(g * 256));
  b = Math.min(255, Math.round(b * 256));


  return "rgb(" + r + ", " + g + "," + b + ")";
}

//---------------------------------------------------

var requestAnimationFrame = (window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame).bind(window);

// Call main
main();
