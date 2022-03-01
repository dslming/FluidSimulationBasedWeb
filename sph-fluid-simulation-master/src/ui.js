$('#scene_list').on('change', function() {
  // Reinitialise if a different scene has been selected. Give the garbage collector an opportunity to clear scenes with large numbers of world elements.
  let pause_state = paused;
  if (!paused) {
    paused = true;
  }
  setTimeout(function() {
    initialise();
    paused = pause_state;
  }, 100);
});



$('#spatial_partitioning_mode').on('change', reinitialise_spatial_partitioning);

$('#ResumePause').on('click', function(e) {
  if (paused) {
    paused = false;
    $('#ResumePause').text('Pause');
    $("#Step").addClass("disabled");
    time_now = get_time();
    time_prev = get_time();
    window.requestAnimationFrame(app_loop);
  } else {
    paused = true;
    $('#ResumePause').text('Resume');
    $('#Step').removeClass("disabled");
  }
  draw_world();
});

$('#Step').on('click', function(e) {
  physics_world.update();
  draw_world();
});

$('#Reset').on('click', function(e) {
  // Reinitialise. Give the garbage collector an opportunity to clear scenes with large numbers of world elements.
  let pause_state = paused;
  if (!paused) {
    paused = true;
  }
  setTimeout(function() {
    initialise();
    paused = pause_state;
  }, 100);
});

$(window).resize(function() {
  clearTimeout(debounce);
  debounce = setTimeout(function() {
    resize_canvas();
  }, 50);
});

$(document).ready(function() {
  // Populate the scenes select list with the available scenes
  populate_select_lists();
  // Set the initial state of debug_mode to false
  $('#debug_checkbox').prop('checked', false);
  debug_mode = false;
  // Ensure the width of the "Resume/Pause" button is consistent
  paused = false;
  let button_width = $('#ResumePause').width();
  $('#ResumePause').text('Pause');
  $('#ResumePause').width(button_width);
  // Initialise the scene
  initialise();
});

function populate_select_lists() {
  for (let count = 0; count < scenes.length; count++) {
    //scene = scenes[count]
    $('#scene_list').append($('<option>', {
      value: scenes[count],
      text: scenes[count][0]
    }));
  }
  $("#scene_list").prop('selectedIndex', 0);
  $("#spatial_partitioning_mode").append($('<option>', {
    value: 0,
    text: 'None'
  }));
  $("#spatial_partitioning_mode").append($('<option>', {
    value: 1,
    text: 'Grid'
  }));
  //$("#spatial_partitioning_mode").append($('<option>', {
  //  value: 2,
  //  text: 'Spatial hash'
  //}));
  $("#spatial_partitioning_mode").prop('selectedIndex', 1);
}

$('#debug_checkbox').change(function() {
  debug_mode = $(this).prop('checked');
  if (paused) {
    draw_world();
  }
});

// Prevent page elements from being inadvertently selected on the Edge browser.

document.getElementById("SketchCanvas").onselectstart = function() { return false; }

// Add event listeners to handle user pointer interactions. Using separate mouse and touch events (rather than unified pointer events) for browser compatibility.

document.getElementById("SketchCanvas").addEventListener("mousedown", function(ev) {
  pointer_x = (ev.pageX - ev.target.offsetLeft) / draw_scaling_factor;
  pointer_y = world_size - (ev.pageY - ev.target.offsetTop) / draw_scaling_factor;
  start_drag();
}, false);

document.getElementById("SketchCanvas").addEventListener("touchstart", function(ev) {
  pointer_x = (ev.touches[0].pageX - ev.touches[0].target.offsetLeft) / draw_scaling_factor;
  pointer_y = world_size - (ev.touches[0].pageY - ev.touches[0].target.offsetTop) / draw_scaling_factor;
  start_drag();
}, false);

document.getElementById("SketchCanvas").addEventListener("mouseup", function(ev) {
  stop_drag()
}, false);

document.getElementById("SketchCanvas").addEventListener("touchend", function(ev) {
  stop_drag()
}, false);

document.getElementById("SketchCanvas").addEventListener("mousemove", function(ev) {
  pointer_x = (ev.pageX - ev.target.offsetLeft) / draw_scaling_factor;
  pointer_y = world_size - (ev.pageY - ev.target.offsetTop) / draw_scaling_factor;
  pointer_move();
}, false);

document.getElementById("SketchCanvas").addEventListener("touchmove", function(ev) {
  ev.preventDefault(); // Stop unintended scrolling on some browsers
  pointer_x = (ev.touches[0].pageX - ev.touches[0].target.offsetLeft) / draw_scaling_factor;
  pointer_y = world_size - (ev.touches[0].pageY - ev.touches[0].target.offsetTop) / draw_scaling_factor;
  pointer_move();
}, false);

document.getElementById("SketchCanvas").addEventListener("mouseleave", function(ev) {
  stop_drag();
}, false);

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
