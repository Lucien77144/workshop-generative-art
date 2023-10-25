import Experience from './../../Experience'
import { Mesh, CatmullRomCurve3, Vector3, TubeGeometry, Group } from 'three'
import Alea from 'alea'
import StemMaterial from './shaders/StemMaterial'
import gsap from 'gsap'

export default class Flowers {
    constructor(_options) {
        this.experience = new Experience()
        this.scene = _options.scene
        this.config = this.experience.config
        this.resources = this.experience.resources
        this.prng = new Alea(this.experience.dateFactor.value)

        this.init()
    }

    init() {
        const RADIUS = 4.5
        const redFlower = this.resources.items.redFlower.scene
        const blueFlower = this.resources.items.blueFlower.scene
        const pinkFlower = this.resources.items.pinkFlower.scene

        this.flowers = new Group()

        this.stemMaterial = new StemMaterial({}, this.experience.time)

        const dateFactor = this.experience.dateFactor.value * 100
        const chanceFactor = Math.min(dateFactor * 0.008, 1)
        for (let i = 0; i < dateFactor; i++) {
            let flowerToAdd = null

            // Chance factor to have a blue flower
            if (this.prng() < chanceFactor) {
                flowerToAdd = this.prng() < 0.1 ? pinkFlower : blueFlower
            } else {
                flowerToAdd = redFlower
            }

            const angle = (i / dateFactor) * Math.PI * 2
            const x = RADIUS * Math.cos(angle)
            const z = RADIUS * Math.sin(angle)

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

            const stemGeometry = new TubeGeometry(curve, 15, 0.12, 3, false)
            const stem = new Mesh(stemGeometry, this.stemMaterial)

            // Stock random values for each flower, can be used later
            stem.random = this.prng()

            flowerToAdd.position.copy(curve.getPointAt(1))
            const dir = curve
                .getPointAt(1)
                .sub(curve.getPointAt(0.8))
                .normalize()

            flowerToAdd.children[0].scale.set(0, 0, 0)
            stem.targetVec = flowerToAdd.position.clone().add(dir)
            flowerToAdd.lookAt(stem.targetVec)

            // Offset to make the flower look at the right direction
            flowerToAdd.rotateOnAxis(new Vector3(1, 0, 0), Math.PI * 0.5)
            flowerGroup.add(flowerToAdd.clone())

            flowerGroup.scale.set(0, 0, 0)
            flowerGroup.add(stem)

            flowerGroup.delay = Math.abs(this.prng() * 2)
            flowerGroup.hasAnimated = false

            flowerGroup.position.set(
                x + this.prng() * Math.sin(i) * 2,
                -0.05,
                z - this.prng() * Math.sin(i) * 2
            )

            /**
             * Animation
             */
            const { random } = flowerGroup.children[1]

            // Animate entire group
            gsap.to(flowerGroup.scale, {
                x: stem.random * (0.5 - 0.2) + 0.2,
                y: stem.random * (0.5 - 0.2) + 0.2,
                z: stem.random * (0.5 - 0.2) + 0.2,
                delay: 0.5 + random * 3,
                duration: 1,
                ease: 'ease.inOut',
                onComplete: () => {
                    // Animate the flower
                    gsap.to(flowerGroup.children[0].children[0].scale, {
                        x: random * (0.075 - 0.06) + 0.06,
                        y: random * (0.075 - 0.06) + 0.06,
                        z: random * (0.075 - 0.06) + 0.06,
                        duration: 2,
                        ease: 'power3.out',
                    })
                },
            })

            this.flowers.add(flowerGroup)
        }

        this.scene.add(this.flowers)
    }

    resize() {}

    update() {
        if (this.flowers.children) {
            this.flowers.children.forEach((flowerGroup) => {
                // Rotate flowers
                flowerGroup.children[0].children[0].rotation.y +=
                    flowerGroup.children[1].random < 0.5 ? -0.001 : 0.001
            })
        }

        if (this.experience.time.elapsed < 6000) {
            StemMaterial.update()
        } else {
            return
        }
    }

    destroy() {}
}
