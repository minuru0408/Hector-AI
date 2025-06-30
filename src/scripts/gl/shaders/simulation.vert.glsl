varying vec2 vUv;

void main() {
  vUv = uv;

  // Use the built in vertex position for the fullscreen quad
  gl_Position = vec4(position, 1.0);
}