//---------------------------------------------------
import { Vector } from './Vector.js'

var Particle = function(id, x, y) {
  this.id = id;
  this.alive = false;
  this.position = new Vector(x, y);
  this.prevPosition = new Vector(x, y);
  this.velocity = new Vector(0, 0);
  this.acceleration = new Vector(0, 0);
  this.forces = new Vector(0, 0);
  this.normal = new Vector(0, 0);
  this.restitution = new Vector(0, 0);
  this.restCount = 0;
  this.color = 0;
  this.density = 0;
  this.pressure = 0;
};

export { Particle }
