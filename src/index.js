import config from './config';

const canvas = document.getElementById('canvas');
const gl = canvas.getContext('webgl2', {
    alpha: true,
    premultipliedAlpha: false
});

if (!gl) {
    alert('WebGL2 is not supported in your browser');
}

// Create a grid of particles
const GRID_SIZE = 50;
const positions = new Float32Array(GRID_SIZE * GRID_SIZE * 2);
let index = 0;
for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
        positions[index++] = (i / GRID_SIZE) * 2 - 1;
        positions[index++] = (j / GRID_SIZE) * 2 - 1;
    }
}

// ... rest of WebGL setup and render code ...

function render() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // ...existing code...
}

// ...existing code...