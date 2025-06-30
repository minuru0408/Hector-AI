import OrbScene from './gl/index.js';

let gl;
try {
  gl = new OrbScene();
  window.gl = gl; // Prevent tree-shaking
} catch (error) {
  console.error('Failed to initialize 3D scene:', error);
}

export default gl;
