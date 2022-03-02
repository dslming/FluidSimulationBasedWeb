import { Vector2 } from './Vector2.js'

export class Grid {

  constructor(grid_size, width, height) {
    this.grid_size = grid_size;
    this.grid_size_squared = this.grid_size * this.grid_size;
    this.grid_count_x = Math.ceil(width / this.grid_size);
    this.grid_count_y = Math.ceil(height / this.grid_size);
    this.elements = [];
    for (let i = 0; i < this.grid_count_x; i++) {
      this.elements[i] = new Array(this.grid_count_y);
      for (let j = 0; j < this.grid_count_y; j++) {
        this.elements[i][j] = { particles: [], size: 0 };
      }
    }
  }

  add_item(particle) {
    let grid_index_x = Math.floor(particle.pos.x / this.grid_size);
    let grid_index_y = Math.floor(particle.pos.y / this.grid_size);

    if (grid_index_x < 0) {
      grid_index_x = 0;
    } else if (grid_index_x > (this.grid_count_x - 1)) {
      grid_index_x = this.grid_count_x - 1;
    }
    if (grid_index_y < 0) {
      grid_index_y = 0;
    } else if (grid_index_y > (this.grid_count_y - 1)) {
      grid_index_y = this.grid_count_y - 1;
    }

    if (this.elements[grid_index_x] === undefined) {
      console.error(grid_index_x, grid_index_y);

    }
    if (this.elements[grid_index_x][grid_index_y].particles.length < this.elements[grid_index_x][grid_index_y].size) {
      this.elements[grid_index_x][grid_index_x].particles.push(particle);
    } else {
      this.elements[grid_index_x][grid_index_y].particles[this.elements[grid_index_x][grid_index_y].size] = particle;
    }
    this.elements[grid_index_x][grid_index_y].size = this.elements[grid_index_x][grid_index_y].size + 1;
  }

  clear() {
    for (let i = 0; i < this.grid_count_x; i++) {
      for (let j = 0; j < this.grid_count_y; j++) {
        this.elements[i][j].size = 0; // Don't clear array, just overwrite and keep track of virtual end of array
      }
    }
  }

  retrieve_items(p) {
    let x = Math.floor(p.pos.x / this.grid_size);
    let y = Math.floor(p.pos.y / this.grid_size);
    if (x < 0) {
      x = 0;
    } else if (x > (this.grid_count_x - 1)) {
      x = this.grid_count_x - 1;
    }
    if (y < 0) {
      y = 0;
    } else if (y > (this.grid_count_y - 1)) {
      y = this.grid_count_y - 1;
    }
    for (let i = 0; i < this.elements[x][y].size; i++) {
      let distance_apart_squared = Math.pow(p.pos.x - this.elements[x][y].particles[i].pos.x, 2) + Math.pow(p.pos.y - this.elements[x][y].particles[i].pos.y, 2);
      if (distance_apart_squared < this.grid_size_squared) {
        p.SPH_neighbours.push(this.elements[x][y].particles[i]);
      }
    }
    let x_limit_min = (x == 0);
    let x_limit_max = (x == (this.grid_count_x - 1));
    let y_limit_min = (y == 0);
    let y_limit_max = (y == (this.grid_count_y - 1));
    if (!x_limit_min) {
      for (let i = 0; i < this.elements[x - 1][y].size; i++) {
        let distance_apart_squared = Math.pow(p.pos.x - this.elements[x - 1][y].particles[i].pos.x, 2) + Math.pow(p.pos.y - this.elements[x - 1][y].particles[i].pos.y, 2);
        if (distance_apart_squared < this.grid_size_squared) {
          p.SPH_neighbours.push(this.elements[x - 1][y].particles[i]);
        }
      }
    }
    if (!x_limit_max) {
      for (let i = 0; i < this.elements[x + 1][y].size; i++) {
        let distance_apart_squared = Math.pow(p.pos.x - this.elements[x + 1][y].particles[i].pos.x, 2) + Math.pow(p.pos.y - this.elements[x + 1][y].particles[i].pos.y, 2);
        if (distance_apart_squared < this.grid_size_squared) {
          p.SPH_neighbours.push(this.elements[x + 1][y].particles[i]);
        }
      }
    }
    if (!y_limit_min) {
      for (let i = 0; i < this.elements[x][y - 1].size; i++) {
        let distance_apart_squared = Math.pow(p.pos.x - this.elements[x][y - 1].particles[i].pos.x, 2) + Math.pow(p.pos.y - this.elements[x][y - 1].particles[i].pos.y, 2);
        if (distance_apart_squared < this.grid_size_squared) {
          p.SPH_neighbours.push(this.elements[x][y - 1].particles[i]);
        }
      }
    }
    if (!y_limit_max) {
      for (let i = 0; i < this.elements[x][y + 1].size; i++) {
        let distance_apart_squared = Math.pow(p.pos.x - this.elements[x][y + 1].particles[i].pos.x, 2) + Math.pow(p.pos.y - this.elements[x][y + 1].particles[i].pos.y, 2);
        if (distance_apart_squared < this.grid_size_squared) {
          p.SPH_neighbours.push(this.elements[x][y + 1].particles[i]);
        }
      }
    }
    if (!y_limit_max && !x_limit_max) {
      for (let i = 0; i < this.elements[x + 1][y + 1].size; i++) {
        let distance_apart_squared = Math.pow(p.pos.x - this.elements[x + 1][y + 1].particles[i].pos.x, 2) + Math.pow(p.pos.y - this.elements[x + 1][y + 1].particles[i].pos.y, 2);
        if (distance_apart_squared < this.grid_size_squared) {
          p.SPH_neighbours.push(this.elements[x + 1][y + 1].particles[i]);
        }
      }
    }
    if (!y_limit_min && !x_limit_max) {
      for (let i = 0; i < this.elements[x + 1][y - 1].size; i++) {
        let distance_apart_squared = Math.pow(p.pos.x - this.elements[x + 1][y - 1].particles[i].pos.x, 2) + Math.pow(p.pos.y - this.elements[x + 1][y - 1].particles[i].pos.y, 2);
        if (distance_apart_squared < this.grid_size_squared) {
          p.SPH_neighbours.push(this.elements[x + 1][y - 1].particles[i]);
        }
      }
    }
    if (!y_limit_min && !x_limit_min) {
      for (let i = 0; i < this.elements[x - 1][y - 1].size; i++) {
        let distance_apart_squared = Math.pow(p.pos.x - this.elements[x - 1][y - 1].particles[i].pos.x, 2) + Math.pow(p.pos.y - this.elements[x - 1][y - 1].particles[i].pos.y, 2);
        if (distance_apart_squared < this.grid_size_squared) {
          p.SPH_neighbours.push(this.elements[x - 1][y - 1].particles[i]);
        }
      }
    }
    if (!y_limit_max && !x_limit_min) {
      for (let i = 0; i < this.elements[x - 1][y + 1].size; i++) {
        let distance_apart_squared = Math.pow(p.pos.x - this.elements[x - 1][y + 1].particles[i].pos.x, 2) + Math.pow(p.pos.y - this.elements[x - 1][y + 1].particles[i].pos.y, 2);
        if (distance_apart_squared < this.grid_size_squared) {
          p.SPH_neighbours.push(this.elements[x - 1][y + 1].particles[i]);
        }
      }
    }
  }
}
