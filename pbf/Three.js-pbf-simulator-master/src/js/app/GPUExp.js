import * as THREE from 'three';
import * as C from './Constant.js';

import GPUComputationRenderer from '../utils/GPUComputationRenderer';

export default class Particle {
  constructor(pList, renderer, gridMap) {
    this.pList = pList;
    this.renderer = renderer;
    this.gridMap = gridMap;

    // FUNCTIONS BIND
    this.update = this.update.bind(this);
    this.initGpuCompute = this.initGpuCompute.bind(this);
    this.fillPositionTexture = this.fillPositionTexture.bind(this);
    this.fillVelocityTexture = this.fillVelocityTexture.bind(this);
    this.fillDensityTexture = this.fillDensityTexture.bind(this);

    this.fillGridTexture = this.fillGridTexture.bind(this);
    this.fillNeighborsTexture = this.fillNeighborsTexture.bind(this);


    this.initGpuCompute();
    /*  Each cell index --> particle index.
        dtPosition --> texture containing the position of each particle.
        dtVelocity --> texture containing the velocity of each particle.
        ---
        dtGrid --> texture containing the grid cell # of each particle.
        dtNeighbors --> texture containing upto four particles, in each cell.
        ---
        dtDensity --> texture containing the density value of each particle
    */
  }

  fillNeighborsTexture( texture ) {
    var theArray = texture.image.data;

    for ( var i = 0; 4*i < theArray.length; i += 1 ) {
      let val = i;

      const z = Math.floor(i / ((2*C.BOUNDS) * (2*C.BOUNDS)));
      val = val % ((2*C.BOUNDS) * (2*C.BOUNDS));
      const y = Math.floor(i / (2*C.BOUNDS));
      val = val % (2*C.BOUNDS);
      const x = val;

      const index = x + "_" + y + "_" + z;
      const particles = this.gridMap.particles[index];
      for (var j = 0; j < 4; j++) {
        if (particles === undefined) {
          theArray[ 4*i + j ] = 0;
        } else {
          const p = this.gridMap.particles[index][j];
          theArray[ 4*i + j ] = (this.pList.indexOf(p)) / 255;
        }
      }
    }
  }

  initGpuCompute() {
    this.gpuCompute = new (new GPUComputationRenderer(THREE))( C.T_WIDTH, C.T_HEIGHT, this.renderer);
    var dtPosition = this.gpuCompute.createTexture();
    var dtVelocity = this.gpuCompute.createTexture();
    var dtGrid = this.gpuCompute.createTexture();
    var dtDensity = this.gpuCompute.createTexture();
    this.fillPositionTexture( dtPosition );
    this.fillVelocityTexture( dtVelocity );
    this.fillGridTexture( dtGrid );
    this.fillDensityTexture( dtDensity );

    // 2*C.BOUNDS x 2*C.BOUNDS x 2*C.BOUNDS  -->  2*C.BOUNDS x 2*2*C.BOUNDS*C.BOUNDS
    var a = new Float32Array( 2*C.BOUNDS * 2*2*C.BOUNDS*C.BOUNDS * 4 );
    var dtNeighbors = new THREE.DataTexture( a, 2*C.BOUNDS, 2*2*C.BOUNDS*C.BOUNDS, THREE.RGBAFormat, THREE.FloatType );
    dtNeighbors.needsUpdate = true;
    this.fillNeighborsTexture( dtNeighbors );

    //this.positionVariable = this.gpuCompute.addVariable( "texturePosition", $( '#position-fs' ).text(), dtPosition );
    this.velocityVariable = this.gpuCompute.addVariable( "textureVelocity", $( '#velocity-fs' ).text(), dtVelocity );
    // this.densityVariable = this.gpuCompute.addVariable( "textureDensity", $( '#density-fs' ).text(), dtDensity );

    // Define dependencies.
    //this.gpuCompute.setVariableDependencies( this.densityVariable, [ this.positionVariable, this.velocityVariable ] );
    //this.gpuCompute.setVariableDependencies( this.positionVariable, [ this.positionVariable, this.velocityVariable, this.densityVariable ] );
    // this.gpuCompute.setVariableDependencies( this.velocityVariable, [ this.positionVariable, this.velocityVariable ] );

    // Define uniforms.
    //this.positionUniforms = this.positionVariable.material.uniforms;
    this.velocityUniforms = this.velocityVariable.material.uniforms;
    //this.densityUniforms = this.densityVariable.material.uniforms;

    // this.positionUniforms.textureGrid = { value: dtGrid }
    // this.positionUniforms.textureNeighbors = { value: dtNeighbors }
    // this.positionUniforms.delta = { value: 0.0 };

    this.velocityUniforms.textureGrid = { value: dtGrid }
    this.velocityUniforms.textureNeighbors = { value: dtNeighbors }
    this.velocityUniforms.delta = { value: 0.0 };

    // this.densityUniforms.textureGrid = { value: dtGrid }
    // this.densityUniforms.textureNeighbors = { value: dtNeighbors }
    // this.densityUniforms.delta = { value: 0.0 };

    var error = this.gpuCompute.init();
    if ( error !== null ) {
      console.error( error );
    }

  }

  fillPositionTexture( texture ) {
    var theArray = texture.image.data;
    const denom = 2 * C.BOUNDS;

    for ( var i = 0; 4*i < theArray.length; i += 1 ) {
      const p = this.pList[i];

      theArray[ 4*i + 0 ] = (p.position.x + C.BOUNDS) / denom;
      theArray[ 4*i + 1 ] = (p.position.y + C.BOUNDS) / denom;
      theArray[ 4*i + 2 ] = (p.position.z + C.BOUNDS) / denom;
      theArray[ 4*i + 3 ] = 1;
    }
  }

  fillVelocityTexture( texture ) {
    var theArray = texture.image.data;

    for ( var i = 0; i < theArray.length; i += 4 ) {
      let val = i / 4;
      if (i === 0) val = 100
      theArray[ i + 0 ] = (val % 255) / 255;
      val = Math.floor(val / 255);
      theArray[ i + 1 ] = (val % 255) / 255;
      val = Math.floor(val / 255);
      theArray[ i + 2 ] = (val % 255) / 255;
      theArray[ i + 3 ] = 0;
    }
  }

  fillGridTexture( texture ) {
    var theArray = texture.image.data;
    const denom = 2 * C.BOUNDS / C.RADIUS;

    for ( var i = 0; 4*i < theArray.length; i += 1 ) {
      const p = this.pList[i];
      const indexes = this.gridMap.getIndex(p);

      theArray[ 4*i + 0 ] = indexes[0] / denom;
      theArray[ 4*i + 1 ] = indexes[1] / denom;
      theArray[ 4*i + 2 ] = indexes[2] / denom;
      theArray[ 4*i + 3 ] = 1;
    }
  }

  fillDensityTexture( texture ) {
    this.fillVelocityTexture( texture );
  }

  update(delta) {
    // this.positionUniforms.delta.value = delta;
    this.velocityUniforms.delta.value = delta;
    // this.densityUniforms.delta.value = delta;

    this.gpuCompute.compute();
    console.log('break')
    //this.uniforms.textureVelocity.value = this.gpuCompute.getCurrentRenderTarget( this.velocityVariable ).texture;
    //this.uniforms.texturePosition.value = this.gpuCompute.getCurrentRenderTarget( this.positionVariable ).texture;
  }
}
