import { Mesh } from './mesh.js';

class Plane
{
    constructor(gl, size, pos_y) {
        this.gl = gl;

        const positions = [
            -size,  pos_y, -size,
            size,  pos_y, -size,
            -size,  pos_y,  size,
            size,  pos_y,  size,
        ];
        const indices = [
            2, 1, 0,
            3, 1, 2
        ];
        const normals = [
            0.0,  1.0,  0.0,
            0.0,  1.0,  0.0,
            0.0,  1.0,  0.0,
            0.0,  1.0,  0.0,
        ];
        this.mesh = new Mesh(gl, positions, indices, normals);
    }

    getWorldBoundingBox() { return this.mesh.worldBoundingBox; }

    draw(pipeline) { this.mesh.draw(pipeline); }
}

export { Plane };
