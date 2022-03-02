import { AbstractConstraint } from './AbstractConstraint.js'
import { Vector2 } from './Vector2.js'

export class PointConstraint extends AbstractConstraint {

  constructor(p1, x, y, stiffness) {
    super();
    this.p1 = p1;
    this.stiffness = stiffness;
    this.anchor = new Vector2(x, y);
  }

  enforce(constraint_solver_iterations) {
    let adjusted_stiffness,
      current_distance,
      deltad,
      direction_unit_vector,
      strain;
    current_distance = this.p1.pos.distance_from(this.anchor);
    if (current_distance !== 0) {
      adjusted_stiffness = 1 - Math.pow(1 - this.stiffness, 1 / constraint_solver_iterations);
      deltad = current_distance * adjusted_stiffness;
      direction_unit_vector = new Vector2(this.p1.pos.x - this.anchor.x, this.p1.pos.y - this.anchor.y).unit_vector();
      this.p1.pos = this.p1.pos.add(direction_unit_vector.scale(-deltad));
    }
  }

  has_broken() {
    let current_distance = this.p1.pos.distance_from(this.anchor);
    if (current_distance !== 0) {
      let strain = Math.abs(current_distance);
      if (this.breakable && (strain > this.breaking_strain)) {
        return true;
      }
    }

  }

}
