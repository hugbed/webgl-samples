import { Pipeline } from './pipeline.js';

import primitiveVs from './shaders/primitive.vert';
import surfaceFs from './shaders/surface.frag';

class SurfaceMaterial
{
    constructor(gl) {
        this.gl = gl;
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
        this.pipeline = new Pipeline(this.gl, primitiveVs, surfaceFs, locations);
    }
}

export { SurfaceMaterial };