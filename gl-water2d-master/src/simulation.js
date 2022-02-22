/*
 Require dependencies
 */
var vec3 = require('gl-vec3');
var vec2 = require('gl-vec2');
var consts = require("./consts.js");
var clamp = require('clamp');

var SpatialHash = require("./spatial_hash.js");
var createRenderer = require("./renderer.js");
var toPixel = require("./renderer.js").toPixel;
var createLevelData = require("./level_data.js");

var createCapsule = require("./data_types.js").Capsule;
var capsuleImplicit = require("./data_types.js").capsuleImplicit;

var createEmitter = require("./data_types.js").Emitter;
var emitterImplicit =  require("./data_types.js").emitterImplicit;

var consts =  require("./consts.js");

var particleRadius = consts.particleRadius;

var WORLD_MIN = consts.WORLD_MIN;
var WORLD_MAX = consts.WORLD_MAX;

var SCALED_WORLD_MIN = consts.SCALED_WORLD_MIN;
var SCALED_WORLD_MAX = consts.SCALED_WORLD_MAX;

var WORLD_SCALE = consts.WORLD_SCALE;

var h = consts.h;

function Particle(position, velocity, color) {

    this.position = vec2.fromValues(position[0] * WORLD_SCALE, position[1] * WORLD_SCALE);
    this.velocity = vec2.fromValues(velocity[0] * WORLD_SCALE, velocity[1] * WORLD_SCALE);

    this.color = color;
    this.radius = particleRadius;

    this.o = [this.position[0], this.position[1]];
    this.f = [0.0, 0.0];
    this.isNew = true;
}

/*
 Constructor
 */
function Simulation(gl) {


    this.particles = [];

    this.renderer = new createRenderer(gl);

    this.levelData = new createLevelData();

    // used when we are adding a new capsule in the GUI.
    this.newCapsule = null;


    this.hash = new SpatialHash(h, SCALED_WORLD_MIN, SCALED_WORLD_MAX);

    this.isLimitParticles = {val: true};
    this.maxParticles = {val: 1500};
}


function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

Simulation.prototype.getParticleCount = function () {
    return this.particles.length;
}

Simulation.prototype.reset = function () {
    this.particles = [];
}

Simulation.prototype.export = function() {
    return JSON.stringify( this.levelData );
}


// return false if the import failed. True otherwise. 
Simulation.prototype.import = function(json) {
    
    var obj = null;

    try {
        obj = JSON.parse( json );

        
    }
    catch(err) {
        console.log(err.message);
        return false;
    }
    
    this.levelData = obj;
    return true;
}


Simulation.prototype.update = function (canvasWidth, canvasHeight, mousePos, delta, isRunningSimulation) {

    if (this.newCapsule != null) {
        // when adding a new capsule, make p1 of the capsule follow the mouse.
        this.newCapsule.p1 = this.mapMousePos(mousePos);
    }
    
    

    this.renderer.update(canvasWidth, canvasHeight);
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    
    if(!isRunningSimulation) {
        // if not running simulation, do nothing beyond this point.
        return;
    }

    /*
    Below, we implement the water simulation. It is based on the paper
    "Particle-based Viscoelastic Fluid Simulation"
     http://www.ligum.umontreal.ca/Clavet-2005-PVFS/pvfs.pdf
     */

    this.nearParticlesCache = [];

    this.emitParticles(delta);
    this.removeOutOfBoundsParticles();

    this.hash.update(this.particles);

    for (var i = 0; i < this.particles.length; ++i) {
        var iParticle = this.particles[i];

        // apply the forces resulting from the pressure.
        vec2.add(iParticle.position, iParticle.position, iParticle.f);

        iParticle.f = [0.0, 0.0];
        iParticle.nearDensity = 0.0;
        iParticle.density = 0.0;

        if (!iParticle.isNew) {
            /*
            To compute the position, we use the prediction-relaxation scheme described in the paper:
             */
            vec2.subtract(iParticle.velocity, iParticle.position, iParticle.o);
            //vec2.scale(iParticle.velocity, iParticle.velocity, 1.0 / 1.0);
        }

        iParticle.isNew = false;

        // apply gravity.
        iParticle.velocity[1] += this.levelData.gravity.val * 1.0;

        // do viscosity impules to modify velocity(algorithm 5 from the paper)
        this.doViscosityImpules(i, 1.0);
    }

    for (var i = 0; i < this.particles.length; ++i) {

        var iParticle = this.particles[i];

        // save the original particle position, then apply velocity.
        iParticle.o = [iParticle.position[0], iParticle.position[1]];
        vec2.add(iParticle.position, iParticle.position, iParticle.velocity);

        // compute near and far density from the paper.
        this.computeDensities(i);

        // handle collision with capsules.
        this.handleCollision(iParticle);

    }

    // below we do double density relaxation(algorithm 2 in the paper)
    this.doubleDensityRelaxation(1.0);
}

