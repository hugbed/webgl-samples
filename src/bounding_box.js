import { vec3, vec4 } from 'gl-matrix';

class BoundingBox
{
    constructor() {
        this.reset();
    }

    reset() {
        const maxValue = Number.MAX_VALUE;
        this.min = vec3.fromValues(maxValue, maxValue, maxValue);
        this.max = vec3.fromValues(-maxValue, -maxValue, -maxValue);
    }

    static fromPoints(points) {
        let box = new BoundingBox();
        for (const p of points) {
            vec3.min(box.min, box.min, p);
            vec3.max(box.max, box.max, p);
        }
        return box;
    }

    intersects(box)
    {
        return (this.min[0] <= box.max[0] && this.max[0] >= box.min[0]) &&
               (this.min[1] <= box.max[1] && this.max[1] >= box.min[1]) &&
               (this.min[2] <= box.max[2] && this.max[2] >= box.min[2]);
    }

    getCorners() {
        return [
            vec3.fromValues(this.min[0], this.min[1], this.min[2]),
            vec3.fromValues(this.min[0], this.min[1], this.max[2]),
            vec3.fromValues(this.min[0], this.max[1], this.min[2]),
            vec3.fromValues(this.min[0], this.max[1], this.max[2]),
            vec3.fromValues(this.max[0], this.min[1], this.min[2]),
            vec3.fromValues(this.max[0], this.min[1], this.max[2]),
            vec3.fromValues(this.max[0], this.max[1], this.min[2]),
            vec3.fromValues(this.max[0], this.max[1], this.max[2])
        ];
    }

    clone() {
        let box = new BoundingBox();
        box.min = this.min;
        box.max = this.max;
        return box;
    }

    transform(transformMatrix) {
        // We can't just take the axis-aligned min/max we have
        // since this only applies to this coordinate
        // system. We need to reproject all box corners.
        const corners = this.getCorners();

        this.reset();
        for (const corner3 of corners) {
            // p = T * corner;
            const p4 = vec4.create();
            const corner4 = vec4.fromValues(corner3[0], corner3[1], corner3[2], 1.0);
            vec4.transformMat4(p4, corner4, transformMatrix);

            // keep min/max
            const p3 = vec3.fromValues(p4[0]/p4[3], p4[1]/p4[3], p4[2]/p4[3]);
            vec3.min(this.min, this.min, p3);
            vec3.max(this.max, this.max, p3);
        }
    }
}

export { BoundingBox };
