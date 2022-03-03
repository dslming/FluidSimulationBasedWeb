import * as THREE from 'three';
import * as C from '../app/Constant.js';


export default class GridMap {
  constructor(width, height, bound, minDist) {

    // FUNCTIONS BIND
    this.getIndex = this.getIndex.bind(this);
    this.clear = this.clear.bind(this);
    this.add = this.add.bind(this);

    this.width = width;
    this.height = height;
    this.bound = bound;
    this.minDist = minDist;

    this.unitW = width / C.GRID_SIZE;
    this.unitH = height / C.GRID_SIZE;

    this.particles = {};
  }

  getIndex(p) {
    const x = p.position.x + this.bound;
    const y = p.position.y + this.bound;
    const z = p.position.z + this.bound;

    const idxX = Math.floor(x / this.unitW);
    const idxY = Math.floor(y / this.unitH);
    const idxZ = Math.floor(z / this.unitW);

    return [idxX, idxY, idxZ];
  }

  concatIndexes(idxs) {
    return (idxs[0] + '_' + idxs[1] + '_' + idxs[2]);
  }

  closeNeighbor(p, n) {
    return (p.position.distanceTo(n.position) - C.RADIUS <= this.minDist);
  }

  clear() {
    this.particles = {};
  }

  add(p) {
    // Calculate the index for this particle in the grid.
    let idx = this.getIndex(p);
    idx = this.concatIndexes(idx);
    if (this.particles[idx] === undefined) this.particles[idx] = [];
    this.particles[idx].push(p);
  }

  findNeighbors(p) {
    const idx = this.getIndex(p);
    p.neighbors = [];

    const count = 0;
    for (let i = -1; i <= 1; i++) {
      const x = idx[0] + i;
      for (let j = -1; j <= 1; j++) {
        const y = idx[1] + j;
        for (let k = -1; k <= 1; k++) {
          const z = idx[2] + k;

          const index = this.concatIndexes([x, y, z]);
          // Check if particles exists.
          if (this.particles[index] === undefined) continue;

          // Check for each particle.
          this.particles[index].forEach((n) => {
            if (this.closeNeighbor(p, n)) {
              p.neighbors.push(n);
            }
          });
        }
      }
    }
  }
}
