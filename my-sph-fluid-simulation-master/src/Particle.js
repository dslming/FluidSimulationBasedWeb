import { AbstractWorldElement } from './AbstractWorldElement.js'
import { Vector2 } from './Vector2.js'

let id = 0;

// Particle class
export class Particle extends AbstractWorldElement {

  constructor(px, py, vx, vy, ax, ay, fx, fy, mass, radius, fixed) {

    super();
    this.id = id;
    id += 1
    if (px == undefined) {
      console.error("error...", px, py);
    }
    // console.error(px, py);

    // The mass of the particle
    this.mass = mass;
    this.inv_mass = 1 / mass;

    // The radius of the particle
    this.radius = radius;

    // This property defines whether the particle is allowed to move
    this.fixed = fixed;

    // A vector representing the current position of the particle
    this.pos = new Vector2(px, py);

    // A vector representing the previous position of the particle (necessary for Verlet integration)
    this.pos_previous = new Vector2(px, py);

    // A vector representing the current velocity of the particle (can also be determined implicitly from pos and prev_pos)
    this.vel = new Vector2(vx, vy);

    // A vector representing the current acceleration of the particle (necessary for Verlet integration)
    this.acc = new Vector2(ax, ay);

    // A vector representing the net force acting on the particle
    // Note: this is actually not being used at this time
    this.force = new Vector2(fx, fy);

    // Temporary integration variable (slight optimisation)
    this.temp_pos = new Vector2(px, py);

    // Represents whether a particle is permitted to collide with anything
    // 表示是否允许粒子与任何物体发生碰撞
    this.collides = true;

    // Co-efficient of restitution (particle-boundary)
    // 恢复系数（粒子边界）
    this.coefficient_of_restitution = 0.3;

    // Indicates whether the particle is a SPH fluid particle
    // 指示粒子是否为 SPH 流体粒子
    this.SPH_particle = false;

    // List of SPH fluid neighbours
    this.SPH_neighbours = [];

    // Interpolated density at SPH fluid particle
    // SPH 流体粒子的插值密度
    this.SPH_density = 0;
  }

  integrate(time_step) {
    if (!this.fixed) {
      // Verlet integration based on mutable vector operations
      this.force.scale_this(this.inv_mass);
      this.acc.add_to_this(this.force);
      this.temp_pos.x = this.pos.x;
      this.temp_pos.y = this.pos.y;
      this.acc.scale_this(time_step * time_step);
      this.acc.subtract_from_this(this.pos_previous);
      this.acc.add_to_this(this.pos);
      this.acc.add_to_this(this.pos);
      this.pos.set_to(this.acc);
      this.pos_previous.set_to(this.temp_pos);
    }
  }

  calculate_velocity(time_step) {
    this.vel = (this.pos.subtract(this.pos_previous)).scale(1 / time_step);
    // this.vel.x *= 0.9999;
    // this.vel.y *= 0.9999;
  }

}
