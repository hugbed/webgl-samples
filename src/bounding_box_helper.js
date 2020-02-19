import { Pipeline } from './pipeline.js';

const boundingBoxHelperVs = `
    attribute vec3 aVertexPosition;

    uniform mat4 uViewMatrix;
    uniform mat4 uProjectionMatrix;

    void main(void) {
        gl_Position = uProjectionMatrix * uViewMatrix * vec4(aVertexPosition, 1.0);
    }
`;

const boundingBoxHelperFs = `
    void main(void) {
        // Combine light contributions
        gl_FragColor = vec4(0.0, 1.0, 0.0, 0.5);
    }
`;

class BoundingBoxHelper {
    constructor(gl, boundingBox) {
        this.boundingBox = boundingBox;
        this.gl = gl;
        this.createPipeline();
        this.createOrUpdatePositionBuffer();
        this.createIndexBuffer();
    }

    updateBoundingBox(boundingBox) {
        this.boundingBox = boundingBox;
        this.createOrUpdatePositionBuffer();
    }

    draw(camera) {
        this.pipeline.bind();
        camera.bind(this.pipeline);

        // Tell WebGL how to pull out the positions from the position
        // buffer into the vertexPosition attribute
        {
            const location = this.pipeline.attribLocations['aVertexPosition'];
            
            const numComponents = 3;
            const type = this.gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
            this.gl.vertexAttribPointer(
                location,
                numComponents,
                type,
                normalize,
                stride,
                offset
            );
            this.gl.enableVertexAttribArray(location);
        }

        // Tell WebGL which indices to use to index the vertices
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        {
            const vertexCount = 36;
            const type = this.gl.UNSIGNED_SHORT;
            const offset = 0;
            this.gl.drawElements(this.gl.TRIANGLES, vertexCount, type, offset);
        }
    }

    createPipeline() {
        // Init shaders
        const locations = {
            attribLocations: [
                'aVertexPosition'
            ],
            uniformLocations: [
                'uProjectionMatrix',
                'uModelMatrix',
                'uViewMatrix'
            ]
        };
        this.pipeline = new Pipeline(
            this.gl,
            boundingBoxHelperVs, boundingBoxHelperFs,
            locations
        );
    }

    createOrUpdatePositionBuffer() {
        if (this.positionBuffer === undefined) {
            this.positionBuffer = this.gl.createBuffer();
        }

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);

        const min = this.boundingBox.min;
        const max = this.boundingBox.max;

        const positions = [
            // Front face
            min[0], min[1],  max[2],     max[0], min[1], max[2],
            max[0], max[1],  max[2],     min[0], max[1], max[2],

            // Back face
            min[0], min[1], min[2],      min[0], max[1], min[2],
            max[0], max[1], min[2],      max[0], min[1], min[2],

            // Top face
            min[0], max[1], min[2],      min[0], max[1], max[2],
            max[0], max[1], max[2],      max[0], max[1], min[2],

            // Bottom face
            min[0], min[1], min[2],      max[0], min[1], min[2],
            max[0], min[1], max[2],      min[0], min[1], max[2],

            // Right face
            max[0], min[1], min[2],      max[0], max[1], min[2],
            max[0], max[1], max[2],      max[0], min[1], max[2],

            // Left face
            min[0], min[1], min[2],      min[0], min[1], max[2],
            min[0], max[1], max[2],      min[0], max[1], min[2],
        ];

        this.gl.bufferData(
            this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW
        );
    }

    createIndexBuffer() {
        this.indexBuffer = this.gl.createBuffer();

        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        const indices = [
            0,  1,  2,      0,  2,  3,    // front
            4,  5,  6,      4,  6,  7,    // back
            8,  9,  10,     8,  10, 11,   // top
            12, 13, 14,     12, 14, 15,   // bottom
            16, 17, 18,     16, 18, 19,   // right
            20, 21, 22,     20, 22, 23,   // left
        ];

        this.gl.bufferData(
            this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this.gl.STATIC_DRAW
        );
    }
}

export { BoundingBoxHelper };