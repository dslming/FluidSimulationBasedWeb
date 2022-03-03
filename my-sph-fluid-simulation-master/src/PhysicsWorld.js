import { PI } from './Tool.js'
import { Vector2 } from './Vector2.js'
import { Particle } from './Particle.js'

import { PointConstraint } from './contraint/PointConstraint.js'
import { DistanceConstraint } from './contraint/DistanceConstraint.js'
import { ParticleContactConstraint } from './contraint/ParticleContactConstraint.js'

import { SpatialHash } from './SpatialHash.js'
import { Grid } from './Grid.js'

export class PhysicsWorld {

  constructor(width, height, time_step, constraint_solver_iterations = 10) {
    this.width = width;
    this.height = height;
    this.time_step = time_step;
    this.particles = [];
    this.constraints = [];
    this.collisions = [];
    this.boundaries = [];
    this.time = 0;
    this.steps = 0;
    // 重力场
    this.gravitational_field = new Vector2(0, -9.81);
    // 约束求解器迭代
    this.constraint_solver_iterations = constraint_solver_iterations;

    // 简单的世界边界碰撞
    this.simple_world_boundary_collisions = true;
    // 粒子到粒子碰撞
    this.particle_to_particle_collisions = true;

    // 接触半径
    this.particle_contact_radius = 0.1;
    // 空间划分
    this.SPH_spatial_partitioning = 1; // 0 = off, 1 = grid, 2 = spatial hash
    this.SPH_grid = null;

    // 光滑半径
    this.SPH_smoothing_length = 1.0;

    if (this.SPH_spatial_partitioning == 1) {
      this.SPH_grid = new Grid(this.SPH_smoothing_length, this.width, this.height);
    }
    if (this.SPH_spatial_partitioning == 2) {
      this.SPH_grid = new SpatialHash(this.SPH_smoothing_length);
    }
    this.SPH_rest_density = 1000;
    this.SPH_k = 16;
    this.SPH_u = 35;
    this.SPH_sigma_density = 315 / (64 * PI * Math.pow(this.SPH_smoothing_length, 9));
    this.SPH_sigma_pressure = -45 / (Math.PI * Math.pow(this.SPH_smoothing_length, 6));
    this.SPH_sigma_viscosity = 45 / (Math.PI * Math.pow(this.SPH_smoothing_length, 6));
  }

  create_particle(px, py, vx, vy, ax, ay, fx, fy, mass, radius, fixed) {
    this.particles.push(new Particle(px, py, vx, vy, ax, ay, fx, fy, mass, radius, fixed));
  }

  create_distance_constraint(p1, p2, distance, stiffness) {
    if (distance == null) {
      distance = p2.pos.distance_from(p1.pos);
    }
    if (stiffness == null) {
      stiffness = 0.9;
    }
    this.constraints.push(new DistanceConstraint(p1, p2, distance, stiffness));
  }

  create_point_constraint(p1, x, y, stiffness) {
    if (x == null) {
      x = p1.pos.x;
    }
    if (y == null) {
      y = p1.pos.y;
    }
    if (stiffness == null) {
      stiffness = 0.9;
    }
    this.constraints.push(new PointConstraint(p1, x, y, stiffness));
  }

  // 接触约束
  create_particle_contact_constraint(p1, p2) {
    this.constraints.push(new ParticleContactConstraint(p1, p2));
  }

  delete_particle_by_index(count) {
    // If particle was part of a constraint, delete the constraint too
    let p1 = this.particles[count];
    let number_of_iterations = this.constraints.length;
    for (let i = 0; i < number_of_iterations; i++) {
      if (this.constraints[i] instanceof DistanceConstraint) {
        if ((this.constraints[i].p2 === p1) || (this.constraints[i].p1 === p1)) {
          if (i == (this.constraints.length - 1)) {
            this.delete_constraint_by_index(i);
            number_of_iterations--;
          } else {
            this.delete_constraint_by_index(i);
            number_of_iterations--;
            i--;
          }
        }
      } else if (this.constraints[i] instanceof PointConstraint) {
        if (this.constraints[i].p1 === p1) {
          if (i == (this.constraints.length - 1)) {
            this.delete_constraint_by_index(i);
            number_of_iterations--;
          } else {
            this.delete_constraint_by_index(i);
            number_of_iterations--;
            i--;
          }
        }
      }
    }
    this.particles.splice(count, 1);
  }

