import { mat4 } from 'gl-matrix';

import { Mesh } from "./mesh.js";

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
const indices = [
    0,  1,  2,      0,  2,  3,    // front
    4,  5,  6,      4,  6,  7,    // back
    8,  9,  10,     8,  10, 11,   // top
    12, 13, 14,     12, 14, 15,   // bottom
    16, 17, 18,     16, 18, 19,   // right
    20, 21, 22,     20, 22, 23,   // left
];
const normals = [
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

class Cube
{
    constructor(gl, position) {
        this.position = position;
        this.rotation = 0.0;
        this.mesh = new Mesh(gl, positions, indices, normals);
    }

    update(deltaTime) {
        this.modelMatrix = mat4.create();

        mat4.translate(this.modelMatrix,
            this.modelMatrix,
            this.position);

        mat4.rotate(this.modelMatrix,
            this.modelMatrix,
            this.rotation,
            [0, 0, 1]);

        mat4.rotate(this.modelMatrix,
            this.modelMatrix,
            this.rotation * .7,
            [0, 1, 0]);

        // Update world bounding box
        this.mesh.updateTransform(this.modelMatrix);

        this.rotation += deltaTime;
    }

    getWorldBoundingBox() { return this.mesh.worldBoundingBox; }

    draw(pipeline) { this.mesh.draw(pipeline); }
}

export { Cube };
