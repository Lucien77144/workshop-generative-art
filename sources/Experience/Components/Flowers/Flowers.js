import Experience from './../../Experience'
import {
    Mesh,
    CatmullRomCurve3,
    Vector3,
    TubeGeometry,
    Group,
    MeshPhongMaterial,
} from 'three'
import Alea from 'alea'
// import fragmentShader from './shaders/fragment.glsl?raw'
// import vertexShader from './shaders/vertex.glsl?raw'

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
        const redFlower = this.resources.items.redFlower.scene
        const blueFlower = this.resources.items.blueFlower.scene
        const pinkFlower = this.resources.items.pinkFlower.scene

        this.flowers = new Group()

        // const material = new ShaderMaterial({
        //     fragmentShader,
        //     vertexShader,
        //     uniforms: {
        //         uFrequency: { value: new Vector2(10, 5) },
        //         uTime: { value: 0 },
        //         uInputDate: { value: this.experience.inputDate },
        //     },
        // })

        const material = new MeshPhongMaterial({
            color: 0x3e9020,
            shininess: 100,
            specular: 0x000000,
        })

        for (let i = 0; i < this.experience.inputDate * 0.1; i++) {
            let flowerToAdd = null

            // Chance factor to have a blue flower
            const chanceFactor = Math.min(
                this.experience.inputDate * 0.0003333333333333333,
                1
            )
            if (this.prng() < chanceFactor) {
                flowerToAdd = this.prng() < 0.1 ? pinkFlower : blueFlower
            } else {
                flowerToAdd = redFlower
            }

            const angle = (i / (this.experience.inputDate * 0.1)) * Math.PI * 2
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
                    Math.abs(Math.sin(i) + 3), // y
                    Math.sin(i) * 0.5 * this.prng() * 3
                ),
                new Vector3(
                    Math.sin(i) * 0.5 * -this.prng() * 2,
                    Math.abs(Math.sin(i) + 5), // y
                    Math.sin(i) * 0.5 * -this.prng() * 2
                ),
            ])

            const geometry = new TubeGeometry(curve, 15, 0.12, 3, false)
            const flower = new Mesh(geometry, material)

            // Stock random values for each flower, can be used later
            flower.random = this.prng()
            flower.scaleRandomVector = new Vector3(
                flower.random * 0.1 + 0.3,
                flower.random * 0.1 + 0.3,
                flower.random * 0.1 + 0.3
            )

            flowerToAdd.position
                .copy(curve.getPointAt(1))
                .add(new Vector3(0, 0.3, 0))
            const dir = curve
                .getPointAt(1)
                .sub(curve.getPointAt(0.8))
                .normalize()

            flowerToAdd.scale.set(0.3, 0.3, 0.3)
            flower.targetVec = flowerToAdd.position.clone().add(dir)
            flowerToAdd.lookAt(flower.targetVec)

            // Offset to make the flower look at the right direction
            flowerToAdd.rotateOnAxis(new Vector3(1, 0, 0), Math.PI * 0.5)
            flowerGroup.add(flowerToAdd.clone())

            flowerGroup.add(flower)
            flowerGroup.scale.set(0, 0, 0)
            flowerGroup.position.set(
                x + this.prng() * Math.sin(i) * 2,
                -0.05,
                z - this.prng() * Math.sin(i) * 2
            )

            this.flowers.add(flowerGroup)
        }

        this.scene.add(this.flowers)
    }

    resize() {}

    update() {
        if (this.flowers.children) {
            this.flowers.children.forEach((flower) => {
                // flower.children[1].material.uniforms.uTime.value += 0.01

                flower.children[0].children[0].rotation.y +=
                    // TODO - Fix (rotation is always the same)
                    flower.random < 0.5 ? -0.001 : 0.001
            })
        }

        if (this.experience.time.elapsed > 8000) {
            return
        }
        for (let i = 0; i < this.flowers.children.length; i++) {
            const flower = this.flowers.children[i]
            const scaleRandomVector = flower.children[1].scaleRandomVector

            // TODO - Fix random in here
            flower.scale.lerp(scaleRandomVector, 0.01)
        }
    }

    destroy() {}
}
