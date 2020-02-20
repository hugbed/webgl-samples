import { vec3, mat4 } from 'gl-matrix';

import { Pipeline } from './pipeline.js';

const shadowVs = `
    attribute vec3 aVertexPosition;

    uniform mat4 uModelMatrix;
    uniform mat4 uViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying highp vec3 vFragNormal;

    void main(void) {
        gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aVertexPosition, 1.0);
    }
`;

const shadowFs = `
    void main(void) {
        /* gl_FragDepth is written automatically */
    }
`;

class ShadowMap
{
    constructor(gl) {
        this.gl = gl;
        this.createTexture();
        this.createFramebuffer();
    }
    
    updateTransforms(boundingBox) {
        // Set the drawing position to the "identity" point, which is
        // the center of the scene.
        this.viewMatrix = mat4.create();

        const lightDir = vec3.fromValues(0.0, -1.0, 0.0);

        let right = vec3.fromValues(1.0, 0.0, 0.0);
        if (Math.abs(vec3.dot(lightDir, right)) > 0.9999) {
            right = vec3.fromValues(0.0, 0.0, 1.0);
        }

        const up = vec3.create();
        vec3.cross(up, lightDir, right);

        mat4.lookAt(this.viewMatrix,
            vec3.create(), // eye
            lightDir, // center
            up
        );

        // Transform bounding into view space
        let viewBoundingBox = boundingBox.clone();
        viewBoundingBox.transform(this.viewMatrix);

        this.projectionMatrix = mat4.create();
        mat4.ortho(this.projectionMatrix,
            viewBoundingBox.min[0], viewBoundingBox.max[0],
            viewBoundingBox.min[1], viewBoundingBox.max[1],
            -viewBoundingBox.max[2], -viewBoundingBox.min[2] // looking at -z
        );
    }

    bind(pipeline) {
        // Bind shadow map texture
        {
            this.gl.activeTexture(this.gl.TEXTURE0);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.depthTexture);
            this.gl.uniform1i(pipeline.uniformLocations.uShadowMapSampler, 0);
        }

        this.gl.uniformMatrix4fv(
            pipeline.uniformLocations['uLightProj'],
            false,
            this.projectionMatrix
        );
        this.gl.uniformMatrix4fv(
            pipeline.uniformLocations['uLightView'],
            false,
            this.viewMatrix
        );
    }

    // Bind as camera for rendering
    bindAsView(pipeline) {
        this.gl.uniformMatrix4fv(
            pipeline.uniformLocations['uProjectionMatrix'],
            false,
            this.projectionMatrix
        );
        this.gl.uniformMatrix4fv(
            pipeline.uniformLocations['uViewMatrix'],
            false,
            this.viewMatrix
        );
    }

    createTexture() {
        // create to render to
        const targetTextureWidth = 1024;
        const targetTextureHeight = 1024;
        this.depthTexture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.depthTexture);
 
        {
            // define size and format of level 0
            this.gl.texImage2D(
                this.gl.TEXTURE_2D,
                0, // level
                this.gl.DEPTH_COMPONENT, // internalFormat
                targetTextureWidth, targetTextureHeight, 0, // border
                this.gl.DEPTH_COMPONENT, this.gl.UNSIGNED_INT,
                null);
 
            // set the filtering so we don't need mips
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        }
    }

    createFramebuffer() {
        // Create and bind the framebuffer
        this.framebuffer = this.gl.createFramebuffer();
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer);
 
        // attach the texture as the first color attachment
        this.gl.framebufferTexture2D(
            this.gl.FRAMEBUFFER,
            this.gl.DEPTH_ATTACHMENT, // attachmentPoint
            this.gl.TEXTURE_2D, this.depthTexture, 0 // mipLevel
        );
    }

    static createPipeline(gl) {
        const locations = {
            attribLocations: [
                'aVertexPosition'
            ],
            uniformLocations: [
                'uProjectionMatrix',
                'uModelMatrix',
                'uViewMatrix'
            ],
        };
        return new Pipeline(gl, shadowVs, shadowFs, locations);
    }
}

export { ShadowMap };
