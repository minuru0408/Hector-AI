import config from './config';

// Update fragment shader
const fragmentShaderSource = `#version 300 es
precision highp float;
uniform float opacity;
out vec4 outColor;
void main() {
    outColor = vec4(1, 0, 0.5, opacity);
}`;

function render() {
    // Update uniforms
    const opacityLocation = gl.getUniformLocation(program, 'opacity');
    gl.uniform1f(opacityLocation, config.particles.opacity);
    
    gl.drawArrays(gl.POINTS, 0, 3);
    requestAnimationFrame(render);
}