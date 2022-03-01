export class Vector2 {

  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  magnitude_squared() {
    return this.x * this.x + this.y * this.y;
  }

  magnitude() {
    return Math.sqrt(this.magnitude_squared());
  }

  unit_vector() {
    return new Vector2(this.x / this.magnitude(), this.y / this.magnitude());
  }

  add(v) {
    return new Vector2(this.x + v.x, this.y + v.y);
  }

  add_to_this(v) {
    this.x = this.x + v.x;
    this.y = this.y + v.y;
  }

  subtract(v) {
    return new Vector2(this.x - v.x, this.y - v.y);
  }

  subtract_from_this(v) {
    this.x = this.x - v.x;
    this.y = this.y - v.y;
  }

  scale(scalar) {
    return new Vector2(scalar * this.x, scalar * this.y);
  }

  scale_this(scalar) {
    this.x = scalar * this.x;
    this.y = scalar * this.y;
  }

  set_to(v) {
    this.x = v.x;
    this.y = v.y;
  }

  set_to_zero() {
    this.x = 0;
    this.y = 0;
  }

  rotate_about(v, angle) {
    let x,
      y;
    x = v.x + (this.x - v.x) * Math.cos(angle) - (this.y - v.y) * Math.sin(angle);
    y = v.y + (this.x - v.x) * Math.sin(angle) + (this.y - v.y) * Math.cos(angle);
    return new Vector2(x, y);
  }

  distance_from_squared(v) {
    return (v.x - this.x) * (v.x - this.x) + (v.y - this.y) * (v.y - this.y);
  }

  distance_from(v) {
    return Math.sqrt(this.distance_from_squared(v));
  }

}
