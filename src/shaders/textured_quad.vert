attribute vec2 aVertexPosition;

varying highp vec2 vTexCoord;

void main() {
    highp vec2 center = vec2(-0.6, -0.6);
    highp vec2 size = vec2(0.35, 0.35);

    gl_Position = vec4(center + size * aVertexPosition, 0.0, 1.0);
    vTexCoord  = aVertexPosition.xy * 0.5 + vec2(0.5, 0.5);
}
