import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';

export default class OrbScene {
  constructor() {
    this.renderer = null;
    this.camera = null;
    this.scene = null;
    this.particles = null;
    this.controls = null;
    this.isActive = false;
    this.rotationSpeed = 0.001;

    console.log('OrbScene constructed');

    if (typeof window !== 'undefined') {
      if (document.readyState === 'complete') {
        this.init();
      } else {
        window.addEventListener('DOMContentLoaded', () => this.init());
      }
    }
  }

  init() {
    try {
      console.log('Initializing WebGL renderer');
      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance"
      });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setClearColor(0xffffff, 1); // white background
      document.body.appendChild(this.renderer.domElement);
      console.log('Renderer added to DOM');

      this.setupScene();
      console.log('Scene setup complete');
      this.isActive = true;
      this.animate();
    } catch (error) {
      console.error('Failed to initialize WebGL:', error);
      throw new Error('WebGL initialization failed');
    }
  }

  setupScene() {
    console.log('Setting up scene');
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.z = 5;
    this.camera.lookAt(0, 0, 0);

    this.scene = new THREE.Scene();

    // 🔴 Debug sphere in center
    const debugSphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.5),
      new THREE.MeshBasicMaterial({ color: 0xff0000 })
    );
    this.scene.add(debugSphere);

    // 🌌 Particle geometry
    const geometry = new THREE.BufferGeometry();
    const particleCount = 5000;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i]     = (Math.random() - 0.5) * 4;
      positions[i + 1] = (Math.random() - 0.5) * 4;
      positions[i + 2] = (Math.random() - 0.5) * 4;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // ✨ Particle material
    this.material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.1,
      transparent: true,
      opacity: 1.0
    });

    this.particles = new THREE.Points(geometry, this.material);
    this.scene.add(this.particles);

    // 🌀 Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    // 📐 Resize
    this.handleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResize);

    // 🛠️ dat.GUI controls
    this.initGUI();
  }

  initGUI() {
    const gui = new dat.GUI();
    const settings = {
      pointSize: this.material.size,
      opacity: this.material.opacity,
      rotationSpeed: this.rotationSpeed,
      color: '#' + this.material.color.getHexString()
    };

    gui.add(settings, 'pointSize', 0.01, 1).onChange((value) => {
      this.material.size = value;
    });

    gui.add(settings, 'opacity', 0, 1).onChange((value) => {
      this.material.opacity = value;
    });

    gui.add(settings, 'rotationSpeed', 0, 0.05).onChange((value) => {
      this.rotationSpeed = value;
    });

    gui.addColor(settings, 'color').onChange((value) => {
      this.material.color.set(value);
    });
  }

  handleResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    if (!this.isActive) return;
    if (!this._loggedAnimation) {
      console.log('Animation started');
      this._loggedAnimation = true;
    }

    requestAnimationFrame(() => this.animate());

    this.particles.rotation.y += this.rotationSpeed;

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.isActive = false;
    window.removeEventListener('resize', this.handleResize);

    this.particles.geometry.dispose();
    this.particles.material.dispose();
    this.scene.remove(this.particles);

    this.renderer.dispose();
    this.controls.dispose();
  }
}
