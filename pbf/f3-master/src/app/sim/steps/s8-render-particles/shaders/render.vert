#version 300 es
layout(location = 0) in float a_id;

uniform uint u_num_particles;
uniform mediump float u_radius;
uniform sampler2D u_pos_buf;
uniform mediump mat4 u_view;
uniform mediump mat4 u_proj;
uniform uint u_vpheight;

out vec3 _pos;
flat out float _id;

void main() {
  vec2 in_pos = texture(u_pos_buf, vec2(a_id / float(u_num_particles), 0)).xy;
  vec4 pos = vec4(in_pos, 0.f, 1.f);
  gl_Position = u_proj * u_view * pos;
  gl_PointSize = float(u_vpheight) * u_proj[1][1] * u_radius / gl_Position.w;

  _pos = pos.xyz;
  _id = a_id;
}
