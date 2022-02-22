export class Particle {
  constructor(x, y) {
    this.x = x;
    this.px = x;
    this.y = y;
    this.py = y;
    this.xv = 0;
    this.yv = 0
  }
}


export class Cell {
  constructor(x, y, res) {
    //This stores the position to place the cell on the canvas
    this.x = x;
    this.y = y;

    //This is the width and height of the cell
    this.r = res;

    //These are the attributes that will hold the row and column values
    this.col = 0;
    this.row = 0;

    //This stores the cell's velocity
    this.xv = 0;
    this.yv = 0;

    //This is the pressure attribute
    this.pressure = 0;
  }
}
