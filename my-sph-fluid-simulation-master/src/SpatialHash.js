export class SpatialHash { // This spatial hash implementation is a work in progress (not very performant at this time)

  constructor(bin_size) {
    this.spatial_hash = {};
    this.size = 0;
    this.bin_size = bin_size;
    this.bin_size_squared = this.bin_size * this.bin_size;
  }

  add_item(p) {
    let bin_index_x = Math.floor(p.pos.x / this.bin_size);
    let bin_index_y = Math.floor(p.pos.y / this.bin_size);
    let key = bin_index_x + "," + bin_index_y;
    if (this.spatial_hash[key] == undefined) {
      this.spatial_hash[key] = [];
      this.size++;
    }
    this.spatial_hash[key].push(p);
  }

  get_x_index(x) {
    return Math.floor(x / this.bin_size);
  }

  get_y_index(y) {
    return Math.floor(y / this.bin_size);
  }

  retrieve_key(x, y) {
    let bin_index_x = Math.floor(x / this.bin_size);
    let bin_index_y = Math.floor(y / this.bin_size);
    return (get_x_index(bin_index_x) + "," + get_y_index(bin_index_y));
  }

  retrieve_items(p) {
    let bin_index_x = Math.floor(p.pos.x / this.bin_size);
    let bin_index_y = Math.floor(p.pos.y / this.bin_size);
    let keys = [];
    keys.push(bin_index_x + "," + bin_index_y);
    keys.push((bin_index_x - 1) + "," + bin_index_y);
    keys.push((bin_index_x + 1) + "," + bin_index_y);
    keys.push(bin_index_x + "," + (bin_index_y + 1));
    keys.push(bin_index_x + "," + (bin_index_y - 1));
    keys.push((bin_index_x + 1) + "," + (bin_index_y + 1));
    keys.push((bin_index_x - 1) + "," + (bin_index_y + 1));
    keys.push((bin_index_x + 1) + "," + (bin_index_y - 1));
    keys.push((bin_index_x - 1) + "," + (bin_index_y - 1));
    for (let i = 0; i < keys.length; i++) {
      if (this.spatial_hash[keys[i]] !== undefined) {
        for (let j = 0; j < this.spatial_hash[keys[i]].length; j++) {
          let distance_apart_squared = Math.pow(p.pos.x - this.spatial_hash[keys[i]][j].pos.x, 2) + Math.pow(p.pos.y - this.spatial_hash[keys[i]][j].pos.y, 2);
          if (distance_apart_squared < this.bin_size_squared) {
            p.SPH_neighbours.push(this.spatial_hash[keys[i]][j]);
          }
        }
      }
    }
  }

  clear() {
    this.spatial_hash = {};
    this.size = 0;
  }

}
