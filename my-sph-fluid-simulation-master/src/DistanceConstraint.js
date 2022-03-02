import { AbstractConstraint } from './AbstractConstraint.js'
import { Vector2 } from './Vector2.js'

// 距离约束
export class DistanceConstraint extends AbstractConstraint {

  constructor(p1, p2, distance, stiffness) {
    super();
    this.p1 = p1;
    this.p2 = p2;
    this.distance = distance;
    this.stiffness = stiffness;
    this.current_distance = this.p2.pos.distance_from(this.p1.pos);
  }

  enforce(constraint_solver_iterations) {
    let adjusted_stiffness,
      delta,
      deltad,
      deltad1,
      deltad2,
      direction_unit_vector;
    this.current_distance = this.p2.pos.distance_from(this.p1.pos);
    if (this.current_distance !== this.distance) {
      delta = this.current_distance - this.distance;
      adjusted_stiffness = 1 - Math.pow(1 - this.stiffness, 1 / constraint_solver_iterations);
      deltad = (this.current_distance - this.distance) * adjusted_stiffness;
      direction_unit_vector = new Vector2(this.p2.pos.x - this.p1.pos.x, this.p2.pos.y - this.p1.pos.y).unit_vector();
      if (this.p2.fixed && !this.p1.fixed) {
        this.p1.pos = this.p1.pos.add(direction_unit_vector.scale(deltad));
      } else if (this.p1.fixed && !this.p2.fixed) {
        this.p2.pos = this.p2.pos.add(direction_unit_vector.scale(-deltad));
      } else if (!this.p2.fixed && !this.p1.fixed) {
        deltad1 = deltad * this.p1.mass / (this.p1.mass + this.p2.mass);
        deltad2 = deltad * this.p2.mass / (this.p1.mass + this.p2.mass);
        this.p1.pos = this.p1.pos.add(direction_unit_vector.scale(deltad2));
        this.p2.pos = this.p2.pos.add(direction_unit_vector.scale(-deltad1));
      }
    }

  }

  has_broken() {
    let delta,
      strain;
    if (this.breakable) {
      delta = this.current_distance - this.distance;
      strain = Math.abs(delta) / this.distance;
      if (strain > this.breaking_strain) {
        return true;
      }
    } else {
      return false;
    }
  }

}
