import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib';


export default class OrbScene {
  constructor() {
    // 1. Renderer (like a projector)
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x000000, 0);
    document.body.appendChild(this.renderer.domElement);

    // 2. Camera (like your eyes)
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.z = 5;

    // 3. Scene (like a stage)
    this.scene = new THREE.Scene();

    // 4. Geometry (points in space)
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    for (let i = 0; i < 10000; i++) {
      const x = (Math.random() - 0.5) * 2;
      const y = (Math.random() - 0.5) * 2;
      const z = (Math.random() - 0.5) * 2;
      vertices.push(x, y, z);
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    // 5. Material (what the points look like)
    const material = new THREE.PointsMaterial({ color: 0xffffff, size: 0.01 });

    // 6. Particles (the visible cloud)
    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);

    // 7. Controls (mouse orbit)
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    // 8. Animation loop (keep redrawing)
    this.animate();
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // spin the particles slowly
    this.particles.rotation.y += 0.001;

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}
