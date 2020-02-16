import { vec3 } from 'gl-matrix';

import { Cube } from './cube.js';
import { Plane } from './plane.js';
import { Camera } from './camera.js';
import { Pipeline } from './pipeline.js';
import { BoundingBox } from './bounding_box.js';
import { ShadowMap } from './shadow_map.js';
import { TexturedQuad } from './textured_quad';

import primitiveVs from './shaders/primitive.vert';
import surfaceFs from './shaders/surface.frag';

main();

function main() {
    const canvas = document.querySelector('#glcanvas');
    const gl = canvas.getContext('webgl');

    // We'll use depth textures for the shadow maps
    const ext = gl.getExtension('WEBGL_depth_texture');
    if (!ext) {
        return alert('need WEBGL_depth_texture');
    }

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
            'uViewMatrix'
        ],
    };
    const pipeline = new Pipeline(gl, primitiveVs, surfaceFs, locations);
    const shadowPipeline = ShadowMap.createPipeline(gl); // todo: put in ShadowMap for simplicity

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

    // Shadow map
    let shadowMap = new ShadowMap(gl);
    const texturedQuad = new TexturedQuad(gl, shadowMap.depthTexture);

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
        const box = computeBoundingBox(cubes);
        shadowMap.updateTransforms(box);

        // render to the shadow map
        gl.bindFramebuffer(gl.FRAMEBUFFER, shadowMap.framebuffer);
        gl.viewport(0, 0, 1024, 1024);
        drawScene(gl, shadowPipeline, shadowMap, nodes);

        // render to the canvas
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        drawScene(gl, pipeline, camera, nodes);
        texturedQuad.draw();

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
    // Clear attachments
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function drawScene(gl, pipeline, camera, nodes) {
    clear(gl);

    pipeline.bind();

    camera.bind(pipeline);

    for (const node of nodes) {
        node.draw(pipeline);
    }
}
