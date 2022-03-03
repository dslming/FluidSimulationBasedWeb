import update_pred_pos_vsrc from './shaders/update-pred-pos.vert';
import update_pred_pos_fsrc from './shaders/update-pred-pos.frag';
import { Program } from '../../gl-util';

export default (gl, app, sim) => (() => {

  let _update_pred_pos_prog;

  function init() {
    _update_pred_pos_prog = new Program(gl, 'pred-pos-update', update_pred_pos_vsrc, update_pred_pos_fsrc, {
      attrs: ['a_id'],
      uniforms: {
        u_num_particles: '1ui',
        u_pred_pos: '1i',
        u_d_pos: '1i'
      }
    });

    gl.bindBuffer(gl.ARRAY_BUFFER, sim.buffers.particle_ids);
    _update_pred_pos_prog.attr('a_id', 1, gl.UNSIGNED_SHORT, false, 0, 0)
      .use()
      .uniform('u_num_particles', sim.num_particles)
      .uniform('u_pred_pos', 0)
      .uniform('u_d_pos', 1)
      .unuse();
  }

  function exec() {
    const fb = sim.swap_fbo();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

    const temp = sim.textures.temp;
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, temp._tex, 0);

    gl.activeTexture(gl.TEXTURE0);
    sim.textures.pred_pos.bind();
    gl.activeTexture(gl.TEXTURE1);
    sim.textures.d_pos.bind();

    _update_pred_pos_prog.use();
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.viewport(0, 0, sim.num_particles, 1);
    gl.drawArrays(gl.POINTS, 0, sim.num_particles);
    _update_pred_pos_prog.unuse();

    sim.textures.temp = sim.textures.pred_pos;
    sim.textures.pred_pos = temp;
  }

  return {
    init,
    exec
  };
})();
