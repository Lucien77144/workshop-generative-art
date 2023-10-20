import {
  BoxGeometry,
  DoubleSide,
  MeshBasicMaterial,
} from 'three';
import Experience from './Experience.js';
import { Mesh } from 'three';
import { PlaneGeometry } from 'three';
import { Vector2 } from 'three';

export default class World {
  constructor(_options) {
    this.experience = new Experience();
    this.config = this.experience.config;
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.cursor = new Vector2();

    this.resources.on('groupEnd', (_group) => {
      if (_group.name === 'base') {
        this.setupScene();
      }
    });
  }

  setupScene() {
    this.box = new Mesh(
      new BoxGeometry(.2, .2, .2),
      new MeshBasicMaterial({
        color: 0xff0000,
        side: DoubleSide,
      })
    );

    this.box.position.set(0, 0, 0);

    this.scene.add(this.box);
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
