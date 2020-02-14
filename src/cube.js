import { vec3, mat4 } from 'gl-matrix';

import { BoundingBox } from "./bounding_box.js";

class Cube
{
    constructor(gl, position) {
        this.gl = gl;
        this.position = position;
        this.rotation = 0.0;
        this.modelMatrix = mat4.create();
        this.vertexBoundingBox = new BoundingBox();
        this.worldBoundingBox = new BoundingBox();

        this.createPositionBuffer();
        this.createIndexBuffer();
        this.createNormalBuffer();
    }

    update(deltaTime) {
        this.modelMatrix = mat4.create();

        mat4.translate(this.modelMatrix,
            this.modelMatrix,
            this.position);

        mat4.rotate(this.modelMatrix,  // destination matrix
            this.modelMatrix,  // matrix to rotate
            this.rotation,     // amount to rotate in radians
            [0, 0, 1]);       // axis to rotate around (Z)
        mat4.rotate(this.modelMatrix,  // destination matrix
            this.modelMatrix,  // matrix to rotate
            this.rotation * .7,// amount to rotate in radians
            [0, 1, 0]);       // axis to rotate around (X)

        // Update world bounding box
        this.worldBoundingBox = this.vertexBoundingBox.clone();
        this.worldBoundingBox.transform(this.modelMatrix);

        this.rotation += deltaTime;
    }

    draw(pipeline) {
        this.gl.uniformMatrix4fv(
            pipeline.uniformLocations['uModelMatrix'],
            false,
            this.modelMatrix
        );

        // Tell WebGL how to pull out the positions from the position
        // buffer into the vertexPosition attribute
        {
            const location = pipeline.attribLocations['aVertexPosition'];

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

        // Tell WebGL how to pull out the normals from
        // the normal buffer into the vertexNormal attribute.
        {
            const location = pipeline.attribLocations['aVertexNormal'];

            const numComponents = 3;
            const type = this.gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuffer);
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

    createPositionBuffer() {
        this.positionBuffer = this.gl.createBuffer();

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);

        const positions = [
            // Front face
            -1.0, -1.0,  1.0,     1.0, -1.0,  1.0,
            1.0,  1.0,  1.0,     -1.0,  1.0,  1.0,

            // Back face
            -1.0, -1.0, -1.0,    -1.0,  1.0, -1.0,
            1.0,  1.0, -1.0,      1.0, -1.0, -1.0,

            // Top face
            -1.0,  1.0, -1.0,    -1.0,  1.0,  1.0,
            1.0,  1.0,  1.0,      1.0,  1.0, -1.0,

            // Bottom face
            -1.0, -1.0, -1.0,     1.0, -1.0, -1.0,
            1.0, -1.0,  1.0,     -1.0, -1.0,  1.0,

            // Right face
            1.0, -1.0, -1.0,      1.0,  1.0, -1.0,
            1.0,  1.0,  1.0,      1.0, -1.0,  1.0,

            // Left face
            -1.0, -1.0, -1.0,    -1.0, -1.0,  1.0,
            -1.0,  1.0,  1.0,    -1.0,  1.0, -1.0,
        ];

        this.gl.bufferData(
            this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW
        );

        // Update bounding box
        this.vertexBoundingBox.min = vec3.fromValues(-1.0, -1.0, -1.0);
        this.vertexBoundingBox.max = vec3.fromValues(1.0, 1.0, 1.0);

        // Init to default world transform
        this.worldBoundingBox = this.vertexBoundingBox.clone();
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

    createNormalBuffer() {
        this.normalBuffer = this.gl.createBuffer();

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuffer);

        const vertexNormals = [
            // Front
            0.0,  0.0,  1.0,      0.0,  0.0,  1.0,
            0.0,  0.0,  1.0,      0.0,  0.0,  1.0,

            // Back
            0.0,  0.0, -1.0,      0.0,  0.0, -1.0,
            0.0,  0.0, -1.0,      0.0,  0.0, -1.0,

            // Top
            0.0,  1.0,  0.0,      0.0,  1.0,  0.0,
            0.0,  1.0,  0.0,      0.0,  1.0,  0.0,

            // Bottom
            0.0, -1.0,  0.0,      0.0, -1.0,  0.0,
            0.0, -1.0,  0.0,      0.0, -1.0,  0.0,

            // Right
            1.0,  0.0,  0.0,      1.0,  0.0,  0.0,
            1.0,  0.0,  0.0,      1.0,  0.0,  0.0,

            // Left
            -1.0,  0.0,  0.0,    -1.0,  0.0,  0.0,
            -1.0,  0.0,  0.0,    -1.0,  0.0,  0.0
        ];

        this.gl.bufferData(
            this.gl.ARRAY_BUFFER, new Float32Array(vertexNormals), this.gl.STATIC_DRAW
        );
    }
}

export { Cube };
