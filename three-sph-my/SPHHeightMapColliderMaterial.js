  SPHHeightMapColliderMaterial = function(e) {
      THREE.ShaderMaterial.call(this, {
        uniforms: {
          numCells: {
            value: null
          },
          cellSize: {
            value: 0
          },
          heightMap: {
            value: e
          },
          wallExtent: {
            value: null
          }
        },
        vertexShader: ShaderLibrary.get("sph_quad_vertex"),
        fragmentShader: ShaderLibrary.getInclude("distance_functions") + ShaderLibrary.get("sph_heightmap_collider_fragment")
      })
    },
    SPHHeightMapColliderMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype),
