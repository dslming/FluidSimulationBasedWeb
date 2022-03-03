const simulateAll = document.getElementById('simulateAll');
const stepper = document.getElementById('stepper');
const timeDisplay = document.getElementById('timeDisplay');
const canvas = document.getElementById('display');
const ctx = canvas.getContext('2d');

const particles = [];
let grid = [];
let gridOffsets = [];
let horizontalCells = 0;

let iteration = 0;

/* Simulation Constants */
const timestep = 1/60;
const solverIterations = 3;
const restDensity = 6000;
const particleMass = 1;
const kernelRadius = 0.1;
const epsilon = 300;

const numParticles = 400;
const small = 0.00001;

/* Physical constraints and constants */
const gravity = vec2.fromValues(0, 1);

/* For now, just initializes particles in random locations in the top 1/4 of the screen
 * to create a dam-break scenario */
const initializeParticles = () => {
    for(let i = 0; i < numParticles; i++){
        particles.push({
            id: i,
            pos: vec2.fromValues(Math.random(), Math.random() / 2 ),
            vel: vec2.fromValues(0, 0),
            newPos: vec2.fromValues(0, 0),
            deltaP: vec2.fromValues(0, 0),
            neighbours: [],
            lambda: 0,
            density: 0,
        });
    }
}

/* Uses counting sort to create a hashing grid for the particles */
const createSpatialHashingGrid = () => {
    horizontalCells = Math.ceil(1 / (kernelRadius));
    
    let gridSums = new Array((horizontalCells) * (horizontalCells)).fill(0);
    grid = new Array(horizontalCells * horizontalCells).fill(0);
    gridOffsets = new Array((horizontalCells) * (horizontalCells)).fill(0);
    
    for(let i = 0; i < numParticles; i++){
        const x = Math.max(Math.min(Math.floor( particles[i].pos[0] / kernelRadius), horizontalCells - 1 ), 0);
        const y = Math.max(Math.min(Math.floor( particles[i].pos[1] / kernelRadius), horizontalCells - 1 ), 0);
        const bin = x + horizontalCells * y;

        gridSums[bin]++;
    }


    for(let i = 1; i < gridSums.length; i++){
        gridOffsets[i] = gridOffsets[i-1] + gridSums[i-1];
    }
    //console.log(gridOffsets);
    //console.log(gridSums);
    //console.log(gridOffsets);

    let ct = 0;
    for(let i = 0; i < numParticles; i++){
        const x = Math.max(Math.min(Math.floor( particles[i].pos[0] / kernelRadius), horizontalCells - 1 ), 0);
        const y = Math.max(Math.min(Math.floor( particles[i].pos[1] / kernelRadius), horizontalCells - 1 ), 0);
        const bin = x + horizontalCells * y;

        gridSums[bin]--;
        console.assert(isFinite((gridSums[bin]) + gridOffsets[bin]), 'asdf');
        
        grid[ (gridSums[bin]) + gridOffsets[bin] ] = particles[i];
        ct++;
    }
}

/* Applies the poly6 kernel*/
const poly6 = (p1, p2) => {
    const r = vec2.create();
    vec2.sub(r, p1, p2);

    const result = 315.0 / (64.0 * Math.PI * Math.pow(kernelRadius, 9)) * Math.pow( kernelRadius * kernelRadius - vec2.len(r) * vec2.len(r), 3);
    return result;
}

/* Returns the gradient of the spiky kernel */
const spiky = (p1, p2) => {
    const r = vec2.create();
    vec2.sub(r, p1, p2);

    if( vec2.len(r) > kernelRadius || vec2.len(r) === 0){
        return vec2.fromValues(0, 0);
    }

    const result = -45.0 / (Math.PI * Math.pow(kernelRadius, 6)) * Math.pow( kernelRadius * kernelRadius - vec2.len(r) * vec2.len(r), 2) * 1 / vec2.len(r);
    
    vec2.scale(r, r, result);
    console.assert(isFinite(result), "spiky not finite");
    return r;
}

/* Initializes the temporary positions of the particles.*/
const predictPositions = () => {
    particles.forEach((p1) => {
        vec2.scaleAndAdd(p1.vel, p1.vel, gravity, timestep);
        vec2.scaleAndAdd(p1.newPos, p1.pos, p1.vel, timestep);
    });
}

/* Uses the hash grid to crate a list of the neighbours for
 * each particle */
