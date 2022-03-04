var Gaussian = {
  estimateGaussianRadius: function(e, t) {
    return Math.sqrt(-2 * e * Math.log(t))
  }
}

export { Gaussian }
