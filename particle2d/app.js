import { Particle, Cell } from './index.js'

var mouse = {
  x: 0,
  y: 0,
  px: 0,
  py: 0,
  down: false,
};

var canvas, ctx;
var canvas_width = 500;
var canvas_height = 500;

//Width and height of each cell in the grid.
var resolution = 10;

//Radius around the mouse cursor coordinates to reach when stirring
var pen_size = 40;

var num_cols = canvas_width / resolution;
var num_rows = canvas_height / resolution;

//This determines how many particles will be made.
var speck_count = 5000;

var vec_cells = [];
var particles = [];

export class App {
  /**
   * size canvas 的宽度,
   */
  constructor() {
    this.initCanvas();
    this.initEvent();

    this.initParticle();
    this.initCell();
    this.findCellNeighboring();

    this.run = this.run.bind(this)
  }

  initCanvas() {
    canvas = document.getElementById("main");
    ctx = canvas.getContext("2d");

    //These two set the width and height of the canvas to the defined values.
    canvas.width = canvas_width;
    canvas.height = canvas_height;
  }

  initParticle() {
    for (let i = 0; i < speck_count; i++) {
      const x = Math.random() * canvas_width
      const y = Math.random() * canvas_height
      particles.push(new Particle(x, y));
    }
  }

  initCell() {
    //This loops through the count of columns.
    for (let col = 0; col < num_cols; col++) {
      vec_cells[col] = [];

      for (let row = 0; row < num_rows; row++) {
        var cell_data = new Cell(col * resolution, row * resolution, resolution);
        vec_cells[col][row] = cell_data;
        vec_cells[col][row].col = col;
        vec_cells[col][row].row = row;
      }
    }
  }

  findCellNeighboring() {
    for (let col = 0; col < num_cols; col++) {
      for (let row = 0; row < num_rows; row++) {

        var cell_data = vec_cells[col][row];
        var row_up = row - 1 >= 0 ? row - 1 : num_rows - 1;
        var col_left = col - 1 >= 0 ? col - 1 : num_cols - 1;
        var col_right = col + 1 < num_cols ? col + 1 : 0;

        //Get the reference to the cell on the row above.
        var up = vec_cells[col][row_up];
        var left = vec_cells[col_left][row];
        var up_left = vec_cells[col_left][row_up];
        var up_right = vec_cells[col_right][row_up];

        cell_data.up = up;
        cell_data.left = left;
        cell_data.up_left = up_left;
        cell_data.up_right = up_right;

        // Set the neighboring cell's opposite attributes to point to the current cell.
        up.down = vec_cells[col][row];
        left.right = vec_cells[col][row];
        up_left.down_right = vec_cells[col][row];
        up_right.down_left = vec_cells[col][row];
      }
    }
  }

  initEvent() {
    document.addEventListener(
      "mouseup",
      () => {
        mouse.down = false;
      },
      false
    );
    document.addEventListener(
      "mousedown",
      event => {
        mouse.down = true;
      },
      false
    );

    canvas.addEventListener(
      "mousemove",
      e => {
        mouse.px = mouse.x;
        mouse.py = mouse.y;

        //Sets the new coordinates
        mouse.x = e.offsetX || e.layerX;
        mouse.y = e.offsetY || e.layerY;
      },
      false
    );
  }


  /*
    This function updates the pressure value for an individual cell using the
    pressures of neighboring cells.
    */
  update_pressure(cell_data) {
    //This calculates the collective pressure on the X axis by summing the surrounding velocities
    var pressure_x =
      cell_data.up_left.xv * 0.5 + //Divided in half because it's diagonal
      cell_data.left.xv +
      cell_data.down_left.xv * 0.5 - //Same
      cell_data.up_right.xv * 0.5 - //Same
      cell_data.right.xv -
      cell_data.down_right.xv * 0.5; //Same

    //This does the same for the Y axis.
    var pressure_y = cell_data.up_left.yv * 0.5 + cell_data.up.yv + cell_data.up_right.yv * 0.5 - cell_data.down_left.yv * 0.5 - cell_data.down.yv - cell_data.down_right.yv * 0.5;

    //This sets the cell pressure to one-fourth the sum of both axis pressure.
    cell_data.pressure = (pressure_x + pressure_y) * 0.25;
  }

  /*
    This function changes the cell velocity of an individual cell by first determining whether the cell is
    close enough to the mouse cursor to be affected, and then if it is, by calculating the effect that mouse velocity
    has on the cell's velocity.
    */
  change_cell_velocity(cell_data, mvelX, mvelY, pen_size) {
    //This gets the distance between the cell and the mouse cursor.
    var dx = cell_data.x - mouse.x;
    var dy = cell_data.y - mouse.y;
    var dist = Math.sqrt(dy * dy + dx * dx);

    //If the distance is less than the radius...
    if (dist < pen_size) {
      //If the distance is very small, set it to the pen_size.
      if (dist < 4) {
        dist = pen_size;
      }

      //Calculate the magnitude of the mouse's effect (closer is stronger)
      var power = pen_size / dist;

      //  Apply the velocity to the cell by multiplying the power by the mouse velocity and adding it to the cell velocity
      cell_data.xv += mvelX * power;
      cell_data.yv += mvelY * power;
    }
  }


