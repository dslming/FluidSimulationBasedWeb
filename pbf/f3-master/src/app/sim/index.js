import { Texture, to_half } from '../../gl-util.js';
import s1_pred_pos from './steps/s1-pred-pos.js';
import s2_jank_frnn from './steps/s2-jank-frnn.js';
import s3_calc_lambda from './steps/s3-calc-lambda.js';
import s4_calc_dp from './steps/s4-calc-dp.js';
import s5_update_pred_pos from './steps/s5-update-pred-pos.js';
import s6_update_vel from './steps/s6-update-vel.js';
import s7_update_pos from './steps/s7-update-pos.js';
import s8_render_particles from './steps/s8-render-particles.js';

export default (app, gl) => class PBDSimulation {
  constructor(opts = {}) {
    this.next_id = -1;
    this.particles = [];
    this.params_dirty = false;

    this.framebuffer = 1;
    this.framebuffers = [];

    this.s_params = {
      dt: 0.0083,
      kernel_r: 0.1,
      bin_size: 0.1,
      rest_density: 8000,
      relaxation: 1000,
      s_corr_dq_mult: 0.01,
      s_corr_k: 0.0002,
      s_corr_n: 3,
      vort_eps: 0.00008,
      visc_c: 0.000001,
      x_bins: 0,
      y_bins: 0,
      num_bins: 0
    };

    this.r_params = {
      height: 2,
      width: 4,
      radius: 0.1
    };

    this.buffers = {
      particle_ids: null
    };

    this.textures = {
      pos: null, // position
      vel: null, // velocity
      pred_pos: null, // predicted position
      d_pos: null, // change in position
      den: null, // density lambda
      temp: null, // temporary storage
      bins: null, // particle ids sorted by bin id
      bin_start: null, // bin id -> index in `bins` texture
      bin_count: null // bin id -> number of entries in bin
    };

    this.steps = {
      pred_pos: s1_pred_pos(gl, app, this),
      jank_frnn: s2_jank_frnn(gl, app, this),
      calc_lambda: s3_calc_lambda(gl, app, this),
      calc_dp: s4_calc_dp(gl, app, this),
      update_pred_pos: s5_update_pred_pos(gl, app, this),
      update_vel: s6_update_vel(gl, app, this),
      update_pos: s7_update_pos(gl, app, this),
      render_particles: s8_render_particles(gl, app, this)
    }

    this.init();
  }

  init() {
    this.compute_bounds();
    const positions = this.generate_particles({
      w: 2,
      h: 2,
      o_x: this.r_params.width / 2,
      o_y: this.r_params.height / 2,
      d_x: 30,
      d_y: 20
    });

    app.info = { ...app.info, particles: this.num_particles };

    this.init_buffers();
    this.init_textures(positions);
    this.init_programs();
    this.init_framebuffers();
  }

  generate_particles({ o_x = 0, o_y = 0, w = 1, h = 1, d_x = 10, d_y = 10 }) {
    const positions = [];
    const num_w_particles = w * d_x;
    const num_h_particles = h * d_y;
    const offset_x = w / num_w_particles;
    const offset_y = h / num_h_particles;

    for (let i = -num_w_particles / 2; i < num_w_particles / 2; ++i) {
      for (let j = -num_h_particles / 2; j < num_h_particles / 2; ++j) {
        positions.push(o_x + i * offset_x, o_y + j * offset_y);
        this.particles.push(++this.next_id);
      }
    }

    return positions;
  }

  compute_bounds() {
    const { bin_size } = this.s_params;
    const { height, width } = this.r_params;

    const y_bins = Math.ceil(height / bin_size);
    const x_bins = Math.ceil(width / bin_size);

    this.s_params.y_bins = y_bins;
    this.s_params.x_bins = x_bins;
    this.s_params.num_bins = y_bins * x_bins;
  }

  init_buffers() {
    this.buffers.particle_ids = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.particle_ids);
    gl.bufferData(gl.ARRAY_BUFFER, new Uint16Array(this.particles), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }

  init_programs() {
    this.steps.pred_pos.init();
    this.steps.jank_frnn.init();
    this.steps.calc_lambda.init();
    this.steps.calc_dp.init();
    this.steps.update_pred_pos.init();
    this.steps.update_vel.init();
    this.steps.update_pos.init();
    this.steps.render_particles.init();
  }

  init_textures(positions) {
    const pos = new Texture(gl, 0,
      gl.RG32F,
      this.num_particles, 1,
      0,
      gl.RG, gl.FLOAT,
      new Float32Array(positions));

    const vel = new Texture(gl, 0,
      gl.RG32F,
      this.num_particles, 1,
      0,
      gl.RG, gl.FLOAT,
      new Float32Array(this.num_particles * 2));

    const pred_pos = new Texture(gl, 0,
      gl.RG32F,
      this.num_particles, 1,
      0,
      gl.RG, gl.FLOAT,
      null);

    const bins = new Texture(gl, 0,
      gl.R32UI,
      this.num_particles, 1,
      0,
      gl.RED_INTEGER, gl.UNSIGNED_INT,
      null);

    const bin_count = new Texture(gl, 0,
      gl.R32UI,
      this.s_params.num_bins, 1,
      0,
      gl.RED_INTEGER, gl.UNSIGNED_INT,
      null);

    const bin_start = new Texture(gl, 0,
      gl.R32UI,
      this.s_params.num_bins, 1,
      0,
      gl.RED_INTEGER, gl.UNSIGNED_INT,
      null);

    const den = new Texture(gl, 0,
      gl.R32F,
      this.num_particles, 1,
      0,
      gl.RED, gl.FLOAT,
      null);

    const d_pos = new Texture(gl, 0,
      gl.RG32F,
      this.num_particles, 1,
      0,
      gl.RG, gl.FLOAT,
      null);

    const temp = new Texture(gl, 0,
      gl.RG32F,
      this.num_particles, 1,
      0,
      gl.RG, gl.FLOAT,
      null);

    this.textures.pos = pos;
    this.textures.vel = vel;
    this.textures.pred_pos = pred_pos;
    this.textures.bins = bins;
    this.textures.bin_count = bin_count;
    this.textures.bin_start = bin_start;
    this.textures.den = den;
    this.textures.d_pos = d_pos;
    this.textures.temp = temp;
  }

  init_framebuffers() {
    this.framebuffers.push(gl.createFramebuffer());
    this.framebuffers.push(gl.createFramebuffer());
  }

  swap_fbo() {
    this.framebuffer = 1 - this.framebuffer;
    return this.framebuffers[this.framebuffer];
  }

  step(dt) {
    if (this.reset_pending) {
      this.reset();
      return;
    }
    this.steps.pred_pos.exec();
    this.steps.jank_frnn.exec();

    for (let i = 0; i < 3; ++i) {
      this.steps.calc_lambda.exec();
      this.steps.calc_dp.exec();
      this.steps.update_pred_pos.exec();
    }

    this.steps.update_vel.exec();
    this.steps.update_pos.exec();
  }

  render() {
    this.steps.render_particles.exec();
  }

  reset() {
    this.next_id = -1;
    this.particles.length = 0;
    const positions = this.generate_particles({
      w: 2,
      h: 2,
      o_x: this.r_params.width / 2,
      o_y: this.r_params.height / 2,
      d_x: 30,
      d_y: 20
    });

    this.textures.pos.bind();
    gl.texImage2D(gl.TEXTURE_2D, 0,
      gl.RG32F,
      this.num_particles, 1,
      0,
      gl.RG, gl.FLOAT,
      new Float32Array(positions));

    this.textures.vel.bind();
    gl.texImage2D(gl.TEXTURE_2D, 0,
      gl.RG32F,
      this.num_particles, 1,
      0,
      gl.RG, gl.FLOAT,
      new Float32Array(this.num_particles * 2));

    this.render();
  }

  get num_particles() {
    return this.particles.length;
  }
};
