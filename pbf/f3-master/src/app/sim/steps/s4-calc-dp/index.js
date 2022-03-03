import calc_dp_vsrc from './shaders/calc-dp.vert';
import calc_dp_fsrc from './shaders/calc-dp.frag';
import { Program } from '../../gl-util';

export default (gl, app, sim) => {

  let _calc_dp_prog;

  function init() {
    _calc_dp_prog = new Program(gl, 'calc-dp', calc_dp_vsrc, calc_dp_fsrc, {
      attrs: ['a_id'],
      uniforms: {
        u_num_particles: '1ui',
        u_kernel_r: '1f',
        u_rest_density: '1f',
        u_s_corr_dq_mult: '1f',
        u_s_corr_k: '1f',
        u_s_corr_n: '1f',
        u_bin_size: '1f',
        u_x_bins: '1ui',
        u_num_bins: '1ui',
        u_pred_pos: '1i',
        u_lambda: '1i',
        u_bins: '1i',
        u_bin_count: '1i',
        u_bin_start: '1i'
      }
    });

    gl.bindBuffer(gl.ARRAY_BUFFER, sim.buffers.particle_ids);
    _calc_dp_prog.attr('a_id', 1, gl.UNSIGNED_SHORT, false, 0, 0)
      .use()
      .uniform('u_num_particles', sim.num_particles)
      .uniform('u_kernel_r', sim.s_params.kernel_r)
      .uniform('u_rest_density', sim.s_params.rest_density)
      .uniform('u_s_corr_dq_mult', sim.s_params.s_corr_dq_mult)
      .uniform('u_s_corr_k', sim.s_params.s_corr_k)
      .uniform('u_s_corr_n', sim.s_params.s_corr_n)
      .uniform('u_bin_size', sim.s_params.bin_size)
      .uniform('u_x_bins', sim.s_params.x_bins)
      .uniform('u_num_bins', sim.s_params.num_bins)
      .uniform('u_pred_pos', 0)
      .uniform('u_lambda', 1)
      .uniform('u_bins', 2)
      .uniform('u_bin_count', 3)
      .uniform('u_bin_start', 4)
      .unuse();
  }

  function exec() {
    const fb = sim.swap_fbo();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, sim.textures.d_pos._tex, 0);

    gl.activeTexture(gl.TEXTURE0);
    sim.textures.pred_pos.bind();
    gl.activeTexture(gl.TEXTURE1);
    sim.textures.den.bind();
    gl.activeTexture(gl.TEXTURE2);
    sim.textures.bins.bind();
    gl.activeTexture(gl.TEXTURE3);
    sim.textures.bin_count.bind();
    gl.activeTexture(gl.TEXTURE4);
    sim.textures.bin_start.bind();

    _calc_dp_prog.use();
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.viewport(0, 0, sim.num_particles, 1);
    gl.drawArrays(gl.POINTS, 0, sim.num_particles);
    _calc_dp_prog.unuse();
  }

  return {
    init,
    exec
  };
};
