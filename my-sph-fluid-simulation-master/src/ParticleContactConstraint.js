import { DistanceConstraint } from './DistanceConstraint.js'
import { Vector2 } from './Vector2.js'

// 接触约束粒子
export class ParticleContactConstraint extends DistanceConstraint {

  constructor(p1, p2) {
    super(p1, p2, p1.radius + p2.radius, 1.0);
    this.lifetime = this.age;
    this.stiffness = 0.9;
  }

  enforce(constraint_solver_iterations) {
    let adjusted_stiffness,
      delta,
      deltad,
      deltad1,
      deltad2,
      direction_unit_vector;
    this.current_distance = this.p2.pos.distance_from(this.p1.pos);
    // Model as an inequality constraint, i.e. only enforce if the distance is less than the constraint distance
    if (this.current_distance <= this.distance) {
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

}
