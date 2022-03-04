SwapMaterials = {
  setAll: function(e, t) {
    for (var n = 0; n < e.children.length; ++n) {
      var i = e.children[n];
      i.material = t,
        SwapMaterials.setAll(i, t)
    }
  },
  swapSelect: function(e, t) {
    for (var n = 0; n < e.children.length; ++n) {
      var i = e.children[n];
      t.hasOwnProperty(i.name) && (i.material = t[i.name]),
        SwapMaterials.swapSelect(i, t)
    }
  },
  swapSelectPartialMatch: function(e, t) {
    for (var n = 0; n < e.children.length; ++n) {
      var i = e.children[n];
      for (var r in t)
        t.hasOwnProperty(r) && i.name.indexOf(r) >= 0 && (i.material = t[r]);
      SwapMaterials.swapSelect(i, t)
    }
  }
}
