import Experience from '../Experience'
import { AnimationMixer } from 'three'

export default class City {
    constructor(_options) {
        this.experience = new Experience()
        this.config = this.experience.config
        // this.group = _options.group
        this.resources = this.experience.resources
        this.scene = this.resources.items.city.scene
        this.animations = this.resources.items.city.animations
        this.timeout = null
        this.inputDate = _options.inputDate

        this.init()
        this.setAnimations()
    }

    init() {
        this.scene.position.set(0, -0.5, 0)
        this.scene.scale.set(0.5, 0.5, 0.5)

        // TEMPORARY
        // this.group.add(this.scene)
    }

    setAnimations() {
        if (this.scene.visible) {
            this.mixer = new AnimationMixer(this.scene)

            for (const animation of this.animations) {
                const action = this.mixer.clipAction(animation)
                action.repetitions = 0
                action.clampWhenFinished = true

                if (
                    this.inputDate >= 2050 &&
                    animation.name.startsWith('Cube.010')
                ) {
                    setTimeout(() => {
                        action.play()
                    }, 1500)
                }

                if (
                    this.inputDate >= 2100 &&
                    animation.name.startsWith('Cube.009')
                ) {
                    setTimeout(() => {
                        action.play()
                    }, 3000)
                }

                // if (
                //     this.inputDate >= 2150 &&
                //     animation.name.startsWith('Cube.008')
                // ) {
                //     setTimeout(() => {
                //         action.play()
                //     }, 4500)
                // }
            }
        }
    }

    resize() {}

    update() {
        if (this.mixer) {
            this.mixer.update(this.experience.time.delta * 0.0005)
        }
    }

    destroy() {
        // this.group.remove(this.scene)
        clearTimeout(this.timeout)
    }
}
