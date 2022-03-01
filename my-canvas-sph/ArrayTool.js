//---------------------------------------------------

export function  Array1D(w) {
  var output = new Array();
  output.length = w;

  return output;
}

export function Array2D(w, h) {
  var outer = new Array();
  outer.length = h;

  for (var y = 0; y < h; y++) {
    var inner = new Array();
    inner.length = w;

    for (var x = 0; x < w; x++)
      inner[x] = 0;

    outer[y] = inner;
  }

  return outer;
};

