import { AlwaysStencilFunc, MeshBasicMaterial, MeshPhongMaterial, ReplaceStencilOp } from 'three';
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

  setMaterial(materialName) {
    this.target.material = this[materialName];
  }

  init() {
    this.baseMat = new MeshPhongMaterial({ color: '#090909' });
    this.baseMat.depthWrite = false;
    this.baseMat.stencilWrite = true;
    this.baseMat.stencilRef = this.stencilRef;
    this.baseMat.stencilFunc = AlwaysStencilFunc;
    this.baseMat.stencilZPass = ReplaceStencilOp;

    this.maskMat = new MeshBasicMaterial({ color: '#ff0000' });

    this.setMaterial('stencilMat');

    this.instance = new this.instance({
      stencilRef: this.stencilRef,
    });
  }

  resize() {}

  update() {}

  destroy() {}
}