  update_particle() {
    for (let i = 0; i < particles.length; i++) {
      var p = particles[i];

      if (p.x >= 0 && p.x < canvas_width && p.y >= 0 && p.y < canvas_height) {
        var col = parseInt(p.x / resolution);
        var row = parseInt(p.y / resolution);

        var cell_data = vec_cells[col][row];

        /*
          These values are percentages. They represent the percentage of the distance across
          the cell (for each axis) that the particle is positioned. To give an example, if
          the particle is directly in the center of the cell, these values would both be "0.5"

          The modulus operator (%) is used to get the remainder from dividing the particle's
          coordinates by the resolution value. This number can only be smaller than the
          resolution, so we divide it by the resolution to get the percentage.
          */
        var ax = (p.x % resolution) / resolution;
        var ay = (p.y % resolution) / resolution;

        /*
          These lines subtract the decimal from 1 to reverse it (e.g. 100% - 75% = 25%), multiply
          that value by the cell's velocity, and then by 0.05 to greatly reduce the overall change in velocity
          per frame (this slows down the movement). Then they add that value to the particle's velocity
          in each axis. This is done so that the change in velocity is incrementally made as the
          particle reaches the end of it's path across the cell.
          */
        p.xv += (1 - ax) * cell_data.xv * 0.05;
        p.yv += (1 - ay) * cell_data.yv * 0.05;

        /*
        These next four lines are are pretty much the same, except the neighboring cell's
        velocities are being used to affect the particle's movement. If you were to comment
        them out, the particles would begin grouping at the boundary between cells because
        the neighboring cells wouldn't be able to pull the particle into their boundaries.
        */
        p.xv += ax * cell_data.right.xv * 0.05;
        p.yv += ax * cell_data.right.yv * 0.05;

        p.xv += ay * cell_data.down.xv * 0.05;
        p.yv += ay * cell_data.down.yv * 0.05;

        //This adds the calculated velocity to the position coordinates of the particle.
        p.x += p.xv;
        p.y += p.yv;

        //For each axis, this gets the distance between the old position of the particle and it's new position.
        var dx = p.px - p.x;
        var dy = p.py - p.y;

        //Using the Pythagorean theorum (A^2 + B^2 = C^2), this determines the distance the particle travelled.
        var dist = Math.sqrt(dx * dx + dy * dy);

        //This line generates a random value between 0 and 0.5
        var limit = Math.random() * 0.5;

        //If the distance the particle has travelled this frame is greater than the random value...
        if (dist > limit) {
          ctx.lineWidth = 1;
          ctx.beginPath(); //Begin a new path on the canvas
          ctx.moveTo(p.x, p.y); //Move the drawing cursor to the starting point
          ctx.lineTo(p.px, p.py); //Describe a line from the particle's old coordinates to the new ones
          ctx.stroke(); //Draw the path to the canvas
        } else {
          //If the particle hasn't moved further than the random limit...
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          /*
            Describe a line from the particle's current coordinates to those same coordinates
            plus the random value. This is what creates the shimmering effect while the particles
            aren't moving.
            */
          ctx.lineTo(p.x + limit, p.y + limit);
          ctx.stroke();
        }

        //This updates the previous X and Y coordinates of the particle to the new ones for the next loop.
        p.px = p.x;
        p.py = p.y;
      } else {
        // If the particle's X and Y coordinates are outside the bounds of the canvas...
        // Place the particle at a random location on the canvas
        p.x = p.px = Math.random() * canvas_width;
        p.y = p.py = Math.random() * canvas_height;
        // Set the particles velocity to zero.
        p.xv = 0;
        p.yv = 0;
      }

      // These lines divide the particle's velocity in half everytime it loops, slowing them over time.
      p.xv *= 0.5;
      p.yv *= 0.5;
    }
  }

  /*
  This function updates the velocity value for an individual cell using the
  velocities of neighboring cells.
  */
  update_velocity(cell_data) {
    /*
      This adds one-fourth of the collective pressure from surrounding cells to the
      cell's X axis velocity.
      */
    cell_data.xv +=
      (cell_data.up_left.pressure * 0.5 +
        cell_data.left.pressure +
        cell_data.down_left.pressure * 0.5 -
        cell_data.up_right.pressure * 0.5 -
        cell_data.right.pressure -
        cell_data.down_right.pressure * 0.5) *
      0.25;

    //This does the same for the Y axis.
    cell_data.yv +=
      (cell_data.up_left.pressure * 0.5 +
        cell_data.up.pressure +
        cell_data.up_right.pressure * 0.5 -
        cell_data.down_left.pressure * 0.5 -
        cell_data.down.pressure -
        cell_data.down_right.pressure * 0.5) *
      0.25;

    /*
      This slowly decreases the cell's velocity over time so that the fluid stops
      if it's left alone.
      */
    cell_data.xv *= 0.99;
    cell_data.yv *= 0.99;
  }


  run() {
    var mouse_xv = mouse.x - mouse.px;
    var mouse_yv = mouse.y - mouse.py;

    for (let i = 0; i < vec_cells.length; i++) {
      var cell_datas = vec_cells[i];

      for (let j = 0; j < cell_datas.length; j++) {
        var cell_data = cell_datas[j];
        //If the mouse button is down, updates the cell velocity using the mouse velocity
        if (mouse.down) {
          // this.change_cell_velocity(cell_data, mouse_xv, mouse_yv, pen_size);
        }

        //This updates the pressure values for the cell.
        this.update_pressure(cell_data);
      }
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#00FFFF";
    this.update_particle();

    // for (let i = 0; i < vec_cells.length; i++) {
    //   var cell_datas = vec_cells[i];

    //   for (let j = 0; j < cell_datas.length; j++) {
    //     var cell_data = cell_datas[j];

    //     this.update_velocity(cell_data);
    //   }
    // }

    // This replaces the previous mouse coordinates values with the current ones for the next frame.
    mouse.px = mouse.x;
    mouse.py = mouse.y;
    requestAnimationFrame(this.run);
  }
}
