import * as THREE from "three";

export default class FBO {
  constructor(width, height, renderer, simulationMaterial, renderMaterial) {
    this.width = width;
    this.height = height;
    this.renderer = renderer;
    this.simulationMaterial = simulationMaterial;
    this.renderMaterial = renderMaterial;

    // Create targets
    this.targetA = this.createRenderTarget();
    this.targetB = this.createRenderTarget();

    // Set initial positions
    this.renderer.setRenderTarget(this.targetA);
    this.renderer.render(this.getSimScene(), this.orthoCamera);
    this.renderer.setRenderTarget(null);

    // Create particle system
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(width * height * 3);
    const uvs = new Float32Array(width * height * 2);

    let p = 0;
    let u = 0;
    for (let i = 0; i < width; i++) {
      for (let j = 0; j < height; j++) {
        uvs[u++] = i / (width - 1);
        uvs[u++] = j / (height - 1);

        positions[p++] = 0;
        positions[p++] = 0;
        positions[p++] = 0;
      }
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));

    this.particles = new THREE.Points(geometry, this.renderMaterial);

    // Setup orthographic camera for simulation
    this.orthoCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.orthoScene = new THREE.Scene();
    const plane = new THREE.PlaneGeometry(2, 2);
    this.quad = new THREE.Mesh(plane, this.simulationMaterial);
    this.orthoScene.add(this.quad);

    // Set initial texture
    this.currentTarget = this.targetA;
    this.renderMaterial.uniforms.positions.value = this.targetA.texture;
  }

  createRenderTarget() {
    return new THREE.WebGLRenderTarget(this.width, this.height, {
      format: THREE.RGBFormat,
      type: THREE.FloatType,
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
    });
  }

  getSimScene() {
    return this.orthoScene;
  }

  swapTargets() {
    const temp = this.currentTarget;
    this.currentTarget =
      this.currentTarget === this.targetA ? this.targetB : this.targetA;

    // Update uniforms to use previous frame as input
    this.simulationMaterial.uniforms.positions.value = temp.texture;
    this.renderMaterial.uniforms.positions.value = this.currentTarget.texture;
  }

  update(time) {
    // Update simulation uniforms
    this.simulationMaterial.uniforms.uTime.value = time;

    // Render simulation to current target
    this.renderer.setRenderTarget(this.currentTarget);
    this.renderer.render(this.getSimScene(), this.orthoCamera);
    this.renderer.setRenderTarget(null);

    // Swap buffers for next frame
    this.swapTargets();
  }
}