  delete_particle_by_reference(p1) {
    let count = this.particles.indexOf(p1);
    this.delete_particle_by_index(count);
  }

  delete_constraint_by_index(count) {
    this.constraints.splice(count, 1);
  }

  delete_constraint_by_reference(c1) {
    let count = this.constraints.indexOf(c1);
    this.delete_constraint_by_index(count);
  }

  update() {
    this.clean_up();
    this.accumulate_forces();
    this.collision_detection_and_response();
    this.constraint_resolution();
    this.integrate();
    this.time = this.time + this.time_step;
    this.steps = this.steps + 1;
  }

  clean_up() {
    if (this.SPH_spatial_partitioning > 0) {
      this.SPH_grid.clear();
    }
    // Clear all collisions
    this.collisions.length = 0;
    // Increase age, check for end of life, delete if necessary
    let number_of_iterations = this.constraints.length;
    for (let i = 0; i < number_of_iterations; i++) {
      this.constraints[i].age = this.constraints[i].age + 1;
      if (this.constraints[i].has_life_expired()) {
        if (i == (this.constraints.length - 1)) {
          this.delete_constraint_by_index(i);
          number_of_iterations--;
        } else {
          this.delete_constraint_by_index(i);
          number_of_iterations--;
          i--;
        }
      }
    }
    // Increase age, check for end of life, delete if necessary
    number_of_iterations = this.particles.length;
    for (let i = 0; i < number_of_iterations; i++) {
      // Increase age of particles and check for end of life
      this.particles[i].age = this.particles[i].age + 1;
      //this.particles[i].check_lifetime();
      if (this.particles[i].has_life_expired()) {
        if (i == (this.particles.length - 1)) {
          this.delete_particle_by_index(i);
          number_of_iterations--;
        } else {
          this.delete_particle_by_index(i);
          number_of_iterations--;
          i--;
        }
      } else {
        // Reset force to zero
        this.particles[i].force.set_to_zero();
        // Reset acceleration to zero
        this.particles[i].acc.set_to_zero();
        // set fluid densities to zero
        this.particles[i].SPH_density = 0;
        this.particles[i].SPH_neighbours = [];
      }
    }
  }

  // 力的累加
  accumulate_forces() {
    this.calculate_gravitational_field_forces();
    this.calculate_fluid_forces();
  }

  // 约束与分辨率
  constraint_resolution() {
    // 强制所有约束，重复指定的约束求解器迭代次数
    // Enforce all constraints, repeat for as many constraint solver iterations have been specified
    for (let i = 0; i < this.constraint_solver_iterations; i++) {
      // Enforce constraints
      for (let constraint of this.constraints) {
        constraint.enforce(this.constraint_solver_iterations);
      }
    }

    // Apply restitution (particle-boundary)
    // 应用恢复（粒子边界）
    for (let particle of this.particles) {
      particle.calculate_velocity(this.time_step);

      if (this.simple_world_boundary_collisions) {
        if (particle.pos.y + particle.radius > this.height) {
          particle.vel.y = -particle.coefficient_of_restitution * particle.vel.y;
          particle.pos.y = this.height - particle.radius;
        } else if (particle.pos.y - particle.radius < 0) {
          particle.vel.y = -particle.coefficient_of_restitution * particle.vel.y;
          particle.pos.y = 0 + particle.radius;
        }

        if (particle.pos.x + particle.radius > this.width) {
          particle.vel.x = -particle.coefficient_of_restitution * particle.vel.x;
          particle.pos.x = this.width - particle.radius;
        } else if (particle.pos.x - particle.radius < 0) {
          particle.vel.x = -particle.coefficient_of_restitution * particle.vel.x;
          particle.pos.x = 0 + particle.radius;
        }
        particle.pos_previous = particle.pos.subtract(particle.vel.scale(this.time_step));
      }
    }

    // Check whether constraint has broken, if so, delete
    // 检查约束是否已断开，如果已断开，请删除
    let number_of_iterations = this.constraints.length;
    for (let i = 0; i < number_of_iterations; i++) {
      if (this.constraints[i].has_broken()) {
        if (i == (this.constraints.length - 1)) {
          this.delete_constraint_by_index(i);
          number_of_iterations--;
        } else {
          this.delete_constraint_by_index(i);
          number_of_iterations--;
          i--;
        }
      }
    }
  }


