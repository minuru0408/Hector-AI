import * as dat from 'dat.gui';

const config = {
    particles: {
        size: 1.0,
        speed: 0.1,
        noiseFrequency: 0.4,
        opacity: 0.3
    }
};

// Create GUI
const gui = new dat.GUI();
const particlesFolder = gui.addFolder('Particles');
particlesFolder.add(config.particles, 'size', 0.1, 5.0).step(0.1);
particlesFolder.add(config.particles, 'speed', 0.0, 1.0).step(0.01);
particlesFolder.add(config.particles, 'noiseFrequency', 0.0, 2.0).step(0.1);
particlesFolder.add(config.particles, 'opacity', 0.0, 1.0).step(0.05);
particlesFolder.open();

export default config;
