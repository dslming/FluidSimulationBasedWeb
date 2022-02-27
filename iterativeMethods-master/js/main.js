const setPixel = (img, i, j, v) => {
  const pixelValue = Math.floor(v * 255);
  img.data[4 * img.width * i + 4 * j + 0] = pixelValue;
  img.data[4 * img.width * i + 4 * j + 1] = pixelValue;
  img.data[4 * img.width * i + 4 * j + 2] = pixelValue;
  img.data[4 * img.width * i + 4 * j + 3] = pixelValue;
};

const getPixel = (img, i, j) => {
  return img.data[4 * img.width * i + 4 * j + 0] / 255;
};

const drawToImage = (img, grid) => {
  for (let i = 0; i < img.width; i++) {
    for (let j = 0; j < img.height; j++) {
      setPixel(img, i, j, grid[i * img.width + j]);
    }
  }
};

const close = (a, b, epsilon = 1e-6) => Math.abs(a - b) < epsilon;

const jacobi = (u_k, u_k1, width, height) => {
  let converged = true;
  for (let i = 1; i < height - 1; i++) {
    for (let j = 1; j < width - 1; j++) {
      u_k1[width * i + j] =
        0.25 *
        (u_k[width * (i - 1) + j] +
          u_k[width * i + j - 1] +
          u_k[width * (i + 1) + j] +
          u_k[width * i + j + 1]);
      converged = converged && close(u_k1[width * i + j], u_k[width * i + j]);
    }
  }
  return converged;
};

const gaussSeidel = (u, width, height) => {
  let converged = true;
  for (let odd = 0; odd < 2; odd++) {
    for (let i = 1; i < height - 1; i++) {
      for (let j = 1; j < width - 1; j++) {
        if ((i + j) % 2 == odd) {
          const u_k1 =
            0.25 *
            (u[width * (i - 1) + j] +
              u[width * i + j - 1] +
              u[width * (i + 1) + j] +
              u[width * i + j + 1]);
          converged = converged && close(u_k1, u[width * i + j]);
          u[width * i + j] = u_k1;
        }
      }
    }
  }
  return converged;
};

const sor = (u, omega, width, height) => {
  let converged = true;
  for (let odd = 0; odd < 2; odd++) {
    for (let i = 1; i < height - 1; i++) {
      for (let j = 1; j < width - 1; j++) {
        if ((i + j) % 2 == odd) {
          const u_k1 =
            (1.0 - omega) * u[width * i + j] +
            omega *
              0.25 *
              (u[width * (i - 1) + j] +
                u[width * i + j - 1] +
                u[width * (i + 1) + j] +
                u[width * i + j + 1]);
          converged = converged && close(u_k1, u[width * i + j]);
          u[width * i + j] = u_k1;
        }
      }
    }
  }
  return converged;
};

const drawToCanvas = (algorithm, omega = null) => {
  const width = 32;
  const height = 32;
  const canvas = document.getElementById(algorithm);
  canvas.width = width;
  canvas.height = width;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, width, height);

  let u_k = new Float32Array(width * height);
  let u_k1 = new Float32Array(width * height);
  const image = ctx.getImageData(0, 0, width, height);

  const status = document.getElementById(`${algorithm}Status`);
  status.innerHTML = "Iteration 0";
  let iteration = 0;
  let converged = false;

  if (algorithm === "sor") {
    document.getElementById("sorOmega").innerHTML = omega;
  }

  const draw = () => {
    ctx.clearRect(0, 0, width, height);

    if (algorithm === "jacobi") {
      converged = jacobi(u_k, u_k1, width, height);
      drawToImage(image, u_k1);
      ctx.putImageData(image, 0, 0);
      [u_k, u_k1] = [u_k1, u_k];
    } else if (algorithm === "gaussSeidel") {
      converged = gaussSeidel(u_k, width, height);
      drawToImage(image, u_k);
      ctx.putImageData(image, 0, 0);
    } else if (algorithm === "sor") {
      converged = sor(u_k, omega, width, height);
      drawToImage(image, u_k);
      ctx.putImageData(image, 0, 0);
    }

    iteration++;
    if (converged) {
      status.innerHTML = `Converged after ${iteration} iterations (ε = 1e-6)`;
    } else {
      status.innerHTML = `Iteration ${iteration}`;
      requestAnimationFrame((e) => draw());
    }
  };

  const init = () => {
    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        u_k[i * width + j] = i == 0 || i == height - 1 ? 1.0 : 0.0;
        u_k1[i * width + j] = i == 0 || i == height - 1 ? 1.0 : 0.0;
      }
    }

    requestAnimationFrame((e) => draw());
  };

  init();
};

window.onload = (e) => {
  drawToCanvas("jacobi");
  drawToCanvas("gaussSeidel");
  drawToCanvas("sor", 1.82);
};
