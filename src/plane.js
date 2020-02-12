import { mat4 } from 'gl-matrix';

class Plane
{
    constructor(gl) {
        this.gl = gl;
        this.createPositionBuffer();
        this.createIndexBuffer();
        this.createNormalBuffer();
        this.modelMatrix = mat4.create();
    }

    draw(programInfo) {
        this.gl.uniformMatrix4fv(
            programInfo.uniformLocations['uModelMatrix'],
            false,
            this.modelMatrix
        );

        // Tell WebGL how to pull out the positions from the position
        // buffer into the vertexPosition attribute
        {
            const location = programInfo.attribLocations['aVertexPosition'];

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
            const location = programInfo.attribLocations['aVertexNormal'];

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
            const type = this.gl.UNSIGNED_SHORT;
            const offset = 0;
            this.gl.drawElements(this.gl.TRIANGLES, this.nbIndices, type, offset);
        }
    }

    createPositionBuffer() {
        this.positionBuffer = this.gl.createBuffer();

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);

        const positions = [
            -10.0,  -2.0, -10.0,
            10.0,  -2.0, -10.0,
            -10.0,  -2.0,  10.0,
            10.0,  -2.0,  10.0,
        ];

        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW);
    }

    createIndexBuffer() {
        this.indexBuffer = this.gl.createBuffer();

        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        const indices = [
            2, 1, 0,
            3, 1, 2
        ];
        this.nbIndices = indices.length;

        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER,
            new Uint16Array(indices), this.gl.STATIC_DRAW);
    }

    createNormalBuffer() {
        this.normalBuffer = this.gl.createBuffer();

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuffer);

        const vertexNormals = [
            0.0,  1.0,  0.0,
            0.0,  1.0,  0.0,
            0.0,  1.0,  0.0,
            0.0,  1.0,  0.0,
        ];

        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertexNormals),
            this.gl.STATIC_DRAW);
    }
}

export { Plane };
