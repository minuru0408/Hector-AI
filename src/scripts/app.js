import GL from './gl';

console.log('Initializing application...');

const gl = new GL();
console.log('GL instance created:', gl);

window.gl = gl;
