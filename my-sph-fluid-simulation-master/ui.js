import { Vector2 } from './src/Vector2.js'
import { GUI } from './lib/lil-gui.module.min.js'
let pointer_x = 0;
let pointer_y = 0;
let physics_world
let draw_scaling_factor;
let world_size
let pointer_point_constraint = null;
let pointer_state = 0;
let pointer_interaction_radius
let glass;

function start_drag() {
  pointer_state = 1;
  let near_list = [];
  for (let i = 0; i < physics_world.particles.length; i++) {
    let dist_apart = physics_world.particles[i].pos.subtract(new Vector2(pointer_x, pointer_y));
    if (dist_apart.magnitude() < pointer_interaction_radius) {
      near_list.push(physics_world.particles[i]);
    }
  }
  // Sort any particles within the pointer interaction radius by the distance to the pointer location in order to find the nearest particle https://en.wikipedia.org/wiki/Insertion_sort
  let i = 1;
  while (i < near_list.length) {
    let j = i;
    while ((j > 0) && (near_list[j - 1].pos.subtract(new Vector2(pointer_x, pointer_y)).magnitude() > near_list[j].pos.subtract(new Vector2(pointer_x, pointer_y)).magnitude())) {
      let b = near_list[j];
      near_list[j] = near_list[j - 1];
      near_list[j - 1] = b;
      j = j - 1;
    }
    i = i + 1;
  }
  if (near_list.length > 0) {
    physics_world.create_point_constraint(near_list[0], pointer_x, pointer_y, 0.6);
    pointer_point_constraint = physics_world.constraints[physics_world.constraints.length - 1];
  }
}

function stop_drag() {
  pointer_state = 0;
  if (pointer_point_constraint !== null) {
    physics_world.delete_constraint_by_reference(pointer_point_constraint);
    pointer_point_constraint = null;
  }
}

function pointer_move() {
  if ((pointer_x < 0) || (pointer_x > world_size) || (pointer_y < 0) || (pointer_y > world_size)) {
    pointer_state = 0;
    stop_drag();
  } else {
    if (pointer_point_constraint !== null) {
      pointer_point_constraint.anchor.x = pointer_x;
      pointer_point_constraint.anchor.y = pointer_y;
    }
  }
}

export function initEvent(physicsWorld, _draw_scaling_factor, _world_size, _glass) {
  glass = _glass;
  draw_scaling_factor = _draw_scaling_factor;
  physics_world = physicsWorld;
  world_size = _world_size;
  // Set interaction radius of pointer
  pointer_interaction_radius = 0.1 * physics_world.width;

  // document.getElementById("SketchCanvas").addEventListener("mousedown", function(ev) {
  //   pointer_x = (ev.pageX - ev.target.offsetLeft) / draw_scaling_factor;
  //   pointer_y = world_size - (ev.pageY - ev.target.offsetTop) / draw_scaling_factor;
  //   start_drag();
  // }, false);

  // document.getElementById("SketchCanvas").addEventListener("mouseleave", function(ev) {
  //   stop_drag();
  // }, false);

  // document.getElementById("SketchCanvas").addEventListener("mousemove", function(ev) {
  //   pointer_x = (ev.pageX - ev.target.offsetLeft) / draw_scaling_factor;
  //   pointer_y = world_size - (ev.pageY - ev.target.offsetTop) / draw_scaling_factor;
  //   pointer_move();
  // }, false);

  // document.getElementById("SketchCanvas").addEventListener("mouseup", function(ev) {
  //   stop_drag()
  // }, false);






  var gui = new GUI;
  var folder = gui.addFolder('旋转');
  const options = {
    rotation: 0
  }
  folder.add(options, 'rotation', 0.0, 180.0).step(0.0001).onChange(function(value) {
    if (glass) {
      glass.rotation = value * Math.PI / 180
    }
  });
  folder.open();
}


// glass.rotation = -60 * Math.PI / 180
