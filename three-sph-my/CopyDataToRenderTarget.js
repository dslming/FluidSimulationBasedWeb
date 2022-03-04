import { RectRenderer } from './RectRenderer.js'

var CopyDataToRenderTarget = {
  execute: function(e, t, n, i) {
    var r = new RectRenderer(n),
      o = t.texture;
    i = i || o.type;
    var a = new THREE.DataTexture(e, t.width, t.height, o.format, i, null, THREE.CLAMP_TO_EDGE, THREE.CLAMP_TO_EDGE, THREE.NearestFilter, THREE.NearestFilter, 0);
    a.needsUpdate = !0;
    var s = new THREE.ShaderMaterial(THREE.CopyShader);
    s.uniforms.tDiffuse.value = a,
      r.execute(s, t)
  }
};

export { CopyDataToRenderTarget }
