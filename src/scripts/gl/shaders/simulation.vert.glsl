#version 100
varying vec2 vUv;
attribute vec2 position;

void main() {
  vUv = uv;
  
  gl_Position = vec4(position, 0.0, 1.0);
}