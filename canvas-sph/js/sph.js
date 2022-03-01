import Vec from "./vec.js";

class SPH {
  constructor({
    supportRadius,
    particleSpacing,
    gravity,
    restDensity,
    k,
    mu,
    dt,
    kStiff,
    kDamp,
    box,
    eps,
  }) {
    this.particles = [];
    this.lookupTable = [];
    this.h = supportRadius;
    this.dx = particleSpacing;
    this.g = gravity;
    this.rho_0 = restDensity;
    this.k = k;
    this.mu = mu;
    this.dt = dt;
    this.kStiff = kStiff;
    this.kDamp = kDamp;
    this.box = box;
    this.eps = eps;

    // 颗粒质量 m = pv
    this.particleMass = Math.pow(this.dx, 2) * this.rho_0;

    this.generateLookupTable();
  }

  addParticle(position) {
    const index = this.particles.length;
    this.particles.push({
      m: this.particleMass,
      xPrev: position,
      x: position,
      v: Vec.zero(),
      vHalf: Vec.zero(),
      a: Vec.zero(),
      aPrev: Vec.zero(),
      rho: 0,
      p: 0,
      pGrad: Vec.zero(),
      viscTerm: Vec.zero(),
      boundaryForce: Vec.zero(),
      idx: index,
      neighbours: [],
    });
  }

  generateParticleRect({ randomization, left, right, bottom, top }) {
    console.log(randomization, left, right, bottom, top);
    const horizontalBorder =
      (((right - left) / this.dx - Math.floor((right - left) / this.dx)) *
        this.dx) /
      2.0;
    const verticalBorder =
      (((top - bottom) / this.dx - Math.floor((top - bottom) / this.dx)) *
        this.dx) /
      2.0;
    console.log(horizontalBorder, verticalBorder);
    for (let i = bottom + verticalBorder; i < top; i += this.dx) {
      for (let j = left + horizontalBorder; j < right; j += this.dx) {
        this.addParticle(
          Vec.new(
            j + (Math.random() * 2 - 1) * randomization,
            i + (Math.random() * 2 - 1) * randomization
          )
        );
      }
    }
  }

  generateLookupTable() {
    for (let i = 0; i < 1 / (2 * this.h); i++) {
      this.lookupTable.push([]);
      for (let j = 0; j < 1 / (2 * this.h); j++) {
        this.lookupTable[i].push([]);
      }
    }
  }

  updateLookupTable(p_i) {
    const prevCell =
      this.lookupTable[
        Math.floor(Vec.getX(p_i.xPrev) * this.lookupTable.length)
      ][Math.floor(Vec.getY(p_i.xPrev) * this.lookupTable[0].length)];

    const indexInCell = prevCell.indexOf(p_i.idx);
    if (indexInCell !== -1) {
      prevCell.splice(indexInCell, 1);
    }

    const currCell =
      this.lookupTable[Math.floor(Vec.getX(p_i.x) * this.lookupTable.length)][
        Math.floor(Vec.getY(p_i.x) * this.lookupTable[0].length)
      ];
    if (currCell) {
      currCell.push(p_i.idx);
    } else {
      console.error("Escaped particle");
    }
  }

  getLookupIndex(p_i) {
    return {
      i: Math.floor(Vec.getX(p_i.x) * this.lookupTable.length),
      j: Math.floor(Vec.getY(p_i.x) * this.lookupTable[0].length),
    };
  }

  computeNeighbours(p_i) {
    const lookupIndex = this.getLookupIndex(p_i);
    const foundParticles = [];
    for (
      let i = Math.max(0, lookupIndex.i - 1); i <= Math.min(this.lookupTable.length - 1, lookupIndex.i + 1); i++
    ) {
      for (
        let j = Math.max(0, lookupIndex.j - 1); j <= Math.min(this.lookupTable[i].length - 1, lookupIndex.j + 1); j++
      ) {
        this.lookupTable[i][j].forEach((idx) => {
          if (
            Vec.dist(p_i.x, this.particles[idx].x) <= this.h &&
            idx != p_i.idx
          ) {
            foundParticles.push(idx);
          }
        });
      }
    }
    p_i.neighbours = foundParticles;
  }

  forAllParticles(lambda) {
    this.particles.forEach((p_i) => {
      lambda(p_i);
    });
  }

  forAllNeighbours(p_i, lambda) {
    p_i.neighbours.forEach((p_jIndex) => {
      lambda(this.particles[p_jIndex]);
    });
  }

  W(p_i, p_j) {
    const r = Vec.dist(p_i.x, p_j.x);
    return (
      (4 / (Math.PI * Math.pow(this.h, 8))) *
      Math.pow(Math.pow(this.h, 2) - Math.pow(Vec.dist(p_i.x, p_j.x), 2), 3)
    );
  }

