import Experience from "webgl/Experience.js";
import { Color, DoubleSide, Mesh, MeshBasicMaterial, MirroredRepeatWrapping, NearestFilter, PlaneGeometry, RepeatWrapping, ShaderMaterial, Vector3 } from "three";
import dispVertex from "./shaders/Displacement/vertexShader.glsl";
import dispFragment from "./shaders/Displacement/fragmentShader.glsl";
import grassVertex from "./shaders/Grass/vertexShader.glsl";
import grassFragment from "./shaders/Grass/fragmentShader.glsl";
import GrassGeometry from "./GrassGeometry";
import Fireflies from "../Fireflies/Fireflies";

export default class GrassFloor {
  constructor({
    _position = new Vector3(0, 0, 0),
    _size = new Vector3(10, 1, 20),
    _count = 125000,
    _maps = {
      displacementMap: "displacementMap",
      mask: "grassMask",
      baseTexture: "dirtTexture",
      secondTexture: "mudTexture",
    },
    _colors = {
      base: new Color('#11382a'),
      set: [ // 4 colors to set, only the first not commented set is used
        {
          uColor1: { value: new Color('#15945d') },
          uColor2: { value: new Color('#0a9044') },
          uColor3: { value: new Color('#14857c') },
          uColor4: { value: new Color('#0ca87e') },
        },
      ]
    },
    _fireflies = {
      status: true,
      count: 750,
      instance: null,
    },
  } = {}) {
    this.experience = new Experience();
    this.world = this.experience.activeScene.world;
    this.resources = this.experience.resources;
    this.time = this.experience.time;
    this.debug = this.experience.debug;

    this.count = _count;
    this.position = _position;
    this.size = _size;
    this.name = `grassFloor-${this.experience.scene.children.filter((child) => child.name.includes("grassFloor")).length}`;
    this.colors = _colors;
    this.fireflies = _fireflies;

    this.grassParameters = {
      count: this.count,
      size: this.size,
      baseTexture: this.resources.items[_maps.baseTexture],
      secondTexture: this.resources.items[_maps.secondTexture],
      displacementMap: this.resources.items[_maps.displacementMap],
      mask: this.resources.items[_maps.mask],
      colors : this.colors,
    };

    this.setGround();
    this.setGrass();
    this.fireflies.status && this.setFireflies();
  }

  setGroundGeometry() {
    this.groundGeometry = new PlaneGeometry(this.grassParameters.size.x, this.grassParameters.size.z, 100, 100);
  }

  setGroundMaterial() {
    this.grassParameters.baseTexture.generateMipmaps = false;
    this.grassParameters.baseTexture.minFilter = NearestFilter;
    this.grassParameters.baseTexture.magFilter = NearestFilter;

    this.grassParameters.secondTexture.generateMipmaps = false;
    this.grassParameters.secondTexture.minFilter = NearestFilter;
    this.grassParameters.secondTexture.magFilter = NearestFilter;

    this.groundMaterial = new ShaderMaterial({
      uniforms: {
        uBaseTexture: { value: this.grassParameters.baseTexture },
        uSecondTexture: { value: this.grassParameters.secondTexture },
        uDisplacement: { value: this.grassParameters.displacementMap },
        uMask: { value: this.grassParameters.mask },
        uSize: { value: this.grassParameters.size },
        uBaseColor: { value: this.grassParameters.colors.base },
      },
      transparent: true,
      vertexShader: dispVertex,
      fragmentShader: dispFragment,
    });
  }

  setGround() {
    this.setGroundGeometry();
    this.setGroundMaterial();

    this.ground = new Mesh(this.groundGeometry, this.groundMaterial);
    this.ground.position.copy(this.position);
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.name = this.name;

    this.world.add(this.ground);
  }

  setGrass() {
    this.setGrassGeometry();
    this.setGrassMaterial();

    this.grass = new Mesh(this.grassGeometry, this.grassMaterial);
    this.grass.position.copy(this.ground.position);
    this.grass.name = this.name + "-blades";

    this.world.add(this.grass);
  }

  setGrassGeometry() {
    this.grassGeometry = new GrassGeometry(this.grassParameters);
  }

  setGrassMaterial() {
    this.grassMaterial = new ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uDisplacement: { value: this.grassParameters.displacementMap },
        uMask: { value: this.grassParameters.mask },
        uSize: { value: this.grassParameters.size },
        uMaxBladeSize: { value: this.grassGeometry.maxHeight },
        uBaseColor: { value: this.grassParameters.colors.base },
        ...this.grassParameters.colors.set[0],
      },
      side: DoubleSide,
      transparent: true,
      alphaTest: 0,
      vertexShader: grassVertex,
      fragmentShader: grassFragment,
    });
  }

  setFireflies() {
    this.fireflies.instance = new Fireflies({
      _count: this.fireflies.count,
      _position: this.position,
      _size: this.size,
    });
  }

  update() {
    if(this.grassMaterial?.uniforms?.uTime) this.grassMaterial.uniforms.uTime.value = this.time.elapsed;
    if(this.fireflies?.instance) this.fireflies.instance.update();
  }
}