import {
  BoxGeometry,
  DoubleSide,
  MeshBasicMaterial,
} from 'three';
import { Mesh } from 'three';
import { Vector2 } from 'three';
import Experience from '../Experience';

export default class Terminal {
  constructor(_options) {
    this.experience = new Experience();
    this.config = this.experience.config;
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;

    this.init();
  }

  init() {
    this.terminal = this.resources.items.terminal.scene;
    // console.log(this.terminal);

    this.terminal.position.set(0, 0, 0);

    this.scene.add(this.terminal);
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
