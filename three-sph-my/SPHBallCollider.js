import { SPHCollider } from './SPHCollider.js'
import { SPHBallColliderMaterial } from './SPHBallColliderMaterial.js'

function SPHBallCollider() {
  var e = new SPHBallColliderMaterial;
  SPHCollider.call(this, e)
}

SPHBallCollider.prototype = Object.create(SPHCollider.prototype, {
    sphereRadius: {
      get: function() {
        return this._material.sphereRadius
      },
      set: function(e) {
        this._material.sphereRadius !== e && this.invalidate(),
          this._material.sphereRadius = e
      }
    },
    spherePosition: {
      get: function() {
        return this._material.spherePosition
      },
      set: function(e) {
        this._material.spherePosition.equals(e) || this.invalidate(),
          this._material.spherePosition = e
      }
    }
  }),
  SPHBallCollider.prototype._updateMaterial = function() {}


export { SPHBallCollider }
