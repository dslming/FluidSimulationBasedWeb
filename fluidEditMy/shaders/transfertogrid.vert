//transfers particle velocities to the grid by splatting them using additive blending
// 通过使用添加剂混合将粒子速度分散到栅格中

precision highp float;

attribute vec2 a_textureCoordinates;

uniform sampler2D u_positionTexture;
uniform sampler2D u_velocityTexture;

uniform vec3 u_gridSize;
uniform vec3 u_gridResolution;

varying vec3 v_position;
varying vec3 v_velocity;

// z层的偏移量
uniform float u_zOffset; //the offset for the z layer we're splatting into
varying float v_zIndex; //the z layer we're splatting into

void main () {
    //TODO: i can probably compute this more accurately
    // 我可能可以更准确地计算
    gl_PointSize = 5.0;

    vec3 position = texture2D(u_positionTexture, a_textureCoordinates).rgb;
    position = (position / u_gridSize) * u_gridResolution;

    vec3 velocity = texture2D(u_velocityTexture, a_textureCoordinates).rgb;
    v_velocity = velocity;
    v_position = position;

    vec3 cellIndex = vec3(floor(position.xyz));
    //offset into the right layer
    // 偏移到正确的层
    v_zIndex = cellIndex.z + u_zOffset;

    float x = v_zIndex * (u_gridResolution.x + 1.0) + cellIndex.x + 0.5;
    float y = cellIndex.y + 0.5;

    vec2 temp = vec2(
        (u_gridResolution.x + 1.0) * (u_gridResolution.z + 1.0),
        u_gridResolution.y + 1.0
    );
    vec2 textureCoordinates = vec2(x,y) / temp;
    gl_Position = vec4(textureCoordinates * 2.0 - 1.0, 0.0, 1.0);
}
