const Vec = {
  new: (x, y) => {
    return [x, y];
  },

  zero: () => {
    return [0, 0];
  },

  norm: (v) => {
    return Math.sqrt(Math.pow(v[0], 2) + Math.pow(v[1], 2));
  },

  dist: (v, u) => {
    return Math.sqrt(Math.pow(u[0] - v[0], 2) + Math.pow(u[1] - v[1], 2));
  },

  add: (v, u) => {
    return [v[0] + u[0], v[1] + u[1]];
  },

  sub: (v, u) => {
    return [v[0] - u[0], v[1] - u[1]];
  },

  dot: (v, u) => {
    return v[0] * u[0] + v[1] * u[1];
  },

  scalarMul: (v, s) => {
    return [s * v[0], s * v[1]];
  },

  addEq: (v, u) => {
    v[0] += u[0];
    v[1] += u[1];
  },

  scalarMulEq: (v, s) => {
    v[0] *= s;
    v[1] *= s;
  },

  copy: (v) => {
    return [v[0], v[1]];
  },

  getX: (v) => {
    return v[0];
  },

  getY: (v) => {
    return v[1];
  },

  setX: (v, x) => {
    v[0] = x;
  },

  setY: (v, y) => {
    v[1] = y;
  },
};

export default Vec;
