import { vec3 } from 'gl-matrix';

import { Cube } from './cube.js';
import { Plane } from './plane.js';
import { Camera } from './camera.js';
import { Pipeline } from './pipeline.js';

import primitiveVs from './shaders/primitive.vert';
import surfaceFs from './shaders/surface.frag';

main();

function main() {
    const canvas = document.querySelector('#glcanvas');
    const gl = canvas.getContext('webgl');

    /*
    var spector = new SPECTOR.Spector();
    spector.displayUI();
    spector.spyCanvases();
    */

    // If we don't have a GL context, give up now
    if (!gl) {
        alert('Unable to initialize WebGL. Your browser or machine may not support it.');
        return;
    }

    let camera = new Camera(gl);

    const cubes = [
        new Cube(gl, vec3.fromValues(0.0, 0.0, 0.0)),
        new Cube(gl, vec3.fromValues(5.0, 2.0, 1.0)),
        new Cube(gl, vec3.fromValues(0.0, 0.0, 0.0)),
        new Cube(gl, vec3.fromValues(0.0, 0.0, 0.0)),
        new Cube(gl, vec3.fromValues(0.0, 0.0, 0.0)),
        new Cube(gl, vec3.fromValues(0.0, 0.0, 0.0))
    ];

    const plane = new Plane(gl);

    const nodes = [ ...cubes, plane ];

    const locations = {
        attribLocations: [
            'aVertexPosition',
            'aVertexNormal',
        ],
        uniformLocations: [
            'uProjectionMatrix',
            'uModelMatrix',
            'uViewMatrix',
            'uSampler'
        ],
    };
    const pipeline = new Pipeline(gl, primitiveVs, surfaceFs, locations);

    var then = 0;

    // Draw the scene repeatedly
    function render(now) {
        now *= 0.001;  // convert to seconds
        const deltaTime = now - then;
        then = now;

        for (let cube of cubes) {
            cube.update(deltaTime);
        }

        clear(gl);
        drawScene(gl, pipeline, camera, nodes);

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

//
// Draw the scene.
//
function clear(gl) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

    // Clear the canvas before we start drawing on it.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function drawScene(gl, pipeline, camera, nodes) {
    // Tell WebGL to use our program when drawing
    gl.useProgram(pipeline.shaderProgram);

    // Bind camera matrix uniforms
    gl.uniformMatrix4fv(
        pipeline.uniformLocations['uProjectionMatrix'],
        false,
        camera.projectionMatrix
    );
    gl.uniformMatrix4fv(
        pipeline.uniformLocations['uViewMatrix'],
        false,
        camera.viewMatrix
    );

    for (const node of nodes) {
        node.draw(pipeline);
    }
}
