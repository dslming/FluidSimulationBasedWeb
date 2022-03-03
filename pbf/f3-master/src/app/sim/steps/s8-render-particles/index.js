import { mat4, vec3 } from 'gl-matrix';
import render_vsrc from './shaders/render.vert';
import render_fsrc from './shaders/render.frag';
import { Program } from '../../gl-util';

export default (gl, app, sim) => (() => {

  let _render_prog;
  let _mat_view;
  let _mat_proj;

  function init() {
    _mat_view = mat4.create();
    const target_x = sim.r_params.width / 2;
    const target_y = sim.r_params.height / 2;
    const camera = vec3.fromValues(target_x, target_y, 3)

    mat4.lookAt(_mat_view,
      camera,
      vec3.fromValues(target_x, target_y, 0),
      vec3.fromValues(0, 1, 0));

    _mat_proj = mat4.create();
    mat4.perspective(_mat_proj,
      45 * Math.PI / 180, // fov in radians
      gl.canvas.clientWidth / gl.canvas.clientHeight, // aspect
      0.1, // z-near
      100); // z-far

    _render_prog = new Program(gl, 'render', render_vsrc, render_fsrc, {
      attrs: ['a_id'],
      uniforms: {
        u_num_particles: '1ui',
        u_pos_buf: '1i',
        u_radius: '1f',
        u_vpheight: '1ui',
        u_view: 'Matrix4fv',
        u_proj: 'Matrix4fv',
        u_camera: '3fv'
      }
    });

    gl.bindBuffer(gl.ARRAY_BUFFER, sim.buffers.particle_ids);
    _render_prog.attr('a_id', 1, gl.UNSIGNED_SHORT, false, 0, 0)
      .use()
      .uniform('u_pos_buf', 0)
      .uniform('u_radius', app.is_mac ? sim.r_params.radius * 2 : sim.r_params.radius)
      .uniform('u_num_particles', sim.num_particles)
      .uniform('u_vpheight', gl.canvas.height)
      .uniform('u_camera', camera)
      .uniform('u_view', false, _mat_view)
      .uniform('u_proj', false, _mat_proj)
      .unuse();
  }

  function exec() {
    const { canvas, input, is_mac, renderer } = app;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    gl.activeTexture(gl.TEXTURE0);
    sim.textures.pos.bind();

    _render_prog.use();
    gl.clearColor(0.2, 0.2, 0.2, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.drawArrays(gl.POINTS, 0, sim.num_particles);
    _render_prog.unuse();
  }

  return {
    init,
    exec
  };
})();
