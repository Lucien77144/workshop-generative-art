import Experience from '../Experience'
import { AnimationMixer } from 'three'
import Flowers from './Flowers'
import { Wait } from '../Utils/Wait'

const w = new Wait()

export default class City {
    constructor(_options) {
        this.experience = new Experience()
        this.config = this.experience.config
        // this.group = _options.group
        this.resources = this.experience.resources
        this.scene = this.resources.items.city.scene
        this.animations = this.resources.items.city.animations
        this.timeout = null

        this.init()
        this.destroyBuildings()
        // this.generateGrass()
        // this.generateTrees()
    }

    init() {
        this.scene.position.set(0, -0.5, 0)
        this.scene.scale.set(0.5, 0.5, 0.5)

        // TEMPORARY
        // this.group.add(this.scene)
    }

    async destroyBuildings() {
        if (this.scene.visible) {
            this.mixer = new AnimationMixer(this.scene)

            for (const animation of this.animations) {
                const action = this.mixer.clipAction(animation)
                action.repetitions = 0
                action.clampWhenFinished = true

                if (
                    this.experience.inputDate >= 200 &&
                    animation.name.startsWith('Cube.009')
                ) {
                    action.play()
                }

                if (
                    this.experience.inputDate >= 300 &&
                    animation.name.startsWith('Cube.010')
                ) {
                    action.play()
                }

                if (
                    this.experience.inputDate >= 400 &&
                    animation.name.startsWith('Cube.003')
                ) {
                    action.play()
                }
            }

            await w.delay(3000)
            this.generateFlowers()
        }
    }

    generateFlowers() {
        this.flowers = new Flowers({
            scene: this.scene,
        })
    }

    resize() {}

    update() {
        if (this.flowers) {
            this.flowers.update()
        }

        if (this.mixer) {
            this.mixer.update(this.experience.time.delta * 0.0005)
        }
    }

    destroy() {
        // this.group.remove(this.scene)
        clearTimeout(this.timeout)
        w.kill()
    }
}