Simulation.prototype.doViscosityImpules = function(i, delta) {


    var iParticle  = this.particles[i];
    // do viscosity impules(algorithm 5 from the paper)
    //but note that we are not doing the exact same thing they are doing in the paper,
    // but a slight variation.

    var nearParticles = this.hash.getNearParticles(iParticle);
    this.nearParticlesCache[i] = nearParticles;

    for (var j = 0; j < nearParticles.length; ++j) {
        var jParticle = nearParticles[j];

        var dp = [0.0, 0.0];
        vec2.subtract(dp, iParticle.position, jParticle.position);

        var r2 = vec2.dot(dp, dp);

        if (r2 <= 0.0 || r2 > h * h)
            continue;

        var r = Math.sqrt(r2);

        var normalized_r = [0.0, 0.0];
        vec2.scale(normalized_r, dp, 1.0 / r);

        var one_minus_q = 1 - r / h;

        var vi_minus_vj = [0.0, 0.0];
        vec2.subtract(vi_minus_vj, iParticle.velocity, jParticle.velocity);

        var u = vec2.dot(vi_minus_vj, normalized_r);

        var sigma = this.levelData.sigma.val;
        var beta = this.levelData.beta.val;

        var T = 0;
        if (u > 0) {
            T = delta * one_minus_q * (sigma * u + beta * u * u) * 0.5;
            if (T < u) {
                T = T;
            } else {
                T = u;
            }
        } else {
            T = delta * one_minus_q * (sigma * u - beta * u * u) * 0.5;
            if (T > u) {
                T = T;
            } else {
                T = u;
            }
        }

        var I_div2 = [0.0, 0.0];
        vec2.scale(I_div2, normalized_r, T);

        vec2.scaleAndAdd(iParticle.velocity, iParticle.velocity, I_div2, -1.0);
        vec2.scaleAndAdd(jParticle.velocity, jParticle.velocity, I_div2, +1.0);

    }
}


Simulation.prototype.computeDensities = function(i) {

    var nearParticles = this.nearParticlesCache[i];
    var iParticle = this.particles[i];

    for (var j = 0; j < nearParticles.length; ++j) {

        var jParticle = nearParticles[j];

        var dp = [0.0, 0.0];

        vec2.subtract(dp, iParticle.position, jParticle.position);

        var r2 = vec2.dot(dp, dp);

        if (r2 <= 0.0 || r2 > h * h)
            continue;

        var r = Math.sqrt(r2);
        var a = 1 - r / h;

        var aa = a * a;
        var aaa = aa * a;

        iParticle.density += aa;
        jParticle.density += aa;

        iParticle.nearDensity += aaa;
        jParticle.nearDensity += aaa;
    }
}

Simulation.prototype.removeOutOfBoundsParticles = function() {
    for (var i = 0; i < this.particles.length; ++i) {
        var iParticle = this.particles[i];
        var p = iParticle.position;
        if (p[0] < SCALED_WORLD_MIN[0] || p[1] < SCALED_WORLD_MIN[1] ||
            p[0] > SCALED_WORLD_MAX[0] || p[1] > SCALED_WORLD_MAX[1]) {
            this.particles.splice(i, 1);
            --i;
        }
    }
}

