import * as THREE from 'three';

const BLADE_WIDTH = 0.05;
const BLADE_HEIGHT = 0.005;
const BLADE_HEIGHT_VARIATION = 0.5;
const BLADE_VERTEX_COUNT = 5;
const BLADE_TIP_OFFSET = 0.1;

export class GrassGeometry extends THREE.BufferGeometry {
  constructor(params) {
    super();
    this.maxHeight = BLADE_HEIGHT_VARIATION + BLADE_HEIGHT;

    const positions = [];
    const indices = [];

    const getRdmCoordFromAxe = (axe) => { return (params.size[axe] / 2) * (Math.random() - .5) * 2 };
    for (let i = 0; i < params.count; i++) {
      const x = getRdmCoordFromAxe('x');
      const z = getRdmCoordFromAxe('z');
      
      const blade = this.computeBlade([x, 0, z], i * BLADE_VERTEX_COUNT);
      positions.push(...blade.positions);
      indices.push(...blade.indices);
    }

    this.setAttribute('position', new THREE.BufferAttribute(new Float32Array(new Float32Array(positions)), 3) );
    this.setIndex(indices);
    this.computeVertexNormals();
  }

  getRandomCoords() {
    const res = new Array(2);
    for (let i = 0; i < 2; i++) {
      const rdm = Math.random() * Math.PI * 2;
      res[i] = [Math.sin(rdm), 0, -Math.cos(rdm)];
    }
    return res;
  };

  // Grass blade generation, modified from https://smythdesign.com/blog/stylized-grass-webgl
  computeBlade(center, index = 0) {
    const height = BLADE_HEIGHT + Math.random() * BLADE_HEIGHT_VARIATION;

    // Randomize blade orientation and tip angle
    const bladeData = this.getRandomCoords();

    // Calc bottom, middle, and tip vertices
    const bl = bladeData[0].map((n, i) => n * (BLADE_WIDTH / 2) * 1 + center[i]);   // bottom left
    const br = bladeData[0].map((n, i) => n * (BLADE_WIDTH / 2) * -1 + center[i]);  // bottom right
    const tl = bladeData[0].map((n, i) => n * (BLADE_WIDTH / 4) * 1 + center[i]);   // top left
    const tr = bladeData[0].map((n, i) => n * (BLADE_WIDTH / 4) * -1 + center[i]);  // top right
    const tc = bladeData[1].map((n, i) => n * BLADE_TIP_OFFSET + center[i]);        // top center

    // Attenuate height
    tl[1] += height / 2;  // top left
    tr[1] += height / 2;  // top right
    tc[1] += height;      // top center

    return {
      positions: [
        ...bl,
        ...br,
        ...tr,
        ...tl,
        ...tc
      ],
      indices: [
        index,
        index + 1,
        index + 2,
        index + 2,
        index + 4,
        index + 3,
        index + 3,
        index,
        index + 2
      ]
    }
  }
}
export default GrassGeometry;