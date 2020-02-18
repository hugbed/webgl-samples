attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

varying highp vec3 vFragPos;
varying highp vec3 vFragNormal;

void main(void) {
    vFragPos = vec3(uModelMatrix * vec4(aVertexPosition, 1.0));
    gl_Position = uProjectionMatrix * uViewMatrix * vec4(vFragPos, 1.0);
    vFragNormal = mat3(uModelMatrix) * aVertexNormal; // assume affine transformation
}
