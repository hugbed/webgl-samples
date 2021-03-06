import { vec3, mat4 } from 'gl-matrix';

import { Pipeline } from './pipeline.js';
import { BoundingBox } from './bounding_box.js';

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
        this.lightDir = vec3.fromValues(0.0, -1.0, 0.0); // we choose this as an example
        this._createPipeline();
        this._createTexture();
        this._createFramebuffer();
    }
    
    getViewMatrix() {
        // Set the drawing position to the "identity" point, which is
        // the center of the scene.
        let viewMatrix = mat4.create();

        // Up
        let right = vec3.fromValues(1.0, 0.0, 0.0);
        if (Math.abs(vec3.dot(this.lightDir, right)) > 0.9999) {
            right = vec3.fromValues(0.0, 0.0, 1.0);
        }
        const up = vec3.create();

        // View
        vec3.cross(up, this.lightDir, right);
        mat4.lookAt(viewMatrix,
            vec3.create(), // eye
            this.lightDir, // center
            up
        );

        return viewMatrix;
    }

    updateTransforms(boundingBox) {
        this.viewMatrix = this.getViewMatrix(this.lightDir);

        // Compute projection from view and scene
        let boxLight = boundingBox.clone();

        // in view space
        boxLight.transform(this.viewMatrix);

        this.projectionMatrix = mat4.create();
        mat4.ortho(this.projectionMatrix,
            boxLight.min[0], boxLight.max[0],
            boxLight.min[1], boxLight.max[1],
            -boxLight.max[2], -boxLight.min[2] // looking at -z
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

    // Bind as camera/view for rendering
    bindAsView() {
        this.pipeline.bind();
        this.gl.uniformMatrix4fv(
            this.pipeline.uniformLocations['uProjectionMatrix'],
            false,
            this.projectionMatrix
        );
        this.gl.uniformMatrix4fv(
            this.pipeline.uniformLocations['uViewMatrix'],
            false,
            this.viewMatrix
        );
    }

    _createTexture() {
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

    _createFramebuffer() {
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

    _createPipeline() {
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
        this.pipeline = new Pipeline(this.gl, shadowVs, shadowFs, locations);
    }
}

export { ShadowMap };
