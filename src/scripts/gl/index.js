import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default class OrbScene {
  constructor() {
    // Remove early WebGL check
    // Initialize properties
    this.renderer = null;
    this.camera = null;
    this.scene = null;
    this.particles = null;
    this.controls = null;
    this.isActive = false;

    // Wait for document to be available
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
      // Initialize renderer
      this.renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true,
        powerPreference: "high-performance" 
      });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setClearColor(0x111111, 1);
      document.body.appendChild(this.renderer.domElement);

      // Initialize scene only after successful renderer creation
      this.setupScene();
      this.isActive = true;
      this.animate();
    } catch (error) {
      console.error('Failed to initialize WebGL:', error);
      throw new Error('WebGL initialization failed');
    }
  }

  setupScene() {
    // Move scene setup here
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.z = 5;
    this.camera.lookAt(0, 0, 0);

    this.scene = new THREE.Scene();

    // Improved particle system
    const geometry = new THREE.BufferGeometry();
    const particleCount = 15000;
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
      const radius = 2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      
      positions[i] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i + 2] = radius * Math.cos(phi);
    }

    console.log('First particle position:', positions[0], positions[1], positions[2]);
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // 5. Material (what the points look like)
    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.1,
      transparent: true,
      opacity: 1.0
    });

    // 6. Particles (the visible cloud)
    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);

    // 7. Controls (mouse orbit)
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    // Add resize handler
    this.handleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResize);
  }

  checkWebGLSupport() {
    try {
      return !!window.WebGLRenderingContext;
    } catch(e) {
      return false;
    }
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

    console.log('Animating...');

    requestAnimationFrame(() => this.animate());

    // spin the particles slowly
    this.particles.rotation.y += 0.001;

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
