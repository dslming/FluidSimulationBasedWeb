import pos_update_vsrc from './shaders/update-pos.vert';
import pos_update_fsrc from './shaders/update-pos.frag';
import { Program } from '../../gl-util';

export default (gl, app, sim) => (() => {

  let _pos_update_prog;

  function init() {
    _pos_update_prog = new Program(gl, 'pos-update', pos_update_vsrc, pos_update_fsrc, {
      attrs: ['a_id'],
      uniforms: {
        u_num_particles: '1ui',
        u_pred_pos_buf: '1i'
      }
    });

    gl.bindBuffer(gl.ARRAY_BUFFER, sim.buffers.particle_ids);
    _pos_update_prog.attr('a_id', 1, gl.UNSIGNED_SHORT, false, 0, 0)
      .use()
      .uniform('u_pred_pos_buf', 0)
      .uniform('u_num_particles', sim.num_particles)
      .unuse();
  }

  function exec() {
    const fb = sim.swap_fbo();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, sim.textures.pos._tex, 0);

    gl.activeTexture(gl.TEXTURE0);
    sim.textures.pred_pos.bind();

    _pos_update_prog.use();
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.viewport(0, 0, sim.num_particles, 1);
    gl.drawArrays(gl.POINTS, 0, sim.num_particles);
    _pos_update_prog.unuse();
  }

  return {
    init,
    exec
  };
})();
