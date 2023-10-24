import Experience from '../Experience'
import { AnimationMixer } from 'three'

export default class City {
    constructor(_options) {
        this.experience = new Experience()
        this.config = this.experience.config
        this.group = _options.group
        this.resources = this.experience.resources
        this.instance = this.resources.items.city.scene
        this.animations = this.resources.items.city.animations
        this.timeout = null
        this.inputDate = _options.inputDate

        this.init()
        this.setAnimations()
    }

    init() {
        this.instance.position.set(0.1, 0.2, -1)
        this.instance.scale.set(0.2, 0.2, 0.2)

        this.group.add(this.instance)
    }

    setAnimations() {
        if (this.instance.visible) {
            this.mixer = new AnimationMixer(this.instance)

            this.timeout = setTimeout(() => {
                this.fireAnimation()
            }, 3000)
        }
    }

    fireAnimation() {
        for (const animation of this.animations) {
            const action = this.mixer.clipAction(animation)
            action.repetitions = 0
            action.clampWhenFinished = true
            
            if (
                this.inputDate >= 2050 &&
                animation.name.startsWith('Cube.010')
            ) {
                action.play()
            }

            if (
                this.inputDate >= 3000 &&
                animation.name.startsWith('Cube.009')
            ) {
                action.play()
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
        this.group.remove(this.instance)
        clearTimeout(this.timeout)
    }
}