  WGrad(p_i, p_j) {
    const r = Vec.dist(p_i.x, p_j.x);
    return Vec.scalarMul(
      Vec.sub(p_i.x, p_j.x),
      ((-30 / (Math.PI * Math.pow(this.h, 5))) * Math.pow(this.h - r, 2)) / r
    );
  }

  WLap(p_i, p_j) {
    return (
      (20 / (Math.PI * Math.pow(this.h, 5))) * this.h - Vec.dist(p_i.x, p_j.x)
    );
  }

  computeDensity(p_i) {
    p_i.rho = p_i.m * this.W(p_i, p_i);
    this.forAllNeighbours(p_i, (p_j) => {
      p_i.rho += p_j.m * this.W(p_i, p_j);
    });
  }

  computePressure(p_i) {
    p_i.p = this.k * Math.max(p_i.rho - this.rho_0, 0);
  }

  computePressureGradient(p_i) {
    p_i.pGrad = Vec.zero();
    this.forAllNeighbours(p_i, (p_j) => {
      Vec.addEq(
        p_i.pGrad,
        Vec.scalarMul(
          this.WGrad(p_i, p_j),
          p_j.m * (p_i.p / Math.pow(p_i.rho, 2) + p_j.p / Math.pow(p_j.rho, 2))
        )
      );
    });
  }

  computeViscousTerm(p_i) {
    p_i.viscTerm = Vec.zero();
    this.forAllNeighbours(p_i, (p_j) => {
      Vec.addEq(
        p_i.viscTerm,
        Vec.scalarMul(
          Vec.sub(p_j.v, p_i.v),
          (p_j.m * this.WLap(p_i, p_j)) / p_j.rho
        )
      );
    });
    Vec.scalarMulEq(p_i.viscTerm, this.mu / p_i.rho);
  }

  computeBoundaryForce(p_i, { right, left, bottom, top }) {
    const n = Vec.zero();
    if (Vec.getX(p_i.x) < left + this.eps) {
      Vec.setX(n, left + this.eps - Vec.getX(p_i.x));
    }
    if (Vec.getX(p_i.x) > right - this.eps) {
      Vec.setX(n, right - this.eps - Vec.getX(p_i.x));
    }
    if (Vec.getY(p_i.x) < bottom + this.eps) {
      Vec.setY(n, bottom + this.eps - Vec.getY(p_i.x));
    }
    if (Vec.getY(p_i.x) > top - this.eps) {
      Vec.setY(n, top - this.eps - Vec.getY(p_i.x));
    }
    const d = Vec.norm(n);
    if (d > this.eps) {
      Vec.scalarMulEq(n, 1.0 / d);
      p_i.boundaryForce = Vec.scalarMul(
        n,
        this.kStiff * d - Vec.dot(p_i.v, n) * this.kDamp
      );
    }
  }

  computeAcceleration(p_i) {
    p_i.aPrev = Vec.copy(p_i.a);
    // TODO: This notation is confusing
    // a = g + F_b/m + viscTerm - pGrad
    p_i.a = Vec.add(
      this.g,
      Vec.add(
        Vec.scalarMul(p_i.boundaryForce, 1.0 / p_i.m),
        Vec.sub(p_i.viscTerm, p_i.pGrad)
      )
    );
  }

  leapFrogIntegration(p_i) {
    p_i.xPrev = Vec.copy(p_i.x);
    p_i.vHalf = Vec.add(p_i.vHalf, Vec.scalarMul(p_i.aPrev, this.dt));
    p_i.x = Vec.add(p_i.x, Vec.scalarMul(p_i.vHalf, this.dt));
    p_i.v = Vec.add(
      p_i.v,
      Vec.scalarMul(Vec.add(p_i.aPrev, p_i.a), this.dt / 2.0)
    );
  }

  simpleIntegration(p_i) {
    p_i.xPrev = Vec.copy(p_i.x);
    p_i.x = Vec.add(p_i.x, Vec.scalarMul(p_i.v, this.dt));
    p_i.v = Vec.add(p_i.v, Vec.scalarMul(p_i.a, this.dt));
  }

  init() {
    this.forAllParticles((p_i) => {
      this.updateLookupTable(p_i);
      this.computeNeighbours(p_i);
    });
  }

  computeNextFrame() {
    this.forAllParticles((p_i) => {
      this.computeDensity(p_i);
      this.computePressure(p_i);
    });

    this.forAllParticles((p_i) => {
      this.computePressureGradient(p_i);
      this.computeViscousTerm(p_i);
      this.computeBoundaryForce(p_i, this.box);
    });

    this.forAllParticles((p_i) => {
      this.computeAcceleration(p_i);
      this.leapFrogIntegration(p_i);
    });

    this.forAllParticles((p_i) => {
      this.updateLookupTable(p_i);
      this.computeNeighbours(p_i);
    });
  }
}

export default SPH;
