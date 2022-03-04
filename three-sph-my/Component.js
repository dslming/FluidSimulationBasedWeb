 var Component = function() {
   this._entity = null
 }
 Component.prototype = {
   onAdded: function() {},
   onRemoved: function() {},
   onUpdate: null,
   get entity() {
     return this._entity
   }
 }

 export { Component }
