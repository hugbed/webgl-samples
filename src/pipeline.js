class Pipeline {
    constructor(gl, vsSource, fsSource, locations) {
        this.gl = gl;
        this.initShaderProgram(vsSource, fsSource);
        this.fetchLocations(locations);
    }
    
    initShaderProgram(vsSource, fsSource) {
        const vertexShader = this.loadShader(this.gl.VERTEX_SHADER, vsSource);
        const fragmentShader = this.loadShader(this.gl.FRAGMENT_SHADER, fsSource);

        this.shaderProgram = this.gl.createProgram();
        this.gl.attachShader(this.shaderProgram, vertexShader);
        this.gl.attachShader(this.shaderProgram, fragmentShader);
        this.gl.linkProgram(this.shaderProgram);

        if (!this.gl.getProgramParameter(this.shaderProgram, this.gl.LINK_STATUS)) {
            alert('Unable to initialize the shader program: ' + this.gl.getProgramInfoLog(this.shaderProgram));
            return null;
        }

        return this.shaderProgram;
    }

    fetchLocations(bindings) {
        this.attribLocations = new Map();
        if (bindings.attribLocations !== undefined) {
            for (const attrib of bindings.attribLocations) {
                this.attribLocations[attrib] = this.gl.getAttribLocation(this.shaderProgram, attrib);
            }
        }

        this.uniformLocations = new Map();
        if (bindings.uniformLocations !== undefined) {
            for (const uniform of bindings.uniformLocations) {
                this.uniformLocations[uniform] = this.gl.getUniformLocation(this.shaderProgram, uniform);
            }
        }
    }

    loadShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            alert('An error occurred compiling the shaders: ' + this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }

        return shader;
    }
}

export { Pipeline };
