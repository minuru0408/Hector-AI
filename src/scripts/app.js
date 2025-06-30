import GL from './gl';

console.log('Initializing application...');

// Create instance of GL class
const gl = new GL();
console.log('GL instance created:', gl);

// Expose to window to prevent tree-shaking
window.gl = gl;

// Export for potential use elsewhere
export default gl;
