var CenteredGaussianCurve = function(e) {
  this._amplitude = 1 / Math.sqrt(2 * e * Math.PI),
    this._expScale = -1 / (2 * e)
}
CenteredGaussianCurve.prototype = {
  getValueAt: function(e) {
    return this._amplitude * Math.pow(Math.E, e * e * this._expScale)
  }
}
CenteredGaussianCurve.fromRadius = function(e, t) {
  t = t || .01;
  var n = e / Math.sqrt(-2 * Math.log(t));
  return new CenteredGaussianCurve(n * n)
}
export { CenteredGaussianCurve }
