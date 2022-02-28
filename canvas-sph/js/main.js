import SPH from "./sph.js";
import Vec from "./vec.js";

let paused = false;

function displayVariables(variables) {
  const variablesWrapper = document.getElementById("variablesWrapper");
  Object.entries(variables).forEach(([key, value]) => {
    const element = document.createElement("p");
    element.innerHTML = `${key}: ${value}`;
    variablesWrapper.appendChild(element);
  });
}

function displayFPS(fps) {
  document.getElementById("fps").innerHTML = `fps: ${fps.toFixed(1)}`;
}

function main() {
  const width = 1024;
  const height = 1024;
  const canvas = document.getElementById("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  // 粒子间距
  const particleSpacing = 0.01136363636;
  const supportRadius = Math.sqrt(
    (Math.pow(particleSpacing, 2) * 20) / Math.PI
  );

  const gravity = Vec.new(0.0, -9.81);
  const restDensity = 1000;

  const k = 10.0;
  const mu = 3.5;

  const dt = 0.001148 / 2;

  const timestepsPerFrame = 2;

  const eps = 0.00001;
  const kStiff = 300.0;
  const kDamp = kStiff / 4;

  let frameTimestamp = new Date();

  displayVariables({
    particleSpacing,
    supportRadius,
    gravity,
    restDensity,
    k,
    mu,
    dt,
    kStiff,
    kDamp,
    eps,
  });

  const box = {
    left: 1.0 / 16.0,
    right: 15.0 / 16.0,
    bottom: 1.0 / 16.0,
    top: 15.0 / 16.0,
  };

  const sph = new SPH({
    particleSpacing,
    supportRadius,
    gravity,
    restDensity,
    k,
    mu,
    dt,
    kStiff,
    kDamp,
    eps,
    box,
  });
  window.sph = sph;
  sph.generateParticleRect({
    randomization: particleSpacing / 4.0,
    left: 3.0 / 8.0,
    right: 5.0 / 8.0,
    bottom: particleSpacing + 1.0 / 16.0,
    top: particleSpacing + 1.0 / 16.0 + 1.0 / 4.0,
  });

  sph.init();

  console.log(sph.particles);

  const draw = () => {
    ctx.clearRect(0, 0, width, height);

    const { minP, maxP } = sph.particles.reduce(
      ({ minP, maxP }, { p }) => ({
        minP: Math.min(minP, p),
        maxP: Math.max(maxP, p),
      }), { minP: Infinity, maxP: -Infinity }
    );

    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.beginPath();
    ctx.moveTo(box.left * width, (1.0 - box.bottom) * height);
    ctx.lineTo(box.right * width, (1.0 - box.bottom) * height);
    ctx.lineTo(box.right * width, (1.0 - box.top) * height);
    ctx.lineTo(box.left * width, (1.0 - box.top) * height);
    ctx.closePath();
    ctx.stroke();

    sph.particles.forEach(({ x, p }) => {
      ctx.fillStyle = `rgba(${
        Math.floor(255 * Math.log(p - minP + 1)) / Math.log(maxP - minP + 1)
      }, 127, 127, 1.0)`;
      ctx.beginPath();
      ctx.arc(
        Vec.getX(x) * width,
        (1.0 - Vec.getY(x)) * height,
        (0.005 * (width + height)) / 2,
        0,
        Math.PI * 2
      );
      ctx.fill();

      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.beginPath();
      ctx.arc(
        Vec.getX(x) * width,
        (1.0 - Vec.getY(x)) * height,
        (supportRadius * (width + height)) / 2,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    });

    for (let i = 0; i < timestepsPerFrame; i++) {
      sph.computeNextFrame();
    }

    const newTimestamp = new Date();
    const fps = 1000 / (newTimestamp - frameTimestamp);
    frameTimestamp = newTimestamp;
    displayFPS(fps);

    if (!paused) {
      requestAnimationFrame(() => draw());
    } else {
      console.log(sph);
    }
  };

  const init = () => {
    ctx.clearRect(0, 0, width, height);

    requestAnimationFrame(() => draw());
  };

  init();
}

window.onload = (e) => main();
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (paused) {
      requestAnimationFrame(() => draw());
    }
    paused = !paused;
  }
});
