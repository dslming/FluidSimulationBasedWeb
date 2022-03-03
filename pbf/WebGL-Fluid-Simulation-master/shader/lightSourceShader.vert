// Vertex Shader

precision highp float;

attribute vec3 aVertexPosition;

uniform mat4 uPerspectiveMatrix;
uniform mat4 uModelMatrix;
uniform mat4 uCameraMatrix;


/**************************************************
 *
 * Main function
 *
 */
void main() {
    mat4 tMatrix = uPerspectiveMatrix * uCameraMatrix * uModelMatrix;
    
    gl_PointSize = 20.0;
    
    gl_Position = vec4(tMatrix * vec4(aVertexPosition, 1.0));
} 