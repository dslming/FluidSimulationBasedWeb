#version 300 es
precision mediump float;

#define PI 3.14159265358979323846264338327950288f
#define EPS_F 1e-23f

in float _u_target;

uniform uint u_num_particles;
uniform float u_dt;
uniform float u_kernel_r;
uniform float u_vort_eps;
uniform float u_visc_c;
uniform float u_bin_size;
uniform uint u_x_bins;
uniform uint u_num_bins;

uniform sampler2D u_pred_pos;
uniform sampler2D u_vel;
uniform mediump usampler2D u_bins;
uniform mediump usampler2D u_bin_count;
uniform mediump usampler2D u_bin_start;

layout(location = 0) out vec2 _vel;

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
  vec2 uv = vec2(_u_target, 0);
  vec2 p_i = texture(u_pred_pos, uv).xy;
  vec2 v_i = texture(u_vel, uv).xy;
  ivec2 bin_index = bin_index(p_i);

  uint b;
  vec2 bin_uv;
  uint count;
  uint start;
  vec2 target_j_id;
  uint id_j;
  vec2 target_j;  
  vec2 v_j;

  vec2 p_j;
  vec3 w_i = vec3(0);
  vec3 p_cross = vec3(0);
  vec2 xsph_sum = vec2(0);

  for (int i = -1; i <= 1; ++i) {
    for (int j = -1; j <= 1; ++j) {
      b = bin(bin_index + ivec2(i, j));
      bin_uv = vec2(float(b) / float(u_num_bins), 0);
      count = texture(u_bin_count, bin_uv).x;
      start = texture(u_bin_start, bin_uv).x;

      for (uint k = start; k < start + count; ++k) {
        target_j_id = vec2(float(k) / float(u_num_particles), 0);
        id_j = texture(u_bins, target_j_id).x;
        target_j = vec2(float(id_j) / float(u_num_particles), 0);

        p_j = texture(u_pred_pos, target_j).xy;
        v_j = texture(u_vel, target_j).xy;

        vec2 r = p_i - p_j;
        vec2 v_ij = v_j - v_i;

        w_i += cross(vec3(v_ij, 0), vec3(grad_spiky(r), 0));
        p_cross += vec3(0.5 * (p_i + p_j) - p_i, 0);

        xsph_sum += poly6(r) * v_ij;
      }
    }
  }

  vec3 n = normalize(p_cross - vec3(p_i, 0));
  vec3 f_vort = vec3(0);
  if (length(n) > EPS_F)
    f_vort = u_vort_eps * cross(n, w_i);

  _vel = v_i + u_visc_c * xsph_sum + (u_dt * f_vort).xy;
}