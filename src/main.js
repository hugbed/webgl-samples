import { vec3 } from 'gl-matrix';

import { Cube } from './cube.js';
import { Plane } from './plane.js';
import { Camera } from './camera.js';
import { Pipeline } from './pipeline.js';
import { BoundingBox } from './bounding_box.js';
import { ShadowMap } from './shadow_map.js';
import { TextureHelper } from './textured_helper';
import { BoundingBoxHelper } from './bounding_box_helper';

import primitiveVs from './shaders/primitive.vert';
import surfaceFs from './shaders/surface.frag';

// Global settings
window.drawBoundingBox = false;

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

    // Init shaders for surface rendering
    const locations = {
        attribLocations: [
            'aVertexPosition',
            'aVertexNormal',
        ],
        uniformLocations: [
            'uProjectionMatrix',
            'uModelMatrix',
            'uViewMatrix',
            'uShadowMapSampler',
            'uLightProj',
            'uLightView'
        ],
    };
    const surfacePipeline = new Pipeline(gl, primitiveVs, surfaceFs, locations);
    
    // Init shaders for shadow rendering
    const shadowPipeline = ShadowMap.createPipeline(gl); // todo: put in ShadowMap for simplicity

    // Create scene objects
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
    let shadowCastersBox = new BoundingBox();
    const textureHelper = new TextureHelper(gl, shadowMap.depthTexture);
    let boxHelper = new BoundingBoxHelper(gl, shadowCastersBox);

    // Render loop
    var then = 0;
    function render(now) {
        now *= 0.001;  // convert to seconds
        const deltaTime = now - then;
        then = now;

        // Update
        for (let cube of cubes) {
            cube.update(deltaTime);
        }

        // Compute shadow casters bounding box
        updateBoundingBox(shadowCastersBox, cubes);
        boxHelper.updateBoundingBox(shadowCastersBox);
        shadowMap.updateTransforms(shadowCastersBox);

        // Render to the shadow map
        {
            gl.bindFramebuffer(gl.FRAMEBUFFER, shadowMap.framebuffer);
            gl.viewport(0, 0, 1024, 1024);
            clear(gl);

            shadowPipeline.bind();
            shadowMap.bindAsView(shadowPipeline);
            for (const node of cubes) {
                node.draw(shadowPipeline);
            }
        }

        // Render to the canvas
        {
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
            clear(gl);

            // Draw objects with shadows
            surfacePipeline.bind();
            camera.bind(surfacePipeline);
            shadowMap.bind(surfacePipeline);
            for (const node of nodes) {
                node.draw(surfacePipeline);
            }

            // Draw helpers
            textureHelper.bind(camera);
            textureHelper.draw();

            if (window.drawBoundingBox) {
                gl.enable(gl.BLEND);
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
                boxHelper.draw(camera);
            }
        }

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

function updateBoundingBox(box, objects) {
    box.reset();
    for (const obj of objects) {
        const objBox = obj.getWorldBoundingBox();

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
