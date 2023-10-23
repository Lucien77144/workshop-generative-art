import { AmbientLight } from 'three';
import Experience from './Experience.js';
import Terminal from './Components/Terminal.js';
import Floor from './Components/Floor.js';

export default class World {
  constructor(_options) {
    this.experience = new Experience();
    this.config = this.experience.config;
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;

    this.resources.on('groupEnd', (_group) => {
      if (_group.name === 'base') {
        this.init();
      }
    });
  }

  init() {
    this.light = new AmbientLight(0xaaffaa, 1);
    this.scene.add(this.light);

    this.terminal = new Terminal();
    this.floor = new Floor();

    this.elapsedTime = 0;
  }

  resize() {}

  update() {
    this.deltaTime = this.time - window.performance.now();
    this.elapsedTime = window.performance.now() * 0.001;
    this.time = window.performance.now();
  }

  destroy() {}
}
