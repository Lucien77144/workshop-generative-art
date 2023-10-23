import Experience from '../Experience';
import Stencil from './Stencil';
import Screen from './Screen';
import { LAYERS } from '../Const/const';
import { MeshPhongMaterial } from 'three';

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
    this.terminal.traverse((o) => {
      if (o.material?.name == 'Screen') {
        this.screenStencil = new Stencil({
          target: o,
          instance: Screen,
        });
        o.layers.set(LAYERS.MASK);
      }
    });
    this.terminal.position.set(0, 0, 0);

    this.scene.add(this.terminal);
  }

  resize() {}

  update() {}

  destroy() {}
}
