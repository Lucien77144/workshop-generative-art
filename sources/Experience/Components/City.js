import Experience from '../Experience'
import { AnimationMixer } from 'three'

export default class City {
    constructor(_options) {
        this.experience = new Experience()
        this.config = this.experience.config
        this.group = _options.group
        this.resources = this.experience.resources
        this.scene = this.resources.items.city.scene
        this.animations = this.resources.items.city.animations
        this.timeout = null
        this.inputDate = _options.inputDate

        this.init()
        this.setAnimations()
    }

    init() {
        this.scene.position.set(0, 0.4, 0)
        this.scene.scale.set(0.15, 0.15, 0.15)
        this.group.add(this.scene)
    }

    setAnimations() {
        if (this.scene.visible) {
            this.mixer = new AnimationMixer(this.scene)

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
        this.group.remove(this.scene)
        clearTimeout(this.timeout)
    }
}