Simulation.prototype.emitParticles = function(delta) {

    for (var i = 0; i < this.levelData.emitters.length; ++i) {
        var emitter = this.levelData.emitters[i];

        emitter.timer += delta;

        var period =  (1.0 / emitter.frequency.val);
        if (emitter.timer > period &&
            (!this.isLimitParticles.val || (this.particles.length < this.maxParticles.val))) {

            var c = [emitter.color[0], emitter.color[1], emitter.color[2]];

            if (emitter.angleVelocity.val == 0) {
                // if not angle velocity, just use base angle
                emitter.angle.val = emitter.baseAngle.val;
            } else {
                // if we have angle velocity, ignore base angle, and increase velocity.
                emitter.angle.val += emitter.angleVelocity.val;
            }


            var theta = emitter.angle.val * (Math.PI / 180.0); // from degrees to radians.
            theta = Math.PI * 2 - theta; // make sure that angles goes counter clock-wise

            emitter.angle.val += emitter.angleVelocity.val;

            const strength = emitter.strength.val *0.001;
            const velocity = [strength * Math.cos(theta), strength * Math.sin(theta)];

            // find vector that is perpendicular to velocity.
            const v = [-velocity[1], velocity[0]];

            var c = [emitter.color[0], emitter.color[1], emitter.color[2]];

            var a = emitter.velRand.val * 0.0001;

            for (var j = -1; j <= 1; ++j) {
                var p = [0.0, 0.0];

                vec2.scaleAndAdd(p, emitter.position, v, 0.8 * (j));

                this.particles.push(new Particle(
                    p, [velocity[0] + getRandomArbitrary(-a, a), velocity[1] + getRandomArbitrary(-a, a)],

                    c
                ));
            }

            emitter.timer = 0.0;
        }
    }
}


Simulation.prototype.handleCollision = function(iParticle) {

    // for iParticle, handle collision with all the capsules.
    // to do the collision checking, we are representing the capsules as implicit functions.
    // we are using the formulas derived in section 4.4.2.2 of the paper
    // "Lagrangian Fluid Dynamics Using Smoothed Particle Hydrodynamics"
    // http://image.diku.dk/projects/media/kelager.06.pdf#page=33

    for (var iBody = 0; iBody < this.levelData.collisionBodies.length; ++iBody) {

        var body = this.levelData.collisionBodies[iBody];

        var x = iParticle.position;
        var scratch = vec2.create();

        if (true) {
            var p0 = body.p0;
            var p1 = body.p1;
            var r = body.radius;

            var p1_sub_p0 = [0.0, 0.0];
            vec2.subtract(p1_sub_p0, p1, p0);

            var t = -vec2.dot(vec2.subtract(scratch, p0, x), p1_sub_p0) / vec2.dot(p1_sub_p0, p1_sub_p0);
            t = clamp(t, 0.0, 1.0);

            var q = [0.0, 0.0];
            vec2.scaleAndAdd(q, p0, p1_sub_p0, t);

            var Fx = vec2.length(vec2.subtract(scratch, q, x)) - r;

            // check if collision
            if (Fx <= 0) {

                var x_sub_q = [0.0, 0.0];
                vec2.subtract(x_sub_q, x, q);
                var x_sub_q_len = vec2.length(x_sub_q);

                // compute normal.
                var n = [0.0, 0.0];
                vec2.scale(n, x_sub_q, -Math.sign(Fx) / ( x_sub_q_len  ))

                // bounce particle in the direction of the normal.
                vec2.scaleAndAdd(iParticle.position, iParticle.position, n, -Fx * this.levelData.collisionDamping.val);
            }
        }
    }
}


Simulation.prototype.doubleDensityRelaxation = function (delta) {

    for (var i = 0; i < this.particles.length; ++i) {

        var iParticle = this.particles[i];

        var pressure = this.levelData.stiffness.val * (iParticle.density - this.levelData.restDensity.val);
        var nearPressure = this.levelData.nearStiffness.val * iParticle.nearDensity;


        var nearParticles = this.nearParticlesCache[i];

        for (var j = 0; j < nearParticles.length; ++j) {
            var jParticle = nearParticles[j];

            var dp = [0.0, 0.0];
            vec2.subtract(dp, iParticle.position, jParticle.position);
            var r2 = vec2.dot(dp, dp);

            if (r2 <= 0.0 || r2 > h * h)
                continue;

            var r = Math.sqrt(r2);
            var a = 1 - r / h;

            var D = delta*delta*( pressure * a + nearPressure * a * a ) * 0.5;
            var DA = [0.0, 0.0];
            vec2.scale(DA, dp, D / r);
            vec2.scaleAndAdd(iParticle.f, iParticle.f, DA, 1.0);
            vec2.scaleAndAdd(jParticle.f, jParticle.f, DA, -1.0);
        }
    }

}

