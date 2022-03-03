#version 300 es
precision mediump float;

in float _u_target;

uniform sampler2D u_pred_pos;
uniform sampler2D u_d_pos;

layout(location = 0) out vec2 _pred_pos;

vec2 clamp_vec2(vec2 v, float x_min, float x_max, float y_min, float y_max) {
  return vec2(clamp(v.x, x_min, x_max), clamp(v.y, y_min, y_max));
}

void main() {
  vec2 t = vec2(_u_target, 0);
  vec2 pred_pos = texture(u_pred_pos, t).xy;
  vec2 dp = texture(u_d_pos, t).xy;
  _pred_pos = clamp_vec2(pred_pos + dp, 0.1f, 3.9f, 0.f, 2.f);
}