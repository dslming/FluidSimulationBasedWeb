#version 300 es
precision mediump float;

in vec3 _pos;
flat in float _id;

uniform float u_radius;
uniform vec3 u_camera;
uniform mediump mat4 u_view;
uniform mediump mat4 u_proj;

out vec4 f_color;

const vec3 ambient = vec3(0.05f, 0.2f, 0.3f);
const vec3 color = vec3(0.15f, 0.65f, 1.f);

void main() {
  vec3 n;
  n.xy = 2.f * gl_PointCoord.st - vec2(1.f);
  n.y = -n.y;
  float r2 = length(n.xy);
  if (r2 > 1.f)
    discard;
  n.z = sqrt(1.f - r2);

  vec4 pos = vec4((u_view * vec4(_pos, 1.f)).xyz + n * u_radius, 1.f);
  vec4 clip_pos = u_proj * pos;
  float depth = (1.f + clip_pos.z / clip_pos.w) / 2.f;
  gl_FragDepth = gl_DepthRange.near + gl_DepthRange.diff * depth;

  vec4 lpos_view = u_view * vec4(u_camera.x - 1.f, u_camera.y + 0.5f, 1.f, 1.f);
  float diffuse = clamp(dot(n, lpos_view.xyz - pos.xyz), 0.f, 1.f);

  f_color = vec4(ambient + diffuse * color.xyz, 1.f);
}