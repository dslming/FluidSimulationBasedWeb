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
