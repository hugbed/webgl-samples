varying highp vec3 vFragPos;
varying highp vec3 vFragNormal;

uniform highp mat4 uLightProj;
uniform highp mat4 uLightView;
uniform sampler2D uShadowMapSampler;

/// 1.0 means shadow, 0.0 no shadow
highp float computeShadow(highp vec3 fragPos, highp vec3 normal)
{
    highp vec4 fragLightPos = uLightProj * uLightView * vec4(fragPos, 1.0);

    highp vec3 projPos = fragLightPos.xyz / fragLightPos.w;
    projPos = 0.5 * projPos + 0.5;

    // Equivalent of GL_TEXTURE_BORDER_COLOR white
    if (projPos.x > 1.0 || projPos.x < -0.0 ||
        projPos.y > 1.0 || projPos.y < -0.0)
    {
        return 0.0;
    }

    // Objects outside the shadow bounding box will go out of the unit cube
    projPos = clamp(projPos, vec3(-1.0, -1.0, -1.0), vec3(1.0, 1.0, 1.0));
    
    highp vec3 lightDir = normalize(vec3(0.0, -1.0, 0.0));
    highp float bias = max(0.001 * (1.0 - dot(normal, lightDir)), 0.008);

    highp float fragLightDepth = projPos.z;
    highp float closestDepth = texture2D(uShadowMapSampler, projPos.xy).r;
    highp float shadow = fragLightDepth - bias > closestDepth ? 1.0 : 0.0;

    return shadow;
}

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

    // Shadow
    highp float shadow = computeShadow(vFragPos, normal);

    // Combine light contributions
    highp vec3 color = ambient + (1.0 - shadow) * diffuse;
    gl_FragColor = vec4(color.rgb, 1.0);
}

// y is right
