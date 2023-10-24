import Experience from './../../Experience'
import {
    Mesh,
    CatmullRomCurve3,
    Vector2,
    Vector3,
    TubeGeometry,
    Group,
    AxesHelper,
    ShaderMaterial,
} from 'three'
import Alea from 'alea'
import fragmentShader from './shaders/fragment.glsl?raw'
import vertexShader from './shaders/vertex.glsl?raw'

export default class Flowers {
    constructor(_options) {
        this.experience = new Experience()
        this.scene = _options.scene
        this.config = this.experience.config
        this.resources = this.experience.resources
        this.prng = new Alea(this.experience.inputDate)

        this.init()
    }

    init() {
        const _RADIUS = 4
        const alienFlower = this.resources.items.alienFlower.scene

        this.flowers = new Group()

        const material = new ShaderMaterial({
            fragmentShader,
            vertexShader,
            uniforms: {
                uFrequency: { value: new Vector2(10, 5) },
                uTime: { value: 0 },
                uInputDate: { value: this.experience.inputDate },
            },
        })

        for (let i = 0; i < this.experience.inputDate / 20; i++) {
            const sinus = Math.sin(i) * 10
            

            const angle = (i / (this.experience.inputDate / 20)) * Math.PI * 2
            const x = _RADIUS * Math.cos(angle)
            const z = _RADIUS * Math.sin(angle)

            const flowerGroup = new Group()

            const curve = new CatmullRomCurve3([
                new Vector3(
                    this.prng() < 0.5 ? -1 : 1, // x
                    0, // y
                    this.prng() < 0.5 ? -1 : 1 // z
                ),
                new Vector3(
                    0, // x
                    this.prng() * 1 + 2, // y
                    0 // z
                ),
                new Vector3(
                    this.prng() < 0.5 ? -1 : 1, // x
                    this.prng() * 2 + 5, // y
                    this.prng() < 0.5 ? -1 : 1 // z
                ),
            ])

            const geometry = new TubeGeometry(curve, 20, 0.09, 20, false)
            const flower = new Mesh(geometry, material)

            flower.scaleRandomVector = new Vector3(
                this.prng() * 0.2 + 0.5,
                this.prng() * 0.2 + 0.5,
                this.prng() * 0.2 + 0.5
            )

            alienFlower.position.copy(curve.getPointAt(1))
            const dir = curve
                .getPointAt(1)
                .sub(curve.getPointAt(0.99))
                .normalize()

            // TODO - Add some random in here
            // Real alien flower
            alienFlower.scale.set(0.5, 0.5, 0.5)

            // Leaf
            // alienFlower.scale.set(5, 5, 5)

            const targetPos = alienFlower.position.clone().add(dir)
            alienFlower.lookAt(targetPos)

            // const axesHelper = new AxesHelper(5)
            // alienFlower.add(axesHelper)

            alienFlower.rotateOnAxis(new Vector3(1, 0, 0), Math.PI * 0.5)

            flowerGroup.scale.set(0, 0, 0)
            flowerGroup.position.set(x + this.prng(), -0.05, z - this.prng())
            flowerGroup.add(alienFlower.clone())
            flowerGroup.add(flower)

            this.flowers.add(flowerGroup)
        }

        this.scene.add(this.flowers)
    }

    resize() {}

    update() {
        if (this.flowers.children) {
            this.flowers.children.forEach((flower) => {
                flower.children[1].material.uniforms.uTime.value += 0.01
            })
        }

        if (this.experience.time.elapsed > 5000) {
            return
        }
        for (let i = 0; i < this.flowers.children.length; i++) {
            const flower = this.flowers.children[i]
            const rand = flower.children[1].scaleRandomVector

            // TODO - Add some random in here
            flower.scale.lerp(rand, 0.01)
        }
    }

    destroy() {}
}
