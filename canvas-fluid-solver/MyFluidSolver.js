const BOUNDARY = {
  NONE: 0,
  LEFT_RIGHT: 1,
  TOP_BOTTOM: 2,
}

class MyFluidSolver {
  /**
   * N { number } 每个维度中模拟网格的流体单元数(NxN)
   */
  constructor(N) {
    //  一行的格子数量
    this.N = N;
    //  总的格子数量
    this.numOfCells = (N + 2) * (N + 2);

    // 求解的迭代次数
    this.iterations = 10;
    // 时间间隔
    this.dt = 0.1;
    // 液体的粘度
    this.viscosity = 0;
    // 扩散量
    this.diffusion = 0.0002;

    this.velocityX = new Array(this.numOfCells).fill(0);
    this.velocityY = new Array(this.numOfCells).fill(0);
    this.density = new Array(this.numOfCells).fill(0);

    this.velocityXOld = new Array(this.numOfCells).fill(0);
    this.velocityXOld = new Array(this.numOfCells).fill(0);
    this.densityOld = new Array(this.numOfCells).fill(0);

    // 旋度
    this.curlData = new Array(this.numOfCells).fill(0);
  }

  /**
   * 根据二维数组的索引,得到一维数组的索引
   * @param i {Number} 二维数组的列索引, 水平方向x
   * @param j { Number } 二维数组的行索引, 垂直方向y
   * @returns {Number} 在一维数组的索引
   * @note (x | x) is a faster Math.floor(x)
   */
  getIndex(i, j) {
    //  考虑边界上的2个格子
    return (i | i) + (this.N + 2) * (j | j);
  }

  // 添加密度源
  addDensitySource(i, j, amount) {
    const index = this.getIndex(i, j);
    this.density[index] += amount;
  }

  // 添加速度源头
  addVelocitySource(i, j, amountX, amountY) {
    const index = this.getIndex(i, j);
    this.velocityX[index] = amountX;
    this.velocityY[index] = amountY;
  }

  /**
   * 在相邻细胞之间扩散密度。
   * @param b {Number}
   * @param x {Array<Number>}
   * @param x0 {Array<Number>}
   * @param diffusion {Number}
   * @private
   */
  diffuse(b, x, x0, diffusion) {
    var a = this.dt * diffusion * this.n * this.n;
    this.linearSolve(b, x, x0, a, 1 + 4 * a);
  }

  /**
   * Forces the velocity field to be mass conserving.
   * 强制速度场是质量守恒的。
   * This step is what actually produces the nice looking swirly vortices.
   * 这一步实际上产生了漂亮的漩涡状漩涡。
   *
   * It uses a result called Hodge Decomposition which says that every velocity field is the sum
   * of a mass conserving field, and a gradient field. So we calculate the gradient field, and subtract
   * it from the velocity field to get a mass conserving one.
   * It solves a linear system of equations called Poisson Equation.
   *
   * @param u {Array<Number>}
   * @param v {Array<Number>}
   * @param p {Array<Number>}
   * @param div {Array<Number>}
   * @private
   */
  project(u, v, p, div) {
    var i, j;

    // Calculate the gradient field
    // 计算梯度场
    var h = 1.0 / this.N;
    for (i = 1; i <= this.N; i++) {
      for (j = 1; j <= this.N; j++) {
        const iCenter = this.getIndex(i, j);
        const iLeft = this.getIndex(i - 1, j);
        const iRight = this.getIndex(i + 1, j);
        const iTop = this.getIndex(i, j + 1);
        const iBottom = this.getIndex(i, j - 1);

        div[iCenter] = -0.5 * h * (u[iRight] - u[iLeft] + v[iTop] - v[iBottom]);
        p[iCenter] = 0;
      }
    }

    this.setBoundary(BOUNDARY.BOUNDARY_NONE, div);
    this.setBoundary(BOUNDARY.BOUNDARY_NONE, p);

    // Solve the Poisson equations
    this.linearSolve(BOUNDARY.BOUNDARY_NONE, p, div, 1, 4);

    // Subtract the gradient field from the velocity field to get a mass conserving velocity field.
    // 从速度场中减去梯度场，得到质量守恒的速度场。
    for (i = 1; i <= this.N; i++) {
      for (j = 1; j <= this.N; j++) {
        const iCenter = this.getIndex(i, j);
        const iLeft = this.getIndex(i - 1, j);
        const iRight = this.getIndex(i + 1, j);
        const iTop = this.getIndex(i, j + 1);
        const iBottom = this.getIndex(i, j - 1);

        u[iCenter] -= 0.5 * (p[iRight] - p[iLeft]) / h;
        v[iCenter] -= 0.5 * (p[iTop] - p[iBottom]) / h;
      }
    }

    this.setBoundary(BOUNDARY.LEFT_RIGHT, u);
    this.setBoundary(BOUNDARY.TOP_BOTTOM, v);
  }

