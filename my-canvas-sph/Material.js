//---------------------------------------------------

var Material = function(gasConstant, viscosityMu, restDensity, sigma, pointDamping, bouncyness, restitution) {
  this.mass = 0;
  this.gasConstant = gasConstant;
  this.viscosityMu = viscosityMu;
  this.restDensity = restDensity;
  this.sigma = sigma;
  this.pointDamping = pointDamping;
  this.bouncyness = bouncyness;
  this.restitution = restitution;
};

export { Material }
