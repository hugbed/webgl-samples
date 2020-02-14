import { vec3 } from 'gl-matrix';

import { Cube } from './cube.js';
import { Plane } from './plane.js';
import { Camera } from './camera.js';
import { Pipeline } from './pipeline.js';
import { BoundingBox } from './bounding_box.js';

import primitiveVs from './shaders/primitive.vert';
import surfaceFs from './shaders/surface.frag';

main();

function main() {
    const canvas = document.querySelector('#glcanvas');
    const gl = canvas.getContext('webgl');

    // If we don't have a GL context, give up now
    if (!gl) {
        alert('Unable to initialize WebGL. Your browser or machine may not support it.');
        return;
    }

    /*
        var spector = new SPECTOR.Spector();
        spector.displayUI();
        spector.spyCanvases();
    */
   
    // Init shaders
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

    // Create objects to render
    let camera = new Camera(gl);

    const cubes = [
        new Cube(gl, vec3.fromValues(-5.0, 2.5, -3.0)),
        new Cube(gl, vec3.fromValues(5.0, 1.5, 0.0)),
        new Cube(gl, vec3.fromValues(-2.0, 1.0, 4.0)),
        new Cube(gl, vec3.fromValues(1.0, 0.0, -3.0))
    ];

    const plane = new Plane(gl);

    const nodes = [ ...cubes, plane ];

    // Render loop
    var then = 0;
    function render(now) {
        now *= 0.001;  // convert to seconds
        const deltaTime = now - then;
        then = now;

        for (let cube of cubes) {
            cube.update(deltaTime);
        }

        // Compute shadow casters bounding box
        /* const box = */ computeBoundingBox(cubes);

        clear(gl);

        drawScene(gl, pipeline, camera, nodes);

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

function computeBoundingBox(objects) {
    let box = new BoundingBox();
    for (const obj of objects) {
        const objBox = obj.worldBoundingBox;

        vec3.min(box.min,
            box.min, objBox.min
        );
        vec3.max(box.max,
            box.max, objBox.max
        );
    }
    return box;
}

function clear(gl) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function drawScene(gl, pipeline, camera, nodes) {
    pipeline.bind();

    camera.bind(pipeline);

    for (const node of nodes) {
        node.draw(pipeline);
    }
}