Simulation.prototype.draw = function (gl, editEmitter, isRecording) {
    this.renderer.draw(gl, this.levelData.collisionBodies, this.particles, this.newCapsule, this.levelData.emitters,
        editEmitter, isRecording);
}

Simulation.prototype.mapMousePos = function (mousePos) {

    // below we map the mouse pos(in pixel coordinates) to the coordinate system of the water simultation
    return [
        WORLD_SCALE * (mousePos[0] - ( this.canvasWidth - this.canvasHeight ) * 0.5 - 0.5 * this.canvasHeight) * (  2.0 / this.canvasHeight ),
        (-1 + 2 * (  mousePos[1] / this.canvasHeight )) * WORLD_SCALE,

    ];
}

// return the minimum pixel position of the simulation.
Simulation.prototype.getMinPos = function () {
    var x = ((WORLD_MIN[0] + 1) / 2.0) * this.canvasHeight + (this.canvasWidth - this.canvasHeight) / 2.0;
    var y = this.canvasHeight - (((WORLD_MAX[1] + 1) / 2.0) * this.canvasHeight);
    return [x, y];
}

// return the minimum pixel position of the simulation.
Simulation.prototype.getMaxPos = function () {
    var x = ((WORLD_MAX[0] + 1) / 2.0) * this.canvasHeight + (this.canvasWidth - this.canvasHeight) / 2.0;
    var y = this.canvasHeight - (((WORLD_MIN[1] + 1) / 2.0) * this.canvasHeight);
    return [x, y];
}

// in the first call of addCapsule, set p0 of capsule
// in the second call, set p1
Simulation.prototype.addCapsule = function (mousePos, capsuleRadius) {
    const CAPSULE_COLOR = this.levelData.capsuleColor;


    if (this.newCapsule != null) {
        // add the capsule.
        this.levelData.collisionBodies.push(this.newCapsule);
        this.newCapsule = null;
    } else {
        // make new capsule.
        var mMousePos = this.mapMousePos(mousePos);
        this.newCapsule = new createCapsule([mMousePos[0] / WORLD_SCALE, mMousePos[1] / WORLD_SCALE], [0.0, 0.0], capsuleRadius, CAPSULE_COLOR);

        this.newCapsule.p1 = this.mapMousePos(mousePos);
    }

}

Simulation.prototype.addEmitter = function (mousePos) {
    var mMousePos = this.mapMousePos(mousePos);
    var newEmitter = new createEmitter([mMousePos[0] / WORLD_SCALE, mMousePos[1] / WORLD_SCALE]);
    this.levelData.emitters.push(newEmitter);
    return newEmitter
}

// return index of emitter under the cursor.
Simulation.prototype.findEmitter = function (mousePos) {

    var mMousePos = this.mapMousePos(mousePos);

    for (var i = 0; i < this.levelData.emitters.length; ++i) {
        var emitter = this.levelData.emitters[i];
        var Fx = emitterImplicit(emitter, [mMousePos[0] / WORLD_SCALE, mMousePos[1] / WORLD_SCALE]);
        if (Fx <= 0) {
            return i;
        }
    }

    return -1;
}


Simulation.prototype.remove = function (mousePos) {
    // first try and remove emitters.
    var i = this.findEmitter(mousePos);
    if (i != -1) {
        this.levelData.emitters.splice(i, 1);
        return;
    }

    // second, try and remove capsules.
    var mMousePos = this.mapMousePos(mousePos);
    for (var iBody = 0; iBody < this.levelData.collisionBodies.length; ++iBody) {

        var body = this.levelData.collisionBodies[iBody];

        var Fx = capsuleImplicit(body, mMousePos);

        if (Fx <= 0) {
            this.levelData.collisionBodies.splice(iBody, 1);
            return;
        }
    }
}

Simulation.prototype.selectEmitter = function (mousePos) {
    var i = this.findEmitter(mousePos);
    if (i != -1) {
        return this.levelData.emitters[i]
    } else {
        return null;
    }
}

Simulation.prototype.cancelAddCapsule = function () {
    this.newCapsule = null;
}

Simulation.prototype.getLevelData = function() {
    return this.levelData;
}

module.exports = Simulation;
