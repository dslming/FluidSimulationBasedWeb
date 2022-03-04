import { EntityEngine } from './EntityEngine.js'
import { EntityPrototype } from './EntityPrototype.js'

var Entity = {
  ENGINE: new EntityEngine,
  isEntity: function(e) {
    return !!e._components
  },
  convert: function(e) {
    Entity.isEntity(e) || (EntityPrototype._init(e),
      Entity.ENGINE.registerEntity(e))
  },
  destroy: function(e) {
    Entity.ENGINE.destroyEntity(e)
  },
  addComponents: function(e, t) {
    for (var n = 0; n < t.length; ++n)
      Entity.addComponent(e, t[n])
  },
  removeComponents: function(e, t) {
    for (var n = 0; n < t.length; ++n)
      Entity.removeComponent(e, t[n])
  },
  addComponent: function(e, t) {
    if (t._entity)
      throw new Error("Component already added to an entity!");
    Entity.convert(e),
      e._components.push(t),
      e._updateRequiresUpdates(this._requiresUpdates || !!t.onUpdate),
      t._entity = e,
      t.onAdded()
  },
  hasComponent: function(e, t) {
    return e._components && e._components.indexOf(t) >= 0
  },
  removeComponent: function(e, t) {
    if (!Entity.hasComponent(e, t))
      throw new Error("Component wasn't added to this entity!");
    t.onRemoved();
    for (var n = !1, i = e._components.length, r = 0, o = [], a = 0; a < i; ++a) {
      var s = e._components[a];
      s !== t && (o[r++] = s,
        n = n || !!t.onUpdate)
    }
    e._components = 0 === r ? null : o,
      t._entity = null,
      e._updateRequiresUpdates(n)
  }
}
export { Entity }
