import { Component } from './Component.js'

var OrbitController = function(e, t, n) {
  Component.call(this),
    this.enabled = !0,
    this._container = e,
    this._coords = new THREE.Vector3(0, .4 * Math.PI, 2),
    this._localAcceleration = new THREE.Vector3(0, 0, 0),
    this._localVelocity = new THREE.Vector3(0, 0, 0),
    this.lookAtTarget = t || new THREE.Vector3(0, 0, 0),
    this.zoomSpeed = 2,
    this.maxRadius = 20,
    this.minRadius = .1,
    this.dampen = .9,
    this.maxAzimuth = void 0,
    this.minAzimuth = void 0,
    this.minPolar = .1,
    this.maxPolar = Math.PI - .1,
    this.moveAcceleration = .02,
    this._m = new THREE.Matrix4,
    this._oldMouseX = 0,
    this._oldMouseY = 0,
    this._moveWithKeys = n,
    this._moveAcceleration = new THREE.Vector3,
    this._moveVelocity = new THREE.Vector3,
    this._isDown = !1,
    this._initListeners()
}
OrbitController.prototype = Object.create(Component.prototype, {
  radius: {
    get: function() {
      return this._coords.z
    },
    set: function(e) {
      this._coords.z = e
    }
  },
  azimuth: {
    get: function() {
      return this._coords.x
    },
    set: function(e) {
      this._coords.x = e
    }
  },
  polar: {
    get: function() {
      return this._coords.y
    },
    set: function(e) {
      this._coords.y = e
    }
  }
})
OrbitController.prototype.onAdded = function() {
  this._isDown = !1;
  var e = /Firefox/i.test(navigator.userAgent) ? "DOMMouseScroll" : "mousewheel";
  this._container.addEventListener(e, this._onMouseWheel),
    this._container.addEventListener("mousemove", this._onMouseMove),
    this._container.addEventListener("touchmove", this._onTouchMove),
    this._container.addEventListener("mousedown", this._onMouseDown),
    this._container.addEventListener("touchstart", this._onTouchDown),
    this._container.addEventListener("mouseup", this._onUp),
    this._container.addEventListener("touchend", this._onUp),
    this._moveWithKeys && (document.addEventListener("keyup", this._onKeyUp),
      document.addEventListener("keydown", this._onKeyDown))
}
OrbitController.prototype.onRemoved = function() {
  var e = /Firefox/i.test(navigator.userAgent) ? "DOMMouseScroll" : "mousewheel";
  this._container.removeEventListener(e, this._onMouseWheel),
    this._container.removeEventListener("mousemove", this._onMouseMove),
    this._container.removeEventListener("touchmove", this._onTouchMove),
    this._container.removeEventListener("mousedown", this._onMouseDown),
    this._container.removeEventListener("touchstart", this._onTouchDown),
    this._container.removeEventListener("mouseup", this._onUp),
    this._container.removeEventListener("touchend", this._onUp),
    this._moveWithKeys && (document.removeEventListener("keyup", this._onKeyUp),
      document.removeEventListener("keydown", this._onKeyDown))
}
OrbitController.prototype.onUpdate = function(e) {
  if (this.enabled) {
    if (this._moveWithKeys) {
      this._moveVelocity.x *= this.dampen,
        this._moveVelocity.y *= this.dampen,
        this._moveVelocity.z *= this.dampen,
        this._moveVelocity.x += this._moveAcceleration.x,
        this._moveVelocity.y += this._moveAcceleration.y,
        this._moveVelocity.z += this._moveAcceleration.z;
      var t = new THREE.Vector3;
      t.copy(this._moveVelocity),
        t.applyQuaternion(this.entity.quaternion.setFromRotationMatrix(this.entity.matrixWorld)),
        this.lookAtTarget.x += t.x,
        this.lookAtTarget.y += this._moveVelocity.y,
        this.lookAtTarget.z += t.z
    }
    this._localVelocity.x *= this.dampen,
      this._localVelocity.y *= this.dampen,
      this._localVelocity.z *= this.dampen,
      this._localVelocity.x += this._localAcceleration.x,
      this._localVelocity.y += this._localAcceleration.y,
      this._localVelocity.z += this._localAcceleration.z,
      this._localAcceleration.x = 0,
      this._localAcceleration.y = 0,
      this._localAcceleration.z = 0,
      this._coords.add(this._localVelocity),
      this._coords.y = THREE.Math.clamp(this._coords.y, this.minPolar, this.maxPolar),
      this._coords.z = THREE.Math.clamp(this._coords.z, this.minRadius, this.maxRadius),
      void 0 !== this.maxAzimuth && void 0 !== this.minAzimuth && (this._coords.x = THREE.Math.clamp(this._coords.x, this.minAzimuth, this.maxAzimuth));
    var n = this.entity,
      i = this._m,
      r = this._fromSphericalCoordinates(this._coords.z, this._coords.x, this._coords.y);
    r.add(this.lookAtTarget),
      i.lookAt(r, this.lookAtTarget, new THREE.Vector3(0, 1, 0)),
      i.setPosition(r),
      i.decompose(n.position, n.quaternion, n.scale)
  }
}
OrbitController.prototype._fromSphericalCoordinates = function(e, t, n) {
  var i = new THREE.Vector3;
  return i.x = e * Math.sin(n) * Math.cos(t),
    i.y = e * Math.cos(n),
    i.z = e * Math.sin(n) * Math.sin(t),
    i
}
OrbitController.prototype.setAzimuthImpulse = function(e) {
  this._localAcceleration.x = e
}
OrbitController.prototype.setPolarImpulse = function(e) {
  this._localAcceleration.y = e
}
OrbitController.prototype.setZoomImpulse = function(e) {
  this._localAcceleration.z = e
}
OrbitController.prototype._updateMove = function(e, t) {
  if (void 0 !== this._oldMouseX) {
    var n = e - this._oldMouseX,
      i = t - this._oldMouseY;
    this.setAzimuthImpulse(.0015 * n),
      this.setPolarImpulse(.0015 * -i)
  }
  this._oldMouseX = e,
    this._oldMouseY = t
}
OrbitController.prototype._initListeners = function() {
  var e = this;
  this._onMouseWheel = function(t) {
      var n = t.detail ? -120 * t.detail : t.wheelDelta;
      e.setZoomImpulse(-n * e.zoomSpeed * 1e-4)
    },
    this._onMouseDown = function(t) {
      e._oldMouseX = void 0,
        e._oldMouseY = void 0,
        e._isDown = !0
    },
    this._onMouseMove = function(t) {
      e._isDown && e._updateMove(t.screenX, t.screenY)
    },
    this._onTouchDown = function(t) {
      if (e._oldMouseX = void 0,
        e._oldMouseY = void 0,
        2 === t.touches.length) {
        var n = t.touches[0],
          i = t.touches[1],
          r = n.screenX - i.screenX,
          o = n.screenY - i.screenY;
        e._startPitchDistance = Math.sqrt(r * r + o * o),
          e._startZoom = e.radius
      }
      e._isDown = !0
    },
    this._onTouchMove = function(t) {
      if (t.preventDefault(),
        e._isDown) {
        var n = t.touches.length;
        if (1 === n) {
          var i = t.touches[0];
          e._updateMove(i.screenX, i.screenY)
        } else if (2 === n) {
          var r = t.touches[0],
            o = t.touches[1],
            a = r.screenX - o.screenX,
            s = r.screenY - o.screenY,
            l = Math.sqrt(a * a + s * s),
            c = e._startPitchDistance - l;
          e.radius = e._startZoom + .2 * c
        }
      }
    },
    this._onUp = function(t) {
      e._isDown = !1
    },
    this._onKeyUp = function(t) {
      switch (t.keyCode) {
        case 69:
        case 81:
          e._moveAcceleration.y = 0;
          break;
        case 37:
        case 65:
        case 39:
        case 68:
          e._moveAcceleration.x = 0;
          break;
        case 38:
        case 87:
        case 40:
        case 83:
          e._moveAcceleration.z = 0
      }
    },
    this._onKeyDown = function(t) {
      switch (t.keyCode) {
        case 81:
          e._moveAcceleration.y = -e.moveAcceleration;
          break;
        case 69:
          e._moveAcceleration.y = e.moveAcceleration;
          break;
        case 37:
        case 65:
          e._moveAcceleration.x = -e.moveAcceleration;
          break;
        case 38:
        case 87:
          e._moveAcceleration.z = -e.moveAcceleration;
          break;
        case 39:
        case 68:
          e._moveAcceleration.x = e.moveAcceleration;
          break;
        case 40:
        case 83:
          e._moveAcceleration.z = e.moveAcceleration
      }
    }
}

export { OrbitController }
