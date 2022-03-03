import pred_pos_vsrc from './shaders/pred-pos.vert';
import pred_pos_fsrc from './shaders/pred-pos.frag';
import { Program } from '../../gl-util';

export default (gl, app, sim) => (() => {

  let _pred_pos_prog;

  function init() {
    _pred_pos_prog = new Program(gl, 'pred-pos', pred_pos_vsrc, pred_pos_fsrc, {
      attrs: ['a_id'],
      uniforms: {
        u_num_particles: '1ui',
        u_dt: '1f',
        u_pos_buf: '1i',
        u_vel_buf: '1i'
      }
    });


    gl.bindBuffer(gl.ARRAY_BUFFER, sim.buffers.particle_ids);
    _pred_pos_prog.attr('a_id', 1, gl.UNSIGNED_SHORT, false, 0, 0)
      .use()
      .uniform('u_num_particles', sim.num_particles)
      .uniform('u_dt', sim.s_params.dt)
      .uniform('u_pos_buf', 0)
      .uniform('u_vel_buf', 1)
      .unuse();
  }

  function exec() {
    const fb = sim.swap_fbo();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, sim.textures.pred_pos._tex, 0);

    gl.activeTexture(gl.TEXTURE0);
    sim.textures.pos.bind();
    gl.activeTexture(gl.TEXTURE1);
    sim.textures.vel.bind();

    _pred_pos_prog.use();
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.viewport(0, 0, sim.num_particles, 1);
    gl.drawArrays(gl.POINTS, 0, sim.num_particles);
    _pred_pos_prog.unuse();
  }

  return {
    init,
    exec
  }
})();
