PoissonDisk = function(e, t, n, i) {
    this._mode = void 0 === e ? PoissonDisk.CIRCULAR : e,
      this._initialDistance = t || 1,
      this._decayFactor = n || .99,
      this._maxTests = i || 2e4,
      this._currentDistance = 0,
      this._points = null,
      this.reset()
  },
  PoissonDisk.SQUARE = 0,
  PoissonDisk.CIRCULAR = 1,
  PoissonDisk.prototype = {
    getPoints: function() {
      return this._points
    },
    reset: function() {
      this._currentDistance = this._initialDistance,
        this._points = []
    },
    generatePoints: function(e) {
      for (var t = 0; t < e; ++t)
        this.generatePoint()
    },
    generatePoint: function() {
      for (;;) {
        for (var e = 0, t = this._currentDistance * this._currentDistance; e++ < this._maxTests;) {
          var n = this._getCandidate();
          if (this._isValid(n, t))
            return void this._points.push(n)
        }
        this._currentDistance *= this._decayFactor
      }
    },
    _getCandidate: function() {
      for (;;) {
        var e = 2 * Math.random() - 1,
          t = 2 * Math.random() - 1;
        if (this._mode == PoissonDisk.SQUARE || e * e + t * t <= 1)
          return new THREE.Vector2(e, t)
      }
    },
    _isValid: function(e, t) {
      for (var n = this._points.length, i = 0; i < n; ++i) {
        var r = this._points[i],
          o = e.x - r.x,
          a = e.y - r.y;
        if (o * o + a * a < t)
          return !1
      }
      return !0
    }
  },
