#version 300 es
layout(location = 0) in float a_id;

uniform mediump uint u_num_particles;

out float _u_target;
out float _id;

void main() {
  _u_target = a_id / float(u_num_particles);
  _id = a_id;

  gl_Position = vec4(2.f * (_u_target - 0.5f), 0, 0, 1.f);
  gl_PointSize = 1.f;
}