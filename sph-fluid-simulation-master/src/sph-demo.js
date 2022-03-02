import { PhysicsWorld, Grid, SpatialHash, ParticleContactConstraint } from './sph-library.js'
import { Vector2 } from './Vector2.js'
import { get_time } from './tool.js'
window.onload = () => {
  // The HTML5 canvas elements
  const canvas = document.getElementById("SketchCanvas");
  const offscreen_canvas = document.createElement('canvas');
  const ctx = offscreen_canvas.getContext('2d');
  const texture_canvas = document.createElement('canvas');

  // Target update rate in Hz
  let physics_frequency = 50;
  // Associated physics update period
  let physics_period = 1 / physics_frequency;
  // Rendering scaling variables
  let draw_size;
  let draw_scaling_factor;
  let debug_mode = true;
  let texture_size;

  // The physics world
  var physics_world;
  // The world size,10*10
  let world_size;

  // Declare loop timing variables
  let time_now;
  let time_prev;
  let delta;
  let pointer_interaction_radius = 0;

  // 簇
  function create_fluid_cluster(
    pos_x,
    pos_y,
    angle,
    width,
    height,
    divisions_width,
    divisions_height,
    contact_radius,
    density,
    collides) {

    var centre = new Vector2(pos_x, pos_y);
    var particle_mass = density * width * height / (divisions_width + 1) / (divisions_height + 1);
    // Note: density is in kg / sq. m
    var spacing_width = width / divisions_width;
    var spacing_height = height / divisions_height;
    var radii = contact_radius;

    for (var count = 0; count < divisions_height + 1; count++) {
      for (var count2 = 0; count2 < divisions_width + 1; count2++) {
        physics_world.create_particle(
          (centre.x - width / 2) + count2 * spacing_width,
          (centre.y + height / 2) - count * spacing_height,
          0,
          0,
          0,
          0,
          0,
          0,
          particle_mass,
          radii,
          false);

        physics_world.particles[physics_world.particles.length - 1].pos = physics_world.particles[physics_world.particles.length - 1].pos.rotate_about(centre, angle);

        physics_world.particles[physics_world.particles.length - 1].pos_previous.set_to(physics_world.particles[physics_world.particles.length - 1].pos);

        physics_world.particles[physics_world.particles.length - 1].SPH_particle = true;
        physics_world.particles[physics_world.particles.length - 1].collides = collides;
      }
    }

  }

  function reinitialise_spatial_partitioning() {
    let index = $("#spatial_partitioning_mode").prop('selectedIndex');
    index = 1
    physics_world.SPH_spatial_partitioning = index;
    if (index === 1) {
      physics_world.SPH_grid = new Grid(physics_world.SPH_smoothing_length, physics_world.width, physics_world.height);
    } else if (index === 2) {
      physics_world.SPH_grid = new SpatialHash(physics_world.SPH_smoothing_length);
    }
  }

  const scenes = [

    {

      name: "Fluid-column-wall",

      loader: function() {
        physics_frequency = 100;
        physics_period = 1 / physics_frequency;
        world_size = 10;
        physics_world = new PhysicsWorld(world_size, world_size, physics_period, 100);
        physics_world.gravitational_field.y = -9.81;

        create_fluid_cluster(0, 4, 0, 5, 7, 15, 25, physics_world.particle_contact_radius, 1000, true);
        physics_world.create_particle(6.5, 0.5, 0, 0, 0, 0, 0, 0, 1500, 0.5, true);
        physics_world.create_particle(6.5, 1.5, 0, 0, 0, 0, 0, 0, 1500, 0.5, true);
        physics_world.create_particle(6.5, 2.5, 0, 0, 0, 0, 0, 0, 1500, 0.5, true);
        physics_world.create_particle(6.5, 3.5, 0, 0, 0, 0, 0, 0, 1500, 0.5, true);
        window.physics_world = physics_world
      }

    },

    {

      name: "Fluid-double-columns",

      loader: function() {
        physics_frequency = 100;
        physics_period = 1 / physics_frequency;
        world_size = 10;
        physics_world = new PhysicsWorld(world_size, world_size, physics_period, 10);
        physics_world.gravitational_field.y = -9.81;
        create_fluid_cluster(1.5, 6, 0, 3, 6, 9, 18, physics_world.particle_contact_radius, 800, false);
        create_fluid_cluster(7, 6, 0, 3, 6, 9, 18, physics_world.particle_contact_radius, 800, false);
      }

    },

    {

      name: "Fluid-1024-particles",

      loader: function() {
        physics_frequency = 100;
        physics_period = 1 / physics_frequency;
        world_size = 10;
        physics_world = new PhysicsWorld(world_size, world_size, physics_period, 10);
        physics_world.gravitational_field.y = -9.81;
        create_fluid_cluster(5, 5, 0.1, 8, 8, 32, 32, physics_world.particle_contact_radius, 1000, false);
      }

    },

    {

      name: "Fluid-1600-particles",

      loader: function() {
        physics_frequency = 100;
        physics_period = 1 / physics_frequency;
        world_size = 10;
        physics_world = new PhysicsWorld(world_size, world_size, physics_period, 10);
        physics_world.gravitational_field.y = -9.81;
        create_fluid_cluster(5, 5, 0.1, 8, 8, 40, 40, physics_world.particle_contact_radius, 1000, false);
      }

    },

    {

      name: "Fluid-waves",

      loader: function() {
        physics_frequency = 100;
        physics_period = 1 / physics_frequency;
        world_size = 10;
        physics_world = new PhysicsWorld(world_size, world_size, physics_period, 10);
        physics_world.gravitational_field.y = 0;
        create_fluid_cluster(5, 5, 0, 9, 9, 27, 27, physics_world.particle_contact_radius, 1000, false);
        create_fluid_cluster(2.3, 5, 0, 2, 2, 6, 6, physics_world.particle_contact_radius, 1000, false);
      }

    },

    {

      name: "Fluid-buoyancy",

      loader: function() {
        physics_frequency = 100;
        physics_period = 1 / physics_frequency;
        world_size = 10;
        physics_world = new PhysicsWorld(world_size, world_size, physics_period, 10);
        physics_world.gravitational_field.y = -9.81;
        physics_world.SPH_target_density = 1000;
        create_fluid_cluster(5, 2.7, 0, 9, 5, 25, 18, physics_world.particle_contact_radius, 1000, true);
        physics_world.create_particle(8, 8, 0, 0, 0, 0, 0, 0, 200, 0.5, false);
        physics_world.create_particle(5, 8, 0, 0, 0, 0, 0, 0, 1500, 0.5, false);
        physics_world.create_particle(2, 8, 0, 0, 0, 0, 0, 0, 5000, 0.5, false);
      }

    },

  ];

  function prepare_texture_canvas() {
    const texture_ctx = texture_canvas.getContext('2d')
    texture_canvas.width = texture_size;
    texture_canvas.height = texture_size;
    const grd = texture_ctx.createRadialGradient(texture_size / 2, texture_size / 2, physics_world.particle_contact_radius * draw_scaling_factor, texture_size / 2, texture_size / 2, texture_size / 2);
    grd.addColorStop(0, 'rgba(20,20,150,0.2)');
    grd.addColorStop(1, 'rgba(20,20,150,0.0)');
    texture_ctx.fillStyle = grd;
    texture_ctx.beginPath();
    texture_ctx.arc(texture_size / 2, texture_size / 2, texture_size / 2, 0, 2 * Math.PI, false);
    texture_ctx.fill();
    texture_ctx.beginPath();
    texture_ctx.arc(texture_size / 2, texture_size / 2, physics_world.particle_contact_radius * draw_scaling_factor, 0, 2 * Math.PI, false);
    texture_ctx.fillStyle = 'rgba(20,20,150,0.5)';
    texture_ctx.fill();
  }

  function draw_world() {
    // Clear the scene
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw border
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';
    ctx.stroke();
    // Draw the particles
    for (let count = 0; count < physics_world.particles.length; count++) {
      if (physics_world.particles[count].SPH_particle === true) {
        ctx.drawImage(texture_canvas, Math.floor(physics_world.particles[count].pos.x * draw_scaling_factor) - texture_size / 2, Math.floor((world_size - physics_world.particles[count].pos.y) * draw_scaling_factor) - texture_size / 2);
      } else {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(53,53,53,1)';
        // Draw the contact radius circle
        ctx.arc(physics_world.particles[count].pos.x * draw_scaling_factor, world_size * draw_scaling_factor - physics_world.particles[count].pos.y * draw_scaling_factor, physics_world.particles[count].radius * draw_scaling_factor, 0, 2 * Math.PI, false);
        if (physics_world.particles[count].fixed === true) {
          ctx.fillStyle = 'rgba(200, 40, 65,1.0)';
        } else {
          ctx.fillStyle = 'rgba(33,220,33, 1.0)';
        }
        ctx.fill();
        ctx.stroke();
      }
      if (debug_mode) {
        if (physics_world.particles[count].SPH_particle) {
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(53,53,53,1)';
          // Draw the contact radius circle
          ctx.arc(physics_world.particles[count].pos.x * draw_scaling_factor, world_size * draw_scaling_factor - physics_world.particles[count].pos.y * draw_scaling_factor, physics_world.particles[count].radius * draw_scaling_factor, 0, 2 * Math.PI, false);
          if (physics_world.particles[count].fixed === true) {
            ctx.fillStyle = 'rgba(255,155,33,0.5)';
          } else if (physics_world.particles[count].SPH_particle) {
            ctx.fillStyle = 'rgba(33,220,33,0.1)';
          } else {
            ctx.fillStyle = 'rgba(33,220,33,0.5)';
          }
          ctx.fill();
          ctx.stroke();
          // Draw the smoothing radius circle
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(53,53,53,1)';
          ctx.arc(physics_world.particles[count].pos.x * draw_scaling_factor, world_size * draw_scaling_factor - physics_world.particles[count].pos.y * draw_scaling_factor, physics_world.SPH_smoothing_length * draw_scaling_factor, 0, 2 * Math.PI, false);
          ctx.stroke();
        }
        ctx.fillStyle = 'rgba(53,53,53,1)';
        ctx.font = draw_size * 0.03 + 'px ariel';
        ctx.fillText(count, physics_world.particles[count].pos.x * draw_scaling_factor - 4, world_size * draw_scaling_factor - physics_world.particles[count].pos.y * draw_scaling_factor + 3);
      }
    }
    // Draw remaining debug information
    if (debug_mode) {
      // Draw debug text
      ctx.font = draw_size * 0.03 + 'px Arial';
      ctx.fillStyle = 'black';
      ctx.fillText("Physics steps: " + physics_world.steps + ", Physics time: " + physics_world.time.toFixed(3) + "s, Physics dt: " + physics_world.time_step.toFixed(3) + "s", 7, 16);
      ctx.fillText("Number of particles: " + physics_world.particles.length + ", Number of constraints: " + physics_world.constraints.length, 7, 16 + draw_size * 0.04);
      // Draw contact contact constraints
      for (let count = 0; count < physics_world.constraints.length; count++) {
        if (physics_world.constraints[count] instanceof ParticleContactConstraint) {
          ctx.beginPath();
          ctx.moveTo(physics_world.constraints[count].p1.pos.x * draw_scaling_factor, world_size * draw_scaling_factor - physics_world.constraints[count].p1.pos.y * draw_scaling_factor);
          ctx.lineTo(physics_world.constraints[count].p2.pos.x * draw_scaling_factor, world_size * draw_scaling_factor - physics_world.constraints[count].p2.pos.y * draw_scaling_factor);
          ctx.strokeStyle = 'rgba(33,33,220,1)';
          ctx.stroke();
        }
      }
      // Draw a representation of the spatial partitioning data structure
      if (physics_world.SPH_spatial_partitioning === 1) { // Draw the grid
        for (let i = 0; i < physics_world.SPH_grid.grid_count_x; i++) {
          for (let j = 0; j < physics_world.SPH_grid.grid_count_y; j++) {
            ctx.beginPath();
            ctx.moveTo(i * physics_world.SPH_grid.grid_size * draw_scaling_factor, world_size * draw_scaling_factor - j * physics_world.SPH_grid.grid_size * draw_scaling_factor - physics_world.SPH_grid.grid_size * draw_scaling_factor);
            ctx.rect(i * physics_world.SPH_grid.grid_size * draw_scaling_factor, world_size * draw_scaling_factor - j * physics_world.SPH_grid.grid_size * draw_scaling_factor - physics_world.SPH_grid.grid_size * draw_scaling_factor, physics_world.SPH_grid.grid_size * draw_scaling_factor, physics_world.SPH_grid.grid_size * draw_scaling_factor);
            if (physics_world.SPH_grid.elements[i][j].size === 0) {
              ctx.fillStyle = 'rgba(53,53,53,0.2)';
              ctx.fill();
            }
            ctx.strokeStyle = 'rgba(53,53,53,1)';
            ctx.stroke();
          }
        }
      } else if (physics_world.SPH_spatial_partitioning > 1) { // Draw the spatial hash
        for (let i = 0; i < physics_world.SPH_grid.size; i++) {
          ctx.beginPath();
          let coordinates = Object.keys(physics_world.SPH_grid.spatial_hash)[i].split(",");
          let x = parseInt(coordinates[0]);
          let y = parseInt(coordinates[1]);
          ctx.moveTo(x * physics_world.SPH_grid.bin_size * draw_scaling_factor, world_size * draw_scaling_factor - y * physics_world.SPH_grid.bin_size * draw_scaling_factor - physics_world.SPH_grid.bin_size * draw_scaling_factor);
          ctx.rect(x * physics_world.SPH_grid.bin_size * draw_scaling_factor, world_size * draw_scaling_factor - y * physics_world.SPH_grid.bin_size * draw_scaling_factor - physics_world.SPH_grid.bin_size * draw_scaling_factor, physics_world.SPH_grid.bin_size * draw_scaling_factor, physics_world.SPH_grid.bin_size * draw_scaling_factor);
          ctx.strokeStyle = 'rgba(53,53,53,1)';
          ctx.stroke();
        }
      }
    }
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    canvas.getContext('2d').drawImage(offscreen_canvas, 0, 0);
  }

  function app_loop() {
    draw_world();
    time_now = get_time();
    delta = delta + (time_now - time_prev);
    // while (delta > (physics_period * 1000)) {
    //   delta = delta - (physics_period * 1000);
    // }
    physics_world.update();
    time_prev = get_time();
    window.requestAnimationFrame(app_loop);
  }
  window.app_loop = app_loop

  function resize_canvas() {
    // Resize the canvas element to suit the current viewport size/shape
    let viewport_width = 800 //$(window).width();
    let viewport_height = 400 //$(window).height();
    // draw_size = Math.round(0.80 * Math.min(viewport_width, 0.85 * viewport_height));
    draw_size = Math.min(viewport_height, viewport_width);

    // Recalculate the draw scaling factor
    draw_scaling_factor = draw_size / world_size;
    canvas.width = draw_size;
    canvas.height = draw_size;
    offscreen_canvas.width = draw_size;
    offscreen_canvas.height = draw_size;
    texture_size = 2 * Math.floor(physics_world.SPH_smoothing_length * draw_scaling_factor);
    texture_canvas.width = texture_size;
    texture_canvas.height = texture_size;
    prepare_texture_canvas();
    // $('#max-width-box').width(draw_size);
    // Draw the world
    draw_world();
  }

  function initialise() {
    // Load the currently selected scene
    scenes[0].loader()

    // Reinitialise the spatial partitioning mode
    // 重新初始化空间分区模式
    // reinitialise_spatial_partitioning();
    // Resize the canvas
    resize_canvas();
    // Set interaction radius of pointer
    // pointer_interaction_radius = 0.1 * physics_world.width;
    // Draw the world
    draw_world();
    // Initialise the loop timing variables
    time_now = get_time();
    time_prev = get_time();
    delta = 0;
    // Start the loop
    window.requestAnimationFrame(app_loop);
  }

  initialise();
}
