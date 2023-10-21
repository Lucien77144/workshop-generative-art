import { AlwaysStencilFunc, MeshPhongMaterial, ReplaceStencilOp } from 'three';
import Experience from '../Experience';

let stencilRef = 1;
export default class Stencil {
  constructor(_options) {
    this.experience = new Experience();
    this.config = this.experience.config;
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.target = _options.target;
    this.instance = _options.instance;
    this.stencilRef = stencilRef++;

    this.init();
  }

  init() {
    this.target.material = new MeshPhongMaterial({ color: 'white' });
    this.target.material.depthWrite = false;
    this.target.material.stencilWrite = true;
    this.target.material.stencilRef = this.stencilRef;
    this.target.material.stencilFunc = AlwaysStencilFunc;
    this.target.material.stencilZPass = ReplaceStencilOp;

    this.instance = new this.instance({
      stencilRef: this.stencilRef,
    });
  }

  resize() {}

  update() {}

  destroy() {}
}
