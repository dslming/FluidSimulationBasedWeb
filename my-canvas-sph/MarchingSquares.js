//---------------------------------------------------
import { Array2D, Array1D } from './ArrayTool.js'
import { Vector } from './Vector.js'

var MarchingSquares = function(width, height, ndivsX, ndivsY, threshold, color) {
  this.width = width;
  this.height = height;
  this.ndivsX = ndivsX;
  this.ndivsY = ndivsY;

  this.gridSizeX = this.width / this.ndivsX;
  this.gridSizeY = this.height / this.ndivsY;

  this.threshold = threshold;
  this.color = color;
  this.values = Array2D(this.ndivsX + 1, this.ndivsY + 1);

  this.lutEdges = [
    0x0, // 0000
    0x9, // 1001
    0x3, // 0011
    0xa, // 1010
    0x6, // 0110
    0xf, // 1111
    0x5, // 0101
    0xc, // 1100
    0xc, // 1100
    0x5, // 0101
    0xf, // 1111
    0x6, // 0110
    0xa, // 1010
    0x3, // 0011
    0x9, // 1001
    0x0 // 0000
  ];

  this.lutSegments = [
    [],
    [0, 3],
    [1, 0],
    [1, 3],
    [2, 1],
    [2, 1, 0, 3],
    [2, 0],
    [2, 3],
    [3, 2],
    [0, 2],
    [1, 0, 3, 2],
    [1, 2],
    [3, 1],
    [0, 1],
    [3, 0],
    []
  ];

  this.tempVertices = [new Vector(), new Vector(), new Vector(), new Vector()];
  this.epsilon = 1e-6;
};

MarchingSquares.prototype = {
  interpolate: function(x1, y1, x2, y2, value1, value2, out) {
    if (Math.abs(this.threshold - value1) < this.epsilon) {
      out.set(x1, y1);
    } else if ((Math.abs(this.threshold - value2) < this.epsilon) || (Math.abs(value1 - value2) < this.epsilon)) {
      out.set(x2, y2);
    } else {
      var mu = (this.threshold - value1) / (value2 - value1);
      out.set(x1 + mu * (x2 - x1), y1 + mu * (y2 - y1));
    }
  },

  draw: function(context) {
    context.strokeStyle = this.color;

    for (var y = 0; y < this.ndivsY; y++) {
      for (var x = 0; x < this.ndivsX; x++) {
        // Compute top left position.
        var minX = x * this.gridSizeX;
        var minY = y * this.gridSizeY;
        var maxX = minX + this.gridSizeX;
        var maxY = minY + this.gridSizeY;

        // Get values
        var value0 = this.values[y][x];
        var value1 = this.values[y][x + 1];
        var value2 = this.values[y + 1][x + 1];
        var value3 = this.values[y + 1][x];

        // Compute bitfields.
        var value = 0;
        if (value0 > this.threshold) value |= 1;
        if (value1 > this.threshold) value |= 2;
        if (value2 > this.threshold) value |= 4;
        if (value3 > this.threshold) value |= 8;

        // If the value is different from 0, we can render this
        // cell.
        if (value != 0) {
          var edges = this.lutEdges[value];
          var segments = this.lutSegments[value];

          if (segments.length > 0) {
            // Compute vertex positions.
            if (edges & 1) this.interpolate(minX, minY, maxX, minY, value0, value1, this.tempVertices[0]);
            if (edges & 2) this.interpolate(maxX, minY, maxX, maxY, value1, value2, this.tempVertices[1]);
            if (edges & 4) this.interpolate(maxX, maxY, minX, maxY, value2, value3, this.tempVertices[2]);
            if (edges & 8) this.interpolate(minX, maxY, minX, minY, value3, value0, this.tempVertices[3]);

            // Render segments.
            var v = this.tempVertices[segments[0]];

            context.beginPath();
            context.moveTo(v.v[0], v.v[1]);
            for (var i = 1; i < segments.length; i++) {
              var v = this.tempVertices[segments[i]];
              context.lineTo(v.v[0], v.v[1]);
            }
            context.stroke();
          }
        }
      }
    }
  }
};

//---------------------------------------------------




export { MarchingSquares }
