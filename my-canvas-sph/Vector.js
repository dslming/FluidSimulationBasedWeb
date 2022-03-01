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

export { Vector }
