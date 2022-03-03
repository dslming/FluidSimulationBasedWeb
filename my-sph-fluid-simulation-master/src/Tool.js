// Useful constants

const PI = Math.PI;
export { PI }
// Useful functions

export function deg2rad(deg) {
  return deg * PI / 180;
}

export function rad2deg(rad) {
  return rad * 180 / PI;
}

export function get_time() {
  return Date.now();
}

export function time_since(time) {
  return (get_time() - time);
}


function area2(p, q, s) {
  return p.x * q.y - p.y * q.x +
    q.x * s.y - q.y * s.x +
    s.x * p.y - s.y * p.x;
}

export function toLeftTest(p, q, s) {
  return area2(p, q, s) > 0;
}
