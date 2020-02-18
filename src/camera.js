import { mat4 } from 'gl-matrix';

// Just a fixed camera to look at the scene
class Camera {
    constructor(gl) {
        this.gl = gl;

        // Create a perspective matrix, a special matrix that is
        // used to simulate the distortion of perspective in a camera.
        // Our field of view is 45 degrees, with a width/height
        // ratio that matches the display size of the canvas
        // and we only want to see objects between 0.1 units
        // and 100 units away from the camera.
    
        const fieldOfView = 45 * Math.PI / 180;   // in radians
        const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        const zNear = 0.1;
        const zFar = 100.0;
        this.projectionMatrix = mat4.create();
    
        // note: glmatrix.js always has the first argument
        // as the destination to receive the result.
        mat4.perspective(this.projectionMatrix,
            fieldOfView,
            aspect,
            zNear,
            zFar
        );
    
        // Set the drawing position to the "identity" point, which is
        // the center of the scene.
        this.viewMatrix = mat4.create();
    
        mat4.lookAt(this.viewMatrix,
            [0.0, 10.0, -22],
            [0.0, 0.0, -5.0],
            [0.0, 1.0, 0.0]);
    }

    bind(pipeline) {
        this.gl.uniformMatrix4fv(
            pipeline.uniformLocations['uProjectionMatrix'],
            false,
            this.projectionMatrix
        );
        this.gl.uniformMatrix4fv(
            pipeline.uniformLocations['uViewMatrix'],
            false,
            this.viewMatrix
        );
    }
}

export { Camera };
