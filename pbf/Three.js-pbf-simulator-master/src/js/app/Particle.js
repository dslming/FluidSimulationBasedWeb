import * as THREE from 'three';
import * as C from './Constant.js';

export default class Particle {
  constructor(x, y, z, geometry, vShader, fShader, idxI, idxJ, params, lights) {

    // FUNCTIONS BIND
    this.updateVelocity = this.updateVelocity.bind(this);
    this.applyForce = this.applyForce.bind(this);
    this.handleBounds = this.handleBounds.bind(this);
    this.calculateLambda = this.calculateLambda.bind(this);
    this.calculateSurfaceTension = this.calculateSurfaceTension.bind(this);

    this.idxI = idxI;
    this.idxJ = idxJ;
    this.params = params;

    this.position = new THREE.Vector3(x, y, z);
    this.velocity = new THREE.Vector3();

    // Define the shader
    this.uniforms = {
      delta: {
        value: 0.0,
      },
      newPosition: {
        value: this.position,
      },
      velocity: {
        value: this.velocity,
      },
      diffuse: {
        type: 'c',
        value: this.params.threeColor //new THREE.Color(0x47E6FF)
      },
      pointLight: {
        value: lights[0].position,
      },
      ambientLight: {
        value: lights[1].position,
      }
    };

    const shaderMaterial = new THREE.ShaderMaterial({
      uniforms:       this.uniforms,
      vertexShader:   vShader,
      fragmentShader: fShader
    });
    shaderMaterial.transparent = true;

    this.mesh = new THREE.Mesh(geometry, shaderMaterial);

    this.oldPosition = new THREE.Vector3();
    this.neighbors = [];
    this.lambda = 0;
  }

  kernelSpiky(r) {
    let W = -45.0 / ( Math.PI * Math.pow(this.params.H, 6.0));

    const magnitude = r.length();

    if (magnitude >= 0.0 && magnitude <= this.params.H) {
      W = (W * (Math.pow(this.params.H - magnitude, 2.0)))
      return r.normalize().multiplyScalar(W);
    } 
    return new THREE.Vector3();
    
  }

  kernelPoly6(magnitude) {
    const W = 315.0 / (64.0 * Math.PI * Math.pow(this.params.H, 9));

    if (magnitude >= 0.0 && magnitude <= this.params.H) {
      return (W * (Math.pow(Math.pow(this.params.H, 2) - Math.pow(magnitude, 2), 3)));
    } 
    return 0.0;
    
  }

  applyForce(delta, frame) {
    // Save the old position first.
    this.oldPosition = this.position.clone();

    // Apply gravity.
    this.velocity.setY(this.velocity.y + this.params.GRAVITY * delta);

    // Apply wind...
    if (this.params.WIND) {
      // Check the wind direction
      if (this.params.windDirection == 0) {
        this.velocity.setX(this.velocity.x - this.params.windDirection * this.params.windSway * delta);
        this.velocity.setZ(this.velocity.z - this.params.windDirection * this.params.windSway * delta);
      } else {
        // Rotate.
        this.velocity.setX(this.velocity.x - this.params.windDirection * this.params.windSway * Math.cos(frame) * delta);
        this.velocity.setZ(this.velocity.z - this.params.windDirection * this.params.windSway * Math.cos(frame) * delta);
      }

    }


    // Apply future position.
    this.position.setX(this.position.x + this.velocity.x * delta);
    this.position.setY(this.position.y + this.velocity.y * delta);
    this.position.setZ(this.position.z + this.velocity.z * delta);
  }

  handleBounds() {
    this.position.clampScalar(-C.BOUNDS, C.BOUNDS);
  }

  calculateLambda() {
    // Calculate density
    let density = 0.0;
    const r = new THREE.Vector3();
    this.neighbors.forEach((n) => {
      r.subVectors(this.position, n.position);
      density += this.kernelPoly6(r.length());
    });
    let constraint = (density / this.params.REST_DENSITY) - 1;
    constraint = (constraint >= 0) ? constraint : 0;
    // console.log(density, constraint)

    // Calculate gradient
    const densityGradient = new THREE.Vector3();
    this.neighbors.forEach((n) => {
      r.subVectors(this.position, n.position);
      const grad = this.kernelSpiky(r);
      densityGradient.add(grad);
    });

    densityGradient.divideScalar(this.params.REST_DENSITY);

    this.lambda = - constraint / (Math.pow(densityGradient.length(), 2) + C.EPSILON);
  }

  calculateSurfaceTension() {
    const gradient = new THREE.Vector3();
    const r = new THREE.Vector3();
    this.neighbors.forEach((n) => {
      r.subVectors(this.position, n.position);
      const sCorr = - C.K * Math.pow(this.kernelPoly6(r.length()) / this.kernelPoly6(C.DELTA_Q * this.params.H), C.N);
      const lambdaSum = this.lambda + n.lambda + sCorr;

      gradient.add(this.kernelSpiky(r).multiplyScalar(lambdaSum));
    });

    const deltaP = gradient;
    deltaP.divideScalar(this.params.REST_DENSITY);

    // Check for collision
    this.position.add(deltaP);
    this.handleBounds();
  }

  calculateVorticity(delta) {
    const wi = new THREE.Vector3();
    const r = new THREE.Vector3();
    const v = new THREE.Vector3();
    this.neighbors.forEach((n) => {
      r.subVectors(this.position, n.position);
      v.subVectors(n.velocity, this.velocity);

      wi.add(v.cross(this.kernelSpiky(r)));
    });

    const gradWi = new THREE.Vector3();
    const wiLength = wi.length()
    this.neighbors.forEach((n) => {
      r.subVectors(this.position, n.position);

      gradWi.add(this.kernelSpiky(r).multiplyScalar(wiLength));
    });

    this.vorticity = wi.cross(gradWi.normalize()).multiplyScalar(this.params.VORTICITY_E);

    // Update the velocity
    this.velocity.add(this.vorticity.multiplyScalar(delta));
  }

  calculateViscocity() {
    const visco = new THREE.Vector3();
    const r = new THREE.Vector3();
    const v = new THREE.Vector3();
    this.neighbors.forEach((n) => {
      r.subVectors(this.position, n.position);
      v.subVectors(n.velocity, this.velocity);

      visco.add(v.cross(this.kernelSpiky(r)));
    });

    this.viscocity = visco.multiplyScalar(this.params.VISCOCITY_C);

    // Update the velocity
    this.velocity.add(this.viscocity);
  }

  updateVelocity(delta) {
    this.velocity.subVectors(this.position, this.oldPosition);
    this.velocity.divideScalar(delta);
  }
}
