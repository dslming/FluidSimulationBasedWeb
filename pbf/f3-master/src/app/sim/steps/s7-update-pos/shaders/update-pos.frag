#version 300 es
precision mediump float;

in float _u_target;

uniform sampler2D u_pred_pos_buf;

layout(location = 0) out vec2 _pos;

void main() {
  vec2 pos = texture(u_pred_pos_buf, vec2(_u_target, 0)).xy;
  _pos = pos;
}