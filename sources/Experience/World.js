import {
  HemisphereLight,
  AnimationMixer,
  EquirectangularReflectionMapping,
  DoubleSide,
  RepeatWrapping,
  Vector3,
} from 'three';
import Experience from './Experience.js';
import { MeshMatcapMaterial } from 'three';
import { Mesh } from 'three';
import { PlaneGeometry } from 'three';
import { ShaderMaterial } from 'three';
import { Vector2 } from 'three';
import fragmentShader from './shaders/2D.frag';
import vertexShader from './shaders/2D.vert';

export default class World {
  constructor(_options) {
    this.experience = new Experience();
    this.config = this.experience.config;
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.cursor = new Vector2();

    this.resources.on('groupEnd', (_group) => {
      if (_group.name === 'base') {
        // this.setupScene();
        this.setup2D();
      }
    });
  }

  //   setupScene() {
  //     const envmap = this.resources.items.env;
  //     envmap.mapping = EquirectangularReflectionMapping
  //     this.scene.environment = envmap;
  //     this.scene.background = envmap;
  //     console.log(envmap);

  //     this.hemi = new HemisphereLight(0xffffff, 0x444444);
  //     this.scene.add(this.hemi);

  //     this.caillou = this.resources.items.caillou.scene;

  //     this.robot = this.resources.items.robot;
  //     const mesh = this.robot.scene;
  //     mesh.scale.set(.1, .1, .1);
  //     mesh.position.set(0, .1, 0);

  //     this.mixer = new AnimationMixer(mesh);
  //     this.robot.animations.forEach(o => {
  //         const action = this.mixer.clipAction(o);
  //         action.play();
  //     });

  //     this.matcap = new MeshMatcapMaterial({
  //         matcap: this.resources.items.matcap,
  //     });
  //     mesh.traverse(o=> {
  //         if (o.isMesh) {
  //             o.material = this.matcap;
  //         }
  //     })

  //     this.time = window.performance.now();

  //     this.scene.add(mesh);
  //     this.scene.add(this.caillou);
  //   }

  setup2D() {
    window.addEventListener('mousemove', (event) => {
      this.cursor.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.cursor.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    const map = this.resources.items.carapuce;
    map.wrapS = map.wrapT = RepeatWrapping;

    const pos = new Vector3(1, 0, 0);

    this.plane = new Mesh(
      new PlaneGeometry(1, 1, 1, 1),
      new ShaderMaterial({
        map,
        side: DoubleSide,
        uniforms: {
          uImage: { value: map },
          uTime: { value: this.elapsedTime },
          uSize: { value: new Vector2(window.innerWidth, window.innerHeight) },
          uCursor: { value: this.cursor },
        },
        vertexShader,
        fragmentShader,
      })
    );

    this.plane.position.copy(pos);

    this.scene.add(this.plane);
    this.elapsedTime = 0;
  }

  resize() {}

  update() {
    // if (this.mixer) {
    //   const deltaTime = window.performance.now() - this.time;
    //   this.time = window.performance.now();
    //   this.mixer.update(deltaTime * 0.001);
    // }

    this.deltaTime = this.time - window.performance.now();
    this.elapsedTime = window.performance.now() * 0.001;
    this.time = window.performance.now();

    if (this.plane) {
      this.plane.material.uniforms.uTime.value = this.elapsedTime;

      const worldPosition = new Vector3();
      const cursorPosition = new Vector3();
      
      cursorPosition.set(
        this.cursor.x,
        this.cursor.y,
        this.experience.camera.instance.position.z
      );

      cursorPosition.unproject(this.experience.camera.instance);
      cursorPosition.sub(this.experience.camera.instance.position).normalize();

      this.plane.getWorldPosition(worldPosition);
      cursorPosition.multiplyScalar(
        -worldPosition.distanceTo(this.experience.camera.instance.position)
      );

      const pos = this.experience.camera.instance.position
        .clone()
        .add(cursorPosition);

      this.plane.material.uniforms.uCursor.value = pos.sub(worldPosition);
    }
  }

  destroy() {}
}
