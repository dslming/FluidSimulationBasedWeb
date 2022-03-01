import { Material } from './Material.js'
import { SPHSimulation } from './SPHSimulation.js'

function main() {

  const mat = new Material(
    3, // Gas constant
    3.5, // Viscosity mu
    998.29, // Rest Density
    0.728, // Surface tension
    0.001, // Point Damping
    0.2, // Bouncyness
    0.66 // Restitution
  )
  const simulation = new SPHSimulation(
    document.getElementById("simulation"), // Canvas
    document.getElementById("time"), // FPS counter
    20, // Simulation width
    20, // Simulation heigh
    20, // No. of divisions X
    20, // No. of divisions Y
    20, // Kernel particles
    10, // Maximum capacity of grid bucket.
    mat,
    0.01, // Delta time
    4330, // Threshold
    "#0088FF" // Color
  );
}






// //---------------------------------------------------

// var requestAnimationFrame = (window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame).bind(window);

// Call main
window.onload = main;
