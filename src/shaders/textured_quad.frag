varying highp vec2 vTexCoord;

uniform sampler2D uSampler;

void main() {
    gl_FragColor = vec4(texture2D(uSampler, vTexCoord).rrr, 1.0);
}
