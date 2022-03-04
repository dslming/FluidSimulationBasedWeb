 var EntityEngine = function() {
   this._updateableEntities = [],
     this._updateQueue = [],
     this._destroyQueue = []
 }
 EntityEngine.prototype = {
   registerEntity: function(e) {
     e._onRequireUpdatesChange.bind(this._onEntityUpdateChange, this),
       e._requiresUpdates && this._addUpdatableEntity(e)
   },
   unregisterEntity: function(e) {
     e._onRequireUpdatesChange.unbind(this),
       e._requiresUpdates && this._removeUpdatableEntity(e)
   },
   destroyEntity: function(e) {
     e._onRequireUpdatesChange.unbind(this),
       e._requiresUpdates && this._removeUpdatableEntity(e),
       this._destroyQueue.push(e)
   },
   _onEntityUpdateChange: function(e) {
     e._requiresUpdates ? this._addUpdatableEntity(e) : this._removeUpdatableEntity(e)
   },
   _addUpdatableEntity: function(e) {
     this._updateQueue.push({
       entity: e,
       updatable: !0
     })
   },
   _removeUpdatableEntity: function(e) {
     this._updateQueue.push({
       entity: e,
       updatable: !1
     })
   },
   _processUpdateQueue: function() {
     var e = this._updateQueue.length;
     if (0 !== e) {
       for (var t = 0; t < e; ++t) {
         var n = this._updateQueue[t],
           i = n.entity;
         if (n.updatable)
           this._updateableEntities.push(i);
         else {
           var r = this._updateableEntities.indexOf(i);
           this._updateableEntities.splice(r, 1)
         }
       }
       this._updateQueue = []
     }
   },
   _processDestroyQueue: function() {
     var e = this._destroyQueue.length;
     if (0 !== e) {
       for (var t = 0; t < e; ++t) {
         var n = this._destroyQueue[t];
         delete n._components,
           delete n._requiresUpdates,
           delete n._onRequireUpdatesChange,
           delete n._update,
           delete n._updateRequiresUpdates
       }
       this._destroyQueue = []
     }
   },
   update: function(e) {
     this._processUpdateQueue(),
       this._processDestroyQueue();
     for (var t = this._updateableEntities, n = t.length, i = 0; i < n; ++i)
       t[i]._update(e)
   }
 }

 export { EntityEngine }
