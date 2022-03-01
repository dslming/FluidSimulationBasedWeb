//---------------------------------------------------
import { Array2D, Array1D } from './ArrayTool.js'

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

export { Bucket }
