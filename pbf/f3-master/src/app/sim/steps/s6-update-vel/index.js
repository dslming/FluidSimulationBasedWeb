import vel_update_vsrc from './shaders/update-vel.vert';
import vel_update_fsrc from './shaders/update-vel.frag';
import visc_vort_vsrc from './shaders/visc-vort.vert';
import visc_vort_fsrc from './shaders/visc-vort.frag';
import { Program } from '../../gl-util';

export default (gl, app, sim) => (() => {

  let _vel_update_prog;
  let _visc_vort_prog;

  function init() {
    _vel_update_prog = new Program(gl, 'vel-update', vel_update_vsrc, vel_update_fsrc, {
      attrs: ['a_id'],
      uniforms: {
        u_num_particles: '1ui',
        u_dt: '1f',
        u_pos_buf: '1i',
        u_pred_pos_buf: '1i'
      }
    });

    _visc_vort_prog = new Program(gl, 'visc-vort', visc_vort_vsrc, visc_vort_fsrc, {
      attrs: ['a_id'],
      uniforms: {
        u_num_particles: '1ui',
        u_dt: '1f',
        u_kernel_r: '1f',
        u_vort_eps: '1f',
        u_visc_c: '1f',
        u_bin_size: '1f',
        u_x_bins: '1ui',
        u_num_bins: '1ui',
        u_pred_pos: '1i',
        u_vel: '1i',
        u_bins: '1i',
        u_bin_count: '1i',
        u_bin_start: '1i'
      }
    })

    gl.bindBuffer(gl.ARRAY_BUFFER, sim.buffers.particle_ids);
    _vel_update_prog.attr('a_id', 1, gl.UNSIGNED_SHORT, false, 0, 0)
      .use()
      .uniform('u_num_particles', sim.num_particles)
      .uniform('u_dt', sim.s_params.dt)
      .uniform('u_pos_buf', 0)
      .uniform('u_pred_pos_buf', 1)
      .unuse();

    _visc_vort_prog.attr('a_id', 1, gl.UNSIGNED_SHORT, false, 0, 0)
      .use()
      .uniform('u_num_particles', sim.num_particles)
      .uniform('u_dt', sim.s_params.dt)
      .uniform('u_kernel_r', sim.s_params.kernel_r)
      .uniform('u_vort_eps', sim.s_params.vort_eps)
      .uniform('u_visc_c', sim.s_params.visc_c)
      .uniform('u_bin_size', sim.s_params.bin_size)
      .uniform('u_x_bins', sim.s_params.x_bins)
      .uniform('u_num_bins', sim.s_params.num_bins)
      .uniform('u_pred_pos', 1)
      .uniform('u_vel', 2)
      .uniform('u_bins', 3)
      .uniform('u_bin_count', 4)
      .uniform('u_bin_start', 5)
      .unuse();
  }

  function exec() {
    let fb = sim.swap_fbo();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, sim.textures.vel._tex, 0);

    gl.activeTexture(gl.TEXTURE0);
    sim.textures.pos.bind();
    gl.activeTexture(gl.TEXTURE1);
    sim.textures.pred_pos.bind();

    _vel_update_prog.use();
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.viewport(0, 0, sim.num_particles, 1);
    gl.drawArrays(gl.POINTS, 0, sim.num_particles);
    _vel_update_prog.unuse();

    const temp = sim.textures.temp;
    fb = sim.swap_fbo();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, temp._tex, 0);

    gl.activeTexture(gl.TEXTURE2);
    sim.textures.vel.bind();
    gl.activeTexture(gl.TEXTURE3);
    sim.textures.bins.bind();
    gl.activeTexture(gl.TEXTURE4);
    sim.textures.bin_count.bind();
    gl.activeTexture(gl.TEXTURE5);
    sim.textures.bin_start.bind();

    _visc_vort_prog.use();
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.viewport(0, 0, sim.num_particles, 1);
    gl.drawArrays(gl.POINTS, 0, sim.num_particles);
    _visc_vort_prog.unuse();

    sim.textures.temp = sim.textures.vel;
    sim.textures.vel = temp;
  }

  return {
    init,
    exec
  };
})();
