import Experience from '../Experience';
import { AnimationMixer } from 'three';

export default class City {
  constructor(_options) {
    this.experience = new Experience();
    this.config = this.experience.config;
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;

    this.init();
  }

  init() {
    this.city = this.resources.items.city.scene;
    console.log(this.city);
    // this.mixer = new AnimationMixer(this.city);

    this.city.position.set(0, -1, 0);
    this.city.scale.set(0.5, 0.5, 0.5);

    this.scene.add(this.city);
    // this.elapsedTime = 0;
  }

  resize() {}

  update() {
    // this.deltaTime = this.time - window.performance.now();
    // this.elapsedTime = window.performance.now() * 0.001;
    // this.time = window.performance.now();
  }

  destroy() {}
}
