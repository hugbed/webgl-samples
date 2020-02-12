varying highp vec3 vFragNormal;

uniform sampler2D uSampler;

void main(void) {
    // Inputs
    highp vec3 normal = normalize(vFragNormal);

    // Light/Material properties
    highp vec3 lightDir = vec3(0.0, 1.0, 0.0);
    highp vec3 materialDiffuse = vec3(0.6, 0.1, 0.1);

    // Ambient
    highp vec3 ambient = vec3(0.2, 0.2, 0.2) * materialDiffuse;

    // Diffuse
    highp float k_d = max(dot(lightDir, normal), 0.0);
    highp vec3 diffuse = k_d * materialDiffuse; 

    // Combine light contributions
    highp vec3 color = ambient + diffuse;
    gl_FragColor = vec4(color.rgb, 1.0);
}
