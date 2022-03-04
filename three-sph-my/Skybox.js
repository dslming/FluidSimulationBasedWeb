import { SkyMaterial } from './SkyMaterial.js'

function Skybox(e, t) {
  t = t || 1e3;
  var n = new THREE.BoxGeometry(t, t, t);
  n.scale(-1, 1, 1);
  var i = new SkyMaterial({
    envMap: e
  });
  THREE.Mesh.call(this, n, i)
}
Skybox.prototype = Object.create(THREE.Mesh.prototype, {
  texture: {
    get: function() {
      return this.material.envMap
    },
    set: function(e) {
      this.material.envMap = e
    }
  }
})
export { Skybox }