  // 碰撞检测与响应
  collision_detection_and_response() {
    let particle_index = 0;
    let particle2_index = 0;

    for (let particle of this.particles) {
      // Only proceed if a particle is allowed to collide
      if (particle.collides) {
        // First check for particle-particle collisions (but only proceed if current particle is allowed to collide with another particle)
        // 首先检查粒子碰撞（但仅当允许当前粒子与另一个粒子碰撞时才继续）
        if (this.particle_to_particle_collisions) {
          particle2_index = 0;
          for (let particle2 of this.particles) {
            if (particle2_index > particle_index) {
              if ((Math.pow(this.particles[particle_index].pos.x - this.particles[particle2_index].pos.x, 2) + Math.pow(this.particles[particle_index].pos.y - this.particles[particle2_index].pos.y, 2)) < Math.pow(this.particles[particle_index].radius + this.particles[particle2_index].radius, 2)) {
                // A particle-particle collision has been detected, create a contact constraint
                this.create_particle_contact_constraint(this.particles[particle_index], this.particles[particle2_index]);
              }
            }
            particle2_index++;
          }
        }
      }
      particle_index++;
    }
  }

  calculate_gravitational_field_forces() {
    // Apply gravitational field accelerations (not forces)
    // 应用重力场加速度（而不是力）
    for (let particle of this.particles) {
      particle.acc = particle.acc.add(this.gravitational_field);
    }
  }

