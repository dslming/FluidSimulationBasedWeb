var Signal = function() {
  this._listeners = [],
    this._lookUp = {}
}
Signal.prototype = {
  bind: function(e, t) {
    this._lookUp[e] = this._listeners.length;
    var n = t ? e.bind(t) : e;
    this._listeners.push(n)
  },
  unbind: function(e) {
    var t = this._lookUp[e];
    this._listeners.splice(t, 1),
      delete this._lookUp[e]
  },
  dispatch: function(e) {
    for (var t = this._listeners.length, n = 0; n < t; ++n)
      this._listeners[n](e)
  },
  get hasListeners() {
    return this._listeners.length > 0
  }
}
export { Signal }
