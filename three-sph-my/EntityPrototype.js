import { Signal } from './Signal.js'
var EntityPrototype = {
  _init: function(e) {
    e._components = [],
      e._requiresUpdates = !1,
      e._onRequireUpdatesChange = new Signal,
      e._update = function(e) {
        var t = this._components;
        if (t)
          for (var n = t.length, i = 0; i < n; ++i) {
            var r = t[i];
            r.onUpdate && r.onUpdate(e)
          }
      },
      e._updateRequiresUpdates = function(e) {
        e !== this._requiresUpdates && (this._requiresUpdates = e,
          this._onRequireUpdatesChange.dispatch(this))
      }
  }
}
export { EntityPrototype }