  calculate_fluid_forces() {

    // Find fluid neighbours

    if (this.SPH_spatial_partitioning > 0) {
      // Populate the spatial data structure
      // 填充空间数据结构
      for (let i = 0; i < this.particles.length; i++) {
        if (this.particles[i].SPH_particle) {
          this.SPH_grid.add_item(this.particles[i]);
        }
      }
      // Query the spatial data structure for neighbours
      // 查询邻居的空间数据结构
      for (let i = 0; i < this.particles.length; i++) {
        this.SPH_grid.retrieve_items(this.particles[i]);
      }
    } else {
      // Perform a naive O(N^2) based search
      let particle_index = 0;
      let particle2_index = 0;
      for (let i = 0; i < this.particles.length; i++) {
        this.particles[i].SPH_neighbours = [];
        if (this.particles[i].SPH_particle == true) {
          particle2_index = 0;
          for (let j = 0; j < this.particles.length; j++) {
            if (particle2_index >= particle_index) {
              if (this.particles[j].SPH_particle == true) {
                let distance_apart_squared = Math.pow(this.particles[i].pos.x - this.particles[j].pos.x, 2) + Math.pow(this.particles[i].pos.y - this.particles[j].pos.y, 2);
                let SPH_smoothing_length_squared = Math.pow(this.SPH_smoothing_length, 2);
                if (distance_apart_squared < SPH_smoothing_length_squared) {
                  this.particles[i].SPH_neighbours.push(this.particles[j]);
                }
              }
            }
            particle2_index++;
          }
        }
      }
    }

    // This initial fluid simulation implementation, using smoothed particle hydrodynamics (SPH), was generally based on the concepts outlined in the paper: Particle-based fluid simulation for interactive applications (Matthias Müller, David Charypar and Markus Gross) http://matthias-mueller-fischer.ch/publications/sca03.pdf

    // Calculate fluid densities and pressures
    // 计算流体密度和压力
    for (let i = 0; i < this.particles.length; i++) {
      if (this.particles[i].SPH_particle == true) {
        if (this.particles[i].SPH_neighbours.length > 0) {
          for (let j = 0; j < (this.particles[i].SPH_neighbours.length); j++) {
            // 距离平方
            let distance_apart_squared = Math.pow(this.particles[i].pos.x - this.particles[i].SPH_neighbours[j].pos.x, 2) + Math.pow(this.particles[i].pos.y - this.particles[i].SPH_neighbours[j].pos.y, 2);
            // W_density = 315 / (64 * pi * h ^ 9) * (h ^ 2 - r ^ 2) ^ 3 based on referenced paper
            // To-do: Renormalise this for a 2D domain
            // The "sigma" portion of the smoothing function is pre-computed
            let weight = this.SPH_sigma_density * Math.pow(this.SPH_smoothing_length * this.SPH_smoothing_length - distance_apart_squared, 3);
            this.particles[i].SPH_density = this.particles[i].SPH_density + (weight * this.particles[i].SPH_neighbours[j].mass);
          }
        }
        // Clamp minimum pressure value to prevent tensile instability (ie prevent negative pressure)
        if (this.particles[i].SPH_density < this.SPH_rest_density) {
          this.particles[i].SPH_density = this.SPH_rest_density;
        }
        this.particles[i].SPH_pressure = this.SPH_k * (this.particles[i].SPH_density - this.SPH_rest_density);
      }
    }

    // Calculate pressure forces and viscosity forces
    // 计算压力和粘性力
    for (let i = 0; i < this.particles.length; i++) {
      if (this.particles[i].SPH_particle == true) {
        for (let j = 0; j < this.particles[i].SPH_neighbours.length; j++) {
          if (this.particles[i] !== this.particles[i].SPH_neighbours[j]) {
            let distance_apart_squared = Math.pow(this.particles[i].pos.x - this.particles[i].SPH_neighbours[j].pos.x, 2) + Math.pow(this.particles[i].pos.y - this.particles[i].SPH_neighbours[j].pos.y, 2);
            if (distance_apart_squared > 0) { // Todo: find elegant way to handle co-located particles
              // W_pressure = 15 / (PI * h ^ 6) * (h - r) ^ 3 based on referenced paper
              // We need the gradient of W_pressure. W_pressure_gradient = -45 / (PI * h ^ 6) * (h - r) ^ 2 based on simple algebra
              // To-do: Renormalise this for a 2D domain
              let weight_pressure = this.SPH_sigma_pressure * Math.pow(this.SPH_smoothing_length - Math.sqrt(distance_apart_squared), 2);
              let distance_apart_unit = this.particles[i].SPH_neighbours[j].pos.subtract(this.particles[i].pos).unit_vector();
              let pressure_force = this.particles[i].SPH_neighbours[j].mass * (this.particles[i].SPH_pressure + this.particles[i].SPH_neighbours[j].SPH_pressure) / (2 * this.particles[i].SPH_neighbours[j].SPH_density) * weight_pressure;
              this.particles[i].force = this.particles[i].force.add(distance_apart_unit.scale(pressure_force));
            }
            // W_viscosity = 15 / (2 * PI * h ^ 3) * (-r ^ 3 / (2 * h ^ 3) + r ^ 2 / h ^ 2 + h / (2 * r) - 1) based on referenced paper
            // We need the Laplacian of W_viscosity. W_viscosity_Laplacian = 45 / (pi * h ^ 6) * (h - r) based on referenced paper
            // Todo: Renormalise this for a 2D domain, also confirm the Laplacian independently
            // The "sigma" portion of the smoothing function is pre-computed
            let weight_viscosity = this.SPH_sigma_viscosity * (this.SPH_smoothing_length - Math.sqrt(distance_apart_squared));
            let rel_vel = this.particles[i].SPH_neighbours[j].vel.subtract(this.particles[i].vel);
            let viscosity_force_vec = rel_vel.scale(this.particles[i].SPH_neighbours[j].mass / this.particles[i].SPH_neighbours[j].SPH_density * weight_viscosity);
            this.particles[i].force = this.particles[i].force.add(viscosity_force_vec.scale(this.SPH_u));
          }
        }
      }
    }
  }

  integrate() {
    for (let particle of this.particles) {
      particle.integrate(this.time_step);
    }
  }

}
