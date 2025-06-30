import GL from './gl';

console.log('Initializing application...');

const gl = new GL();
console.log('GL instance created:', gl);

// Verify GL initialization
if (!gl.fbo) {
  console.error('GL initialization failed - FBO not created');
}

window.gl = gl;
export default gl;
