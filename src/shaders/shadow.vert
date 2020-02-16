attribute vec4 aVertexPosition;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

varying highp vec3 vFragNormal;

void main(void) {
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * aVertexPosition;
}
