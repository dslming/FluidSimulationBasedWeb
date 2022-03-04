var FloatTex = {
  getHalfOrFloat: function(e) {
    var t = e.extensions;
    if (t.get("OES_texture_half_float_linear"))
      return THREE.HalfFloatType;
    if (t.get("OES_texture_float_linear"))
      return THREE.FloatType;
    throw new Error("Float render targets are unsupported!")
  }
}

var QueryString = function() {
    for (var e = {}, t = window.location.search.substring(1), n = t.split("&"), i = 0; i < n.length; i++) {
      var r = n[i].split("=");
      if ("undefined" == typeof e[r[0]])
        e[r[0]] = decodeURIComponent(r[1]);
      else if ("string" == typeof e[r[0]]) {
        var o = [e[r[0]], decodeURIComponent(r[1])];
        e[r[0]] = o
      } else
        e[r[0]].push(decodeURIComponent(r[1]))
    }
    return e
  }(),
  Random = {
    inRange: function(e, t) {
      return e + Math.floor(Math.random() * (t - e))
    },
    element: function(e) {
      return e[Random.inRange(0, e.length)]
    }
  };
export { FloatTex, QueryString }
