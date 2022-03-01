export function HsvColor(h, s, v) {
  var s = s / 100;
  var v = v / 100;

  var hi = Math.floor((h / 60) % 6);
  var f = (h / 60) - hi;
  var p = v * (1 - s);
  var q = v * (1 - f * s);
  var t = v * (1 - (1 - f) * s);

  var r, g, b;

  switch (hi) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    case 5:
      r = v;
      g = p;
      b = q;
      break;
  }

  r = Math.min(255, Math.round(r * 256));
  g = Math.min(255, Math.round(g * 256));
  b = Math.min(255, Math.round(b * 256));


  return "rgb(" + r + ", " + g + "," + b + ")";
}
