import Experience from './../Experience'
import { AnimationMixer } from 'three'
import Flowers from './Flowers/Flowers'
import { Wait } from '../Utils/Wait'

const w = new Wait()

export default class City {
    constructor(_options) {
        this.experience = new Experience()
        this.config = this.experience.config
        this.group = _options.group
        this.resources = this.experience.resources
        this.instance = this.resources.items.city.scene
        this.animations = this.resources.items.city.animations
        this.timeout = null
        this.screen = null

        this.init()
        this.destroyBuildings()
    }

    init() {
        this.group.add(this.instance)
    }

    async destroyBuildings() {
        if (this.group.visible) {
            this.mixer = new AnimationMixer(this.group)

            for (const animation of this.animations) {
                const action = this.mixer.clipAction(animation)
                action.repetitions = 0
                action.clampWhenFinished = true

                const dateFactor = this.experience.dateFactor.value * 3000

                if (
                    dateFactor >= 200 &&
                    animation.name.startsWith('Cube.009')
                ) {
                    action.play()
                }

                if (
                    dateFactor >= 300 &&
                    animation.name.startsWith('Cube.010')
                ) {
                    action.play()
                }

                if (
                    dateFactor >= 400 &&
                    animation.name.startsWith('Cube.003')
                ) {
                    action.play()
                }
            }

            await w.delay(0)
            this.generateFlowers()
        }
    }

    generateFlowers() {
        this.screen = this.experience.world.terminal.screen
        this.flowers = new Flowers({
            scene: this.group,
        })
        this.screen.setStencil()
    }

    generateTrees() {
        // ...
    }

    generateGrass() {
        // ...
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
