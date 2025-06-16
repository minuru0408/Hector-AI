const canvas = document.getElementById('canvas');
const gl = canvas.getContext('webgl2');

if (!gl) {
    alert('WebGL2 is not supported in your browser');
}

// Set canvas size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
}

// Handle window resize
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Clear to black
gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);
