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

        this.init()
        this.setAnimations()
    }

    init() {
        this.scene.position.set(0, -1, 0)
        this.scene.scale.set(0.5, 0.5, 0.5)

        this.group.add(this.scene)
    }

    setAnimations() {
        if (this.scene.visible) {
            this.mixer = new AnimationMixer(this.scene)

            setTimeout(() => {
                this.fireAnimation()
            }, 3000)
        }
    }

    fireAnimation() {
        for (const animation of this.animations) {
            const action = this.mixer.clipAction(animation)
            action.clampWhenFinished = true
            action.repetitions = 0
            action.play()
        }
    }

    resize() {}

    update() {
        if (this.mixer) {
            this.mixer.update(this.experience.time.delta * 0.0005)
            console.log(this.experience.time.delta)
        }
    }

    destroy() {}
}
