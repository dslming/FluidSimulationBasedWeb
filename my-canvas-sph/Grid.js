//---------------------------------------------------
import { Array2D, Array1D } from './ArrayTool.js'
import { Bucket } from './Bucket.js'

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


export { Grid }
