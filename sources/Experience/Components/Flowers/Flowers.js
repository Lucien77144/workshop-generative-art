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
        // const alienFlower = this.resources.items.alienFlower.scene
        const redFlower = this.resources.items.redFlower.scene
        const blueFlower = this.resources.items.blueFlower.scene
        const pinkFlower = this.resources.items.pinkFlower.scene

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

        for (let i = 0; i < this.experience.inputDate / 10; i++) {
            const angle = (i / (this.experience.inputDate / 10)) * Math.PI * 2
            const x = _RADIUS * Math.cos(angle)
            const z = _RADIUS * Math.sin(angle)

            const flowerGroup = new Group()

            const curve = new CatmullRomCurve3([
                new Vector3(0, 0, 0),
                new Vector3(
                    Math.sin(i) * 0.5 * this.prng() * 2,
                    1, // y
                    Math.sin(i) * 0.5 * -this.prng() * 2
                ),
                new Vector3(
                    Math.sin(i) * 0.5 * -this.prng() * 3,
                    Math.abs((Math.sin(i) + 4)), // y
                    Math.sin(i) * 0.5 * this.prng() * 3
                ),
                new Vector3(
                    Math.sin(i) * 0.5 * -this.prng() * 2,
                    Math.abs((Math.sin(i) + 5)), // y
                    Math.sin(i) * 0.5 * -this.prng() * 2
                ),
            ])

            console.log(Math.abs(Math.sin(i) + 4))

            const geometry = new TubeGeometry(curve, 20, 0.09, 20, false)
            const flower = new Mesh(geometry, material)

            flower.scaleRandomVector = new Vector3(
                this.prng() * 0.1 + 0.3,
                this.prng() * 0.1 + 0.3,
                this.prng() * 0.1 + 0.3
            )

            redFlower.position.copy(curve.getPointAt(1))
            const dir = curve
                .getPointAt(1)
                .sub(curve.getPointAt(0.99))
                .normalize()

            redFlower.scale.set(0.3, 0.3, 0.3)

            const targetPos = redFlower.position.clone().add(dir)
            redFlower.lookAt(targetPos)

            // const axesHelper = new AxesHelper(5)
            // redFlower.add(axesHelper)

            redFlower.rotateOnAxis(new Vector3(1, 0, 0), Math.PI * 0.5)

            flowerGroup.scale.set(0, 0, 0)
            flowerGroup.position.set(x + this.prng(), -0.05, z - this.prng())
            flowerGroup.add(redFlower.clone())
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

        if (this.experience.time.elapsed > 8000) {
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
