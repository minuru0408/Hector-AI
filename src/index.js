import config from './config';

const canvas = document.getElementById('canvas');
const gl = canvas.getContext('webgl2');

if (!gl) {
    alert('WebGL2 is not supported in your browser');
}

const vertexShader = createShader(gl.VERTEX_SHADER, `#version 300 es
    in vec4 position;
    void main() {
        gl_Position = position;
        gl_PointSize = ${config.particles.size}.0;
    }
`);

const fragmentShader = createShader(gl.FRAGMENT_SHADER, `#version 300 es
    precision highp float;
    uniform float opacity;
    out vec4 outColor;
    void main() {
        outColor = vec4(1.0, 0.5, 0.2, opacity);
    }
`);

function createShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

function render() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);
    const opacityLocation = gl.getUniformLocation(program, 'opacity');
    gl.uniform1f(opacityLocation, config.particles.opacity);

    requestAnimationFrame(render);
}

window.addEventListener('resize', render);
render();