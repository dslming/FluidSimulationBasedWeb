#version 300 es
precision mediump float;

#define PI 3.14159265358979323846264338327950288f
#define EPS_F 1e-23f

in float _u_target;
in float _id;

uniform uint u_num_particles;
uniform float u_kernel_r;
uniform float u_rest_density;
uniform float u_relaxation;
uniform float u_bin_size;
uniform uint u_x_bins;
uniform uint u_num_bins;

uniform sampler2D u_pred_pos;
uniform mediump usampler2D u_bins;
uniform mediump usampler2D u_bin_count;
uniform mediump usampler2D u_bin_start;

layout(location = 0) out float _den;

float poly6(vec2 ri) {
  float r = length(ri);
  if (r >= u_kernel_r || r < EPS_F)
    return 0.f;
  return (315.f / (64.f * PI * pow(u_kernel_r, 9.f))) * pow(u_kernel_r * u_kernel_r - r * r, 3.f);
}

vec2 grad_spiky(vec2 ri) {
  float r = length(ri);
  if (r >= u_kernel_r || r < EPS_F)
    return vec2(0.f);
  return (-45.f / (PI * pow(u_kernel_r, 6.f))) * pow(u_kernel_r - r, 2.f) * normalize(ri);
}

ivec2 bin_index(vec2 pos) {
  uint x_c = uint(pos.x / u_bin_size);
  uint y_c = uint(pos.y / u_bin_size);
  return ivec2(x_c, y_c);
}

uint bin(ivec2 bin_index) {
  return uint(bin_index.y) * u_x_bins + uint(bin_index.x);
}

void main() {
  vec2 p_i = texture(u_pred_pos, vec2(_u_target, 0)).xy;
  ivec2 bin_index = bin_index(p_i);

  uint id_i = uint(_id);
  vec2 target_j_id;
  uint id_j;
  vec2 target_j;
  vec2 p_j;
  vec2 grad_ci_pk;

  vec2 grad_ci_pi = vec2(0.f);
  float density = 0.f;
  float denom = 0.f;

  for (int i = -1; i <= 1; ++i) {
    for (int j = -1; j <= 1; ++j) {
      uint b = bin(bin_index + ivec2(i, j));
      vec2 bin_uv = vec2(float(b) / float(u_num_bins), 0.f);
      uint count = texture(u_bin_count, bin_uv).x;
      uint start = texture(u_bin_start, bin_uv).x;

      for (uint k = start; k < start + count; ++k) {
        target_j_id = vec2(float(k) / float(u_num_particles), 0);
        id_j = texture(u_bins, target_j_id).x;
        target_j = vec2(float(id_j) / float(u_num_particles), 0);
        p_j = texture(u_pred_pos, target_j).xy;

        // accumulate density
        density += poly6(p_i - p_j);

        // accumulate denominator
        grad_ci_pk = grad_spiky(p_i - p_j);
        if (id_i != id_j)
          denom += dot(grad_ci_pk, grad_ci_pk);
        grad_ci_pi += grad_ci_pk;
      }
    }
  }

  float num = density / u_rest_density - 1.f;
  denom += dot(grad_ci_pi, grad_ci_pi);
  _den = -num / (denom / pow(u_rest_density, 2.f) + u_relaxation);
}