 BillboardComponent = function(e, t) {
   this._camera = e,
     this._constantSize = t,
     this._v = new THREE.Vector3
 }
 BillboardComponent.prototype = Object.create(Component.prototype, {
   constantSize: {
     get: function() {
       return this._constantSize
     },
     set: function(e) {
       this._constantSize = e
     }
   },
   camera: {
     get: function() {
       return this._camera
     },
     set: function(e) {
       this._camera = e
     }
   }
 })
 BillboardComponent.prototype.onAdded = function() {},
   BillboardComponent.prototype.onRemoved = function() {},
   BillboardComponent.prototype.onUpdate = function(e) {
     this._v.setFromMatrixPosition(this._camera.matrixWorld),
       this.entity.lookAt(this._v),
       this._constantSize && (this._v.copy(this.entity.position),
         this._v.applyMatrix4(this._camera.matrixWorldInverse),
         this.entity.scale.set(-this._v.z, -this._v.z, -this._v.z))
   }
