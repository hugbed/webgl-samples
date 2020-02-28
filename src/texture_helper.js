import { Pipeline } from './pipeline.js';

const textureHelperVs = `
    attribute vec2 aVertexPosition;

    varying highp vec2 vTexCoord;

    void main() {
        highp vec2 center = vec2(-0.6, -0.6);
        highp vec2 size = vec2(0.35, 0.35);

        gl_Position = vec4(center + size * aVertexPosition, 0.0, 1.0);
        vTexCoord  = aVertexPosition.xy * 0.5 + vec2(0.5, 0.5);
    }
`;

const textureHelperFs = `
    varying highp vec2 vTexCoord;

    uniform sampler2D uSampler;

    void main() {
        gl_FragColor = vec4(texture2D(uSampler, vTexCoord).rrr, 1.0);
    }
`;

class TextureHelper {
    constructor(gl, texture) {
        this.gl = gl;
        this.texture = texture;
        this.createPositionBuffer();
        this.createPipeline();
    }

    createPipeline() {
        const locations = { attribLocations: [], uniformLocations: [ 'uSampler' ] };
        this.pipeline = new Pipeline(this.gl, textureHelperVs, textureHelperFs, locations);
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

export { TextureHelper };
