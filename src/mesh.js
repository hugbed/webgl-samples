import { vec3, mat4 } from 'gl-matrix';

import { BoundingBox } from "./bounding_box.js";

class Mesh
{
    constructor(gl, vertices, indices, normals) {
        if (vertices.length % 3 != 0)
            console.error("Invalid number of vertices numbers, must be a multiple of 3");
        if (indices.length % 3 != 0)
            console.error("Invalid number of indices, must be a multiple of 3 for triangles");
        if (normals.length % 3 != 0)
            console.error("Invalid number of normals, must be a multiple of 3 for triangles");

        this.gl = gl;
        this.modelMatrix = mat4.create();
        this.vertexBoundingBox = new BoundingBox();
        this.worldBoundingBox = new BoundingBox();
        this.indexCount = indices.length;

        this._createPositionBuffer(vertices);
        this._createIndexBuffer(indices);
        this._createNormalBuffer(normals);
        this._updateBoundingBox(vertices);
    }

    updateTransform(modelMatrix) {
        this.modelMatrix = modelMatrix;

        // Update world bounding box
        this.worldBoundingBox = this.vertexBoundingBox.clone();
        this.worldBoundingBox.transform(this.modelMatrix);
    }

    draw(pipeline) {
        this.gl.uniformMatrix4fv(
            pipeline.uniformLocations['uModelMatrix'],
            false, this.modelMatrix
        );

        // Bind position buffer
        {
            const location = pipeline.attribLocations['aVertexPosition'];
            
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
            this.gl.vertexAttribPointer(
                location, 3, this.gl.FLOAT, false, 0, 0
            );
            this.gl.enableVertexAttribArray(location);
        }

        // Bind normal buffer
        {
            const location = pipeline.attribLocations['aVertexNormal'];

            if (this.normalBuffer !== undefined && location !== undefined) {
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuffer);
                this.gl.vertexAttribPointer(
                    location, 3, this.gl.FLOAT, false, 0, 0
                );
                this.gl.enableVertexAttribArray(location);
            }
        }

        // Bind index buffer
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        // Draw
        this.gl.drawElements(this.gl.TRIANGLES, this.indexCount, this.gl.UNSIGNED_SHORT, 0);
    }

    // ---- Private, don't touch ---- //

    _createPositionBuffer(vertices) {
        this.positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.bufferData(
            this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW
        );
    }

    _updateBoundingBox(vertices) {
        let p = vec3.fromValues(0.0, 0.0, 0.0);
        this.vertexBoundingBox.reset();
        for (let i = 0; i < vertices.length; i += 3) {
            p[0] = vertices[i];
            p[1] = vertices[i+1];
            p[2] = vertices[i+2];
            vec3.min(this.vertexBoundingBox.min, this.vertexBoundingBox.min, p);
            vec3.max(this.vertexBoundingBox.max, this.vertexBoundingBox.max, p);
        }

        // Update world bounding box
        this.worldBoundingBox = this.vertexBoundingBox.clone();
        this.worldBoundingBox.transform(this.modelMatrix);
    }

    _createIndexBuffer(indices) {
        this.indexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        this.gl.bufferData(
            this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this.gl.STATIC_DRAW
        );
    }

    _createNormalBuffer(normals) {
        if (normals.length == 0)
            return;

        this.normalBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuffer);
        this.gl.bufferData(
            this.gl.ARRAY_BUFFER, new Float32Array(normals), this.gl.STATIC_DRAW
        );
    }
}

export { Mesh };
