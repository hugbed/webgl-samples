import { mat4 } from 'gl-matrix';

import { Cube } from './cube.js';
import { Plane } from './plane.js';

main();

//
// Start here
//
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

    // Vertex shader program

    const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec3 aVertexNormal;

    uniform mat4 uModelMatrix;
    uniform mat4 uViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying highp vec3 vFragNormal;

    void main(void) {
      gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * aVertexPosition;

      // assume affine transformation
      vFragNormal = mat3(uModelMatrix) * aVertexNormal;
    }
  `;

    // Fragment shader program

    const fsSource = `
    varying highp vec3 vFragNormal;

    uniform sampler2D uSampler;

    void main(void) {
      // Inputs
      highp vec3 normal = normalize(vFragNormal);

      // Light/Material properties
      highp vec3 lightDir = vec3(0.0, 1.0, 0.0);
      highp vec3 materialDiffuse = vec3(0.6, 0.1, 0.1);

      // Ambient
      highp vec3 ambient = vec3(0.2, 0.2, 0.2) * materialDiffuse;

      // Diffuse
      highp float k_d = max(dot(lightDir, normal), 0.0);
      highp vec3 diffuse = k_d * materialDiffuse; 

      // Combine light contributions
      highp vec3 color = ambient + diffuse;
      gl_FragColor = vec4(color.rgb, 1.0);
    }
  `;

    let cube = new Cube(gl);
    let plane = new Plane(gl);

    // Initialize a shader program; this is where all the lighting
    // for the vertices and so forth is established.
    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

    // Collect all the info needed to use the shader program.
    // Look up which attributes our shader program is using
    // for aVertexPosition, aVertexNormal,
    // and look up uniform locations.
    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            vertexNormal: gl.getAttribLocation(shaderProgram, 'aVertexNormal'),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
            modelMatrix: gl.getUniformLocation(shaderProgram, 'uModelMatrix'),
            viewMatrix: gl.getUniformLocation(shaderProgram, 'uViewMatrix'),
            uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
        },
    };

    var then = 0;

    // Draw the scene repeatedly
    function render(now) {
        now *= 0.001;  // convert to seconds
        const deltaTime = now - then;
        then = now;

        cube.update(deltaTime);

        drawScene(gl, programInfo, cube, plane);

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

function initCameraMatrices(gl) {
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
    const projectionMatrix = mat4.create();

    // note: glmatrix.js always has the first argument
    // as the destination to receive the result.
    mat4.perspective(projectionMatrix,
        fieldOfView,
        aspect,
        zNear,
        zFar);

    // Set the drawing position to the "identity" point, which is
    // the center of the scene.
    const viewMatrix = mat4.create();

    mat4.rotate(viewMatrix,
        viewMatrix,
        0.5,
        [1.0, 0.0, 0.0]);

    // Now move the drawing position a bit to where we want to
    // start drawing the square.
    mat4.translate(viewMatrix,     // destination matrix
        viewMatrix,     // matrix to translate
        [0.0, -6.0, -12.0]);  // amount to translate

    return {
        projection: projectionMatrix,
        view: viewMatrix
    };
}

//
// Draw the scene.
//
function drawScene(gl, programInfo, cube, plane) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

    // Clear the canvas before we start drawing on it.

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let cameraMatrices = initCameraMatrices(gl);

    // Tell WebGL to use our program when drawing
    gl.useProgram(programInfo.program);

    // Set the shader uniforms
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        cameraMatrices.projection);
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.viewMatrix,
        false,
        cameraMatrices.view);

    cube.draw(programInfo);
    plane.draw(programInfo);
}

//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    // Create the shader program

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // If creating the shader program failed, alert

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
    const shader = gl.createShader(type);

    // Send the source to the shader object

    gl.shaderSource(shader, source);

    // Compile the shader program

    gl.compileShader(shader);

    // See if it compiled successfully

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}
