import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { Events } from '../events';

import store from '../store';

import FBO from './FBO';

import simVertex from 'bundle-text:./shaders/simulation.vert.glsl';
import simFragment from 'bundle-text:./shaders/simulation.frag.glsl';

import particlesVertex from 'bundle-text:./shaders/particles.vert.glsl';
import particlesFragment from 'bundle-text:./shaders/particles.frag.glsl';
import fullScreenVertex from 'bundle-text:./shaders/fullscreen.vert.glsl';
import fullScreenFragment from 'bundle-text:./shaders/fullscreen.frag.glsl';

import { getRandomSpherePoint } from '../utils';

import GUI from '../gui';
console.log('GL class constructed');

export default class GL {
  constructor() {
    this.renderer = new THREE.WebGL1Renderer({ 
      antialias: true, 
      alpha: true, 
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.setSize(store.bounds.ww, store.bounds.wh);
    this.renderer.setClearColor(0x000000, 0);

    this.camera = new THREE.PerspectiveCamera(
      45,
      store.bounds.ww / store.bounds.wh,
      0.1,
      1000
    );
    this.camera.position.set(0, 0, 4);

    this.scene = new THREE.Scene();

    this.canvas = null;

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;

    this.clock = new THREE.Clock();
    this.time = null;

    // Initialize tweaks before anything else
    this.tweaks = {
      pointSize: 1.2,
      speed: 0.3,
      curlFreq: 0.25,
      opacity: 0.35,
    };

    this.isInitialized = false;

    this.init();
  }

  init() {
    console.log('Initializing GL...');
    this.addCanvas();
    this.setGui(); // Move GUI setup before FBO creation
    this.createFBO();
    this.createScreenQuad();
    
    // Only add events after everything is initialized
    if (this.fbo && this.fullScreenQuad) {
      this.isInitialized = true;
      this.addEvents();
      // Start animation loop
      this.renderer.setAnimationLoop(this.render.bind(this));
    } else {
      console.error('Initialization failed');
    }
  }

  addCanvas() {
    this.canvas = this.renderer.domElement;
    this.canvas.classList.add('webgl');
    document.body.appendChild(this.canvas);
  }

  addEvents() {
    // Remove tick event since we're using setAnimationLoop
    Events.on('resize', this.resize.bind(this));
  }

  setGui() {
    GUI.add(this.tweaks, 'pointSize', 1, 3, 0.1)
       .name('particle size')
       .onChange((value) => {
         if (this.renderMaterial) {
           this.renderMaterial.uniforms.uPointSize.value = value;
         }
       });

    GUI.add(this.tweaks, 'speed', 0.0, 1, 0.001)
       .onChange((value) => {
         if (this.simMaterial) {
           this.simMaterial.uniforms.uSpeed.value = value;
         }
       });

    GUI.add(this.tweaks, 'curlFreq', 0, 0.6, 0.01)
       .name('noise frequency')
       .onChange((value) => {
         if (this.simMaterial) {
           this.simMaterial.uniforms.uCurlFreq.value = value;
         }
       });

    GUI.add(this.tweaks, 'opacity', 0.1, 1.0, 0.01)
       .onChange((value) => {
         if (this.renderMaterial) {
           this.renderMaterial.uniforms.uOpacity.value = value;
         }
       });
  }

  createFBO() {
    // Add safety check
    if (!this.tweaks) {
      console.error('Cannot create FBO: tweaks not initialized');
      return;
    }

    console.log('Initializing FBO...');
    // width and height of FBO
    const width = 512;
    const height = 512;

    // Populate a Float32Array of random positions
    let length = width * height * 3;
    let data = new Float32Array(length);
    for (let i = 0; i < length; i += 3) {
      // Random positions inside a sphere
      const point = getRandomSpherePoint();
      data[i + 0] = point.x;
      data[i + 1] = point.y;
      data[i + 2] = point.z;      

      // // Replaced with this if you want 
      // // random positions inside a cube
      // data[i + 0] = Math.random() - 0.5;
      // data[i + 1] = Math.random() - 0.5;
      // data[i + 2] = Math.random() - 0.5;      
    }

    // Convert the data to a FloatTexture
    const positions = new THREE.DataTexture(data, width, height, THREE.RGBFormat, THREE.FloatType);
    positions.needsUpdate = true;

    // Simulation shader material used to update the particles' positions
    this.simMaterial = new THREE.ShaderMaterial({
      vertexShader: simVertex,
      fragmentShader: simFragment,
      uniforms: {
        positions: { value: positions },
        uTime: { value: 0 },
        uSpeed: { value: this.tweaks.speed },
        uCurlFreq: { value: this.tweaks.curlFreq },
      },
    });

    // Render shader material to display the particles on screen
    // the positions uniform will be set after the this.fbo.update() call
    this.renderMaterial = new THREE.ShaderMaterial({
      vertexShader: particlesVertex,
      fragmentShader: particlesFragment,
      uniforms: {
        positions: { value: null },
        uTime: { value: 0 },
        uPointSize: { value: this.tweaks.pointSize },
        uOpacity: { value: this.tweaks.opacity },
      },
      transparent: true,
      blending: THREE.AdditiveBlending
    });

    // Initialize the FBO
    this.fbo = new FBO(width, height, this.renderer, this.simMaterial, this.renderMaterial);
    // Add the particles to the scene
    this.scene.add(this.fbo.particles);

    // Add verification after FBO creation
    if (!this.fbo) {
      console.error('FBO failed to initialize');
      return;
    }
    console.log('FBO initialized successfully');
  }

  createScreenQuad() {
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      vertexShader: fullScreenVertex,
      fragmentShader: fullScreenFragment,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(store.bounds.ww, store.bounds.wh) },
      },
      depthTest: false,
      blending: THREE.AdditiveBlending      
    });

    this.fullScreenQuad = new THREE.Mesh(geometry, material);
    this.scene.add(this.fullScreenQuad);
  }

  resize() {
    if (!this.isInitialized) return;
    
    let width = store.bounds.ww;
    let height = store.bounds.wh;

    this.camera.aspect = width / height;
    this.renderer.setSize(width, height);
    this.camera.updateProjectionMatrix();

    if (this.fullScreenQuad) {
      this.fullScreenQuad.material.uniforms.uResolution.value.x = width;
      this.fullScreenQuad.material.uniforms.uResolution.value.y = height;
    }
  }

  render() {
    if (!this.isInitialized) return;

    this.controls.update();
    this.time = this.clock.getElapsedTime();

    try {
      this.fbo.update(this.time);
      this.fullScreenQuad.material.uniforms.uTime.value = this.time;
      this.renderer.render(this.scene, this.camera);
    } catch (error) {
      console.error('Render error:', error);
      this.isInitialized = false;
      this.renderer.setAnimationLoop(null);
    }
  }
}