const updateNeighbours = () => {
    particles.forEach((p1) => {
        const neighbours = [];
        const x = Math.max(Math.min(Math.floor( p1.pos[0] / kernelRadius), horizontalCells - 1 ), 0);
        const y = Math.max(Math.min(Math.floor( p1.pos[1] / kernelRadius), horizontalCells - 1 ), 0);

        const kernelRadius2 = kernelRadius * kernelRadius;

        const masks = [[0, 0], /* Same grid */
                      [1, 1], /* Top left */
                      [0, 1], /* Top */
                      [-1, 1], /* Top Right */
                      [-1, 0], /* Right */
                      [-1, -1], /* Bottom Right*/
                      [0, -1], /* Bottom */
                      [1, -1], /* Bottom Left */
                      [1, 0]]; /* Left */
        
        //console.log('----');
        for( let i = 0; i < masks.length; i++ ){
            const mask = masks[i];
            const newX = mask[0] + x;
            const newY = mask[1] + y;

            if( newX >= 0 && newY >= 0 && newX < horizontalCells && newY < horizontalCells){
                const bin = newX + newY * horizontalCells;
                const limit = bin < gridOffsets.length - 1? gridOffsets[bin + 1] : numParticles;
                //console.log('gob', gridOffsets[bin]);
                //console.log('lim', limit);
                for( let q = gridOffsets[bin]; q < limit ; q++){
                    const p2 = grid[q];
                    const diff = vec2.create();
                    vec2.sub(diff, p1.pos, p2.pos);
                    const r2 = vec2.sqrLen( diff );
                    if( r2 < kernelRadius2 ){
                        neighbours.push(p2);
                    }
                }
            }
        }

        /*const neighbours2 = [];

        neighbours.sort((a, b) => a.id - b.id);

        particles.forEach( p2 => {
            const diff = vec2.create();
            vec2.sub(diff, p1.pos, p2.pos);
            const r2 = vec2.sqrLen( diff );
            if( r2 < kernelRadius2 ){
                neighbours2.push(p2);
            }
        });

        let isDiff = false;
        if(neighbours.length === neighbours2.length){
            for(let i = 0; i < neighbours2.length; i++){
                if(neighbours[i].id !== neighbours2[i].id){
                    isDiff = true;
                    break;
                }
            }
        }
        else{
            isDiff = true;
        }
        console.assert(!isDiff, "error in grid spatial hashing");*/

        p1.neighbours = neighbours;
    });
}

/* Calculates the smoothed density (rho) at each particle's location */
const calculateDensities = () => {
    particles.forEach((p1) => {
        let rhoSum = 0;
        p1.neighbours.forEach((p2) => {
            rhoSum += poly6(p1.newPos, p2.newPos); 
        });
        p1.density = rhoSum;
        //console.log(rhoSum);
    });
}

/* Calculates lambda (the estimated distance along the constraint gradient)
 * to reach rest density*/
const calculateLambda = () => {
    particles.forEach((p1) => {
        const constraint = p1.density / restDensity - 1;

        let gradientSum = 0;
        let gradientKI = vec2.create();

        /* Sum up gradient norms for the denominator */
        p1.neighbours.forEach((p2) => {
            const gradient = spiky(p1.newPos, p2.newPos);
            vec2.scale(gradient, gradient, 1 / restDensity);

            gradientSum += vec2.len(gradient) * vec2.len(gradient);

            vec2.add(gradientKI, gradientKI, gradient);
        });

       // console.log(constraint);

        gradientSum += vec2.len(gradientKI) * vec2.len(gradientKI);
        p1.lambda = - constraint / (gradientSum + epsilon);
    });
}

/* Calculates the required distance to move the particle/ */
const calculateDeltaP = () => {
    particles.forEach((p1) => {
        let lambdaSum = vec2.fromValues(0, 0);
        p1.neighbours.forEach((p2) => {
            const gradient = spiky(p1.newPos, p2.newPos);

            vec2.scaleAndAdd(lambdaSum, lambdaSum, gradient, p1.lambda + p2.lambda);
        });
        vec2.scale(p1.deltaP, lambdaSum, 1 / restDensity );
        vec2.add(p1.newPos, p1.newPos, p1.deltaP);
    });
};

/* Updates the particle's position for rendering and uses verlet integration to update the velocity */
const updatePosition = () => {
    particles.forEach((p1) => {
        vec2.scaleAndAdd(p1.vel, p1.newPos, p1.pos, -1);
        //console.log(p1.vel);
        vec2.scale(p1.vel, p1.vel, 1/timestep);
        p1.pos = vec2.clone(p1.newPos);
    });
};

/* Extremely basic constraint handling (clamps to edge of box) */
const constrainParticles = () => {
     particles.forEach((p1) => {
         //console.log(p1.pos);
         if(p1.newPos[0] > 1){
             p1.newPos[0] =  1;
         }
         if(p1.newPos[0] < 0){
             p1.newPos[0] =  0.000;
         }
         if(p1.newPos[1] < 0){
             p1.newPos[1] = 0.00;
         }
         if(p1.newPos[1] > 1){
             p1.newPos[1] = 1;
         }
     });
};

const render = () => {
    ctx.clearRect(0, 0, 600, 600);
    particles.forEach((p1) => {
        //console.log(p1.pos.x);
        ctx.beginPath();
        ctx.arc(p1.pos[0] * 500, p1.pos[1] * 500 , 2, 0, 2*Math.PI);
        ctx.stroke();
        ctx.fill();
    });
}

const simulate = () => {
    predictPositions();
    createSpatialHashingGrid();
    updateNeighbours();
    for(let i = 0; i < solverIterations; i++){
        calculateDensities();
        calculateLambda();
        calculateDeltaP();
        constrainParticles();
    }
    updatePosition();
    iteration++;
    timeDisplay.innerHTML = (iteration /60).toFixed(2) + "s";
    //console.log(particles);
}

simulateAll.onclick = () => {
    const t0 = performance.now();
    simulate();
    const t1 = performance.now();
    console.log(`Simulation step ${t1 - t0 }ms`);
    render();
    window.requestAnimationFrame(() => simulateAll.onclick());
}

stepper.onclick = () => {
    simulate();
    render();
}

/* Initial render*/
initializeParticles();
render();