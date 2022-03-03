#version 300 es
precision mediump float;

in float _u_target;

uniform float u_dt;
uniform sampler2D u_pos_buf;
uniform sampler2D u_pred_pos_buf;

layout(location = 0) out vec2 _vel;

void main() {
  vec2 uv = vec2(_u_target, 0);
  vec2 pos = texture(u_pos_buf, uv).xy;
  vec2 pred_pos = texture(u_pred_pos_buf, uv).xy;
  _vel = (pred_pos - pos) / u_dt;
}