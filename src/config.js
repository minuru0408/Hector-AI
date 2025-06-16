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
const folder = gui.addFolder('Particles');
folder.add(config.particles, 'size', 0.1, 5.0).step(0.1);
folder.add(config.particles, 'speed', 0.0, 1.0).step(0.01);
folder.add(config.particles, 'noiseFrequency', 0.0, 2.0).step(0.1);
folder.add(config.particles, 'opacity', 0.0, 1.0).step(0.05);
folder.open();

export default config;
