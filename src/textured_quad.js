import { Pipeline } from './pipeline.js';

import texturedQuadVs from './shaders/textured_quad.vert';
import texturedQuadFs from './shaders/textured_quad.frag';

class TexturedQuad {
    constructor(gl, texture) {
        this.gl = gl;
        this.texture = texture;
        this.createPositionBuffer();
        this.createPipeline();
    }

    createPipeline() {
        const locations = { attribLocations: [], uniformLocations: [ 'uSampler' ] };
        this.pipeline = new Pipeline(this.gl, texturedQuadVs, texturedQuadFs, locations);
    }

    createPositionBuffer() {
        this.positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        const positions = [
            1.0,  1.0,
            -1.0,  1.0,
            1.0, -1.0,
            -1.0, -1.0,
        ];
        this.gl.bufferData(
            this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW
        );
    }

    draw() {
        this.pipeline.bind();

        {
            // Tell WebGL we want to affect texture unit 0
            this.gl.activeTexture(this.gl.TEXTURE0);

            // Bind the texture to texture unit 0
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);

            // Tell the shader we bound the texture to texture unit 0
            this.gl.uniform1i(this.pipeline.uniformLocations.uSampler, 0);
        }
        {
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
            this.gl.vertexAttribPointer(
                this.pipeline.attribLocations['aVertexPosition'], // location
                2, // numComponents
                this.gl.FLOAT, // type
                false, // normalize
                0, 0 // stride, offset
            );
            this.gl.enableVertexAttribArray(location);
        }

        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    }
}

export { TexturedQuad };
