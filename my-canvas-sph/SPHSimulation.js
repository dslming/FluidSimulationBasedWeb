//---------------------------------------------------
import { MarchingSquares } from './MarchingSquares.js'
import { Array1D } from './ArrayTool.js'
import { Grid } from './Grid.js'
import { Particle } from './Particle.js'
import { Vector } from './Vector.js'
import { HsvColor } from './ColorTool.js'

class SPHSimulation {
  constructor(
    canvas,
    time,
    width,
    height,
    ndivsX,
    ndivsY,
    kernelParticles,
    capacity,
    material,
    deltaTime,
    marchingThreshold,
    color) {

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
    // 确定最佳模拟参数
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
  }


  // Assumed to be within range.
  wPoly6(rSqr, offset) {
    var dif = Math.abs(this.kernelRadiusSqr - rSqr);
    return this.wPoly6Scalar * dif * dif * dif;
  }

  wPoly6Grad(r, rSqr, offset, out) {
    if (r >= 1e-4) {
      var dif = (this.kernelRadiusSqr - rSqr) * (this.kernelRadiusSqr - rSqr);
      dif *= this.wPoly6GradScalar;
      return offset.mul(dif, out);
    } else {
      return out.set(0, 0, 0);
    }
  }

  wPoly6Laplacian(r, rSqr, offset) {
    var dif = (this.kernelRadiusSqr - rSqr);
    dif *= this.wPoly6GradScalar;
    dif *= this.wPoly6LaplacianScalar - (7 * rSqr);
    return dif;
  }

  wSpikyGrad(r, rSqr, offset, out) {
    if (r >= 1e-6) {
      var aux = this.wSpikyGradScalar * (this.kernelRadiusSqr - rSqr) / r;
      return offset.mul(aux, out);
    } else {
      return out.set(0, 0, 0);
    }
  }

  wViscosityLaplacian(r, offset) {
    return this.wViscosityLaplacianScalar * (this.kernelRadius - r);
  }

  updateNeighbors() {
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
  }

  updateDensities() {
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
  }


  updateInternalForces() {
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
    }
  }

  updateExternalForces() {
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
  }

  updateMarching() {
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
  }

  integrate(deltaTime) {
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
  }

  draw() {
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
  }

  update() {
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
  }

}



export { SPHSimulation }
