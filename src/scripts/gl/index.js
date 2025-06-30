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
      this.renderer.setClearColor(0xffffff, 1);  // Changed to white background
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
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.z = 5;
    this.camera.lookAt(0, 0, 0);
  
    this.scene = new THREE.Scene();
  
    // ✅ Add red sphere for debugging
    const debugSphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.5),
      new THREE.MeshBasicMaterial({ color: 0xff0000 })
    );
    this.scene.add(debugSphere);
  
    // ✅ Create particle geometry
    const geometry = new THREE.BufferGeometry();
    const particleCount = 5000;
    const positions = new Float32Array(particleCount * 3);
  
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i]     = (Math.random() - 0.5) * 4;
      positions[i + 1] = (Math.random() - 0.5) * 4;
      positions[i + 2] = (Math.random() - 0.5) * 4;
    }
  
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  
    // ✅ Use bigger and visible white particles
    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.1,              // bigger
      transparent: false,
      opacity: 1.0
    });
  
    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  
    // ✅ OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
  
    // ✅ Resize support
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