  /**
   * The advection step moves the density through the static velocity field.
   * Instead of moving the cells forward in time, we treat the cell's center as a particle
   * and then trace it back in time to look for the 'particles' which end up at the cell's center.
   * 平流步骤通过静态速度场移动密度。
     *
     我们没有将细胞及时向前移动， 而是将细胞的中心视为一个粒子 *
     然后及时追溯以寻找最终到达细胞中心的“ 粒子”。
   *
   * @param b {Number}
   * @param d {Array<Number>}
   * @param d0 {Array<Number>}
   * @param u {Array<Number>}
   * @param v {Array<Number>}
   * @private
   */
  advect(b, d, d0, u, v) {
    var i, j, i0, j0, i1, j1;
    var x, y, s0, t0, s1, t1, dt0;

    dt0 = this.dt * this.n;
    for (i = 1; i <= this.n; i++) {
      for (j = 1; j <= this.n; j++) {
        const index = this.getIndex(i, j);
        x = i - dt0 * u[index];
        y = j - dt0 * v[index];

        if (x < 0.5) x = 0.5;
        if (x > this.n + 0.5) x = this.n + 0.5;

        i0 = (x | x);
        i1 = i0 + 1;

        if (y < 0.5) y = 0.5;
        if (y > this.n + 0.5) y = this.n + 0.5;

        j0 = (y | y);
        j1 = j0 + 1;
        s1 = x - i0;
        s0 = 1 - s1;
        t1 = y - j0;
        t0 = 1 - t1;

        const index0 = this.getIndex(i0, j0);
        const index1 = this.getIndex(i0, j1);
        const index2 = this.getIndex(i1, j0);
        const index3 = this.getIndex(i1, j1);

        d[index] = s0 * (t0 * d0[index0] + t1 * d0[index1]) + s1 * (t0 * d0[index2] + t1 * d0[index3]);
      }
    }

    this.setBoundary(b, d);
  };

  /**
   * Solve a linear system of equations using Gauss-Seidel method.
   *
   * @param b {Number}
   * @param x {Array<Number>}
   * @param x0 {Array<Number>}
   * @param a {Number}
   * @param c {Number}
   * @private
   */
  linearSolve(b, x, x0, a, c) {
    var i, j, k, invC = 1.0 / c;

    for (k = 0; k < this.iterations; k++) {
      for (i = 1; i <= this.N; i++) {
        for (j = 1; j <= this.N; j++) {
          const iCenter = this.getIndex(i, j);
          const iLeft = this.getIndex(i - 1, j);
          const iRight = this.getIndex(i + 1, j);
          const iTop = this.getIndex(i, j + 1);
          const iBottom = this.getIndex(i, j - 1);
          x[iCenter] = (x0[iCenter] + a * (x[iLeft] + x[iRight] + x[iTop] + x[iBottom])) * invC;
        }
      }

      this.setBoundary(b, x);
    }
  }

  /**
   * Set boundary conditions.
   * 设置边界条件。
   * @param b {Number}
   * @param x {Array<Number>}
   * @private
   */
  setBoundary(b, x) {
    const { LEFT_RIGHT, TOP_BOTTOM } = BOUNDARY;

    for (let i = 1; i <= this.N; i++) {
      // 设置最左侧一列的值
      x[this.getIndex(0, i)] = (b === LEFT_RIGHT) ? -x[this.getIndex(1, i)] : x[this.getIndex(1, i)];
      // 设置最右侧一列的值
      x[this.getIndex(this.N + 1, i)] = (b === LEFT_RIGHT) ? -x[this.getIndex(this.N, i)] : x[this.getIndex(this.N, i)];

      // 设置最顶部一行的值
      x[this.getIndex(i, 0)] = (b === TOP_BOTTOM) ? -x[this.getIndex(i, 1)] : x[this.getIndex(i, 1)];
      // 设置最底部一行的值
      x[this.getIndex(i, this.N + 1)] = (b === TOP_BOTTOM) ? -x[this.getIndex(i, this.N)] : x[this.getIndex(i, this.N)];
    }

    x[this.getIndex(0, 0)] = 0.5 * (x[this.getIndex(1, 0)] + x[this.getIndex(0, 1)]);
    x[this.getIndex(0, this.N + 1)] = 0.5 * (x[this.getIndex(1, this.N + 1)] + x[this.getIndex(0, this.N)]);
    x[this.getIndex(this.N + 1, 0)] = 0.5 * (x[this.getIndex(this.N, 0)] + x[this.getIndex(this.N + 1, 1)]);
    x[this.getIndex(this.N + 1, this.N + 1)] = 0.5 * (x[this.getIndex(this.N, this.N + 1)] + x[this.getIndex(this.N + 1, this.N)]);
  }

  step() {

  }
}


export { BOUNDARY, MyFluidSolver }
