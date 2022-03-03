#version 300 es
precision mediump float;

in float _u_target;

uniform float u_dt;
uniform sampler2D u_pos_buf;
uniform sampler2D u_vel_buf;

layout(location = 0) out vec2 _pred_pos;

void main() {
  vec2 pos = texture(u_pos_buf, vec2(_u_target, 0)).xy;
  vec2 vel = texture(u_vel_buf, vec2(_u_target, 0)).xy;

  vec2 dp = (vel + vec2(0, -9.8f) * u_dt) * u_dt;
  // vec2 dp = (vel + vec2(0) * u_dt) * u_dt;

  _pred_pos = pos + dp;
}