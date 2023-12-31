import Experience from './../../Experience'
import { AnimationMixer, MeshPhongMaterial } from 'three'
import Flowers from './../Flowers/Flowers'
import { Wait } from './../../Utils/Wait'

const w = new Wait()
export default class City {
    constructor(_options) {
        this.experience = new Experience()
        this.config = this.experience.config
        this.group = _options.group
        this.resources = this.experience.resources
        this.instance = this.resources.items.city.scene
        this.animations = this.resources.items.city.animations
        this.screen = null

        this.init()

        this.experience.eventEmitter.addEventListener('generate', (e) => {
            this.destroyBuildings()
        })

        // this.instance.traverse((child) => {
        //     if (child.isMesh) {
        //         child.material = new ShaderMaterial({
        //             vertexShader: vertex,
        //             fragmentShader: fragment,
        //         })
        //     }
        // })

        this.instance.traverse((child) => {
            if (child.isMesh) {
                child.material = new MeshPhongMaterial({
                    color: 0xc1c1c1,
                })
            }
        })
    }

    init() {
        this.group.add(this.instance)
    }

    async destroyBuildings() {
        this.mixer = new AnimationMixer(this.group)

        for (const animation of this.animations) {
            const action = this.mixer.clipAction(animation)
            action.repetitions = 0
            action.clampWhenFinished = true

            const dateFactor = this.experience.dateFactor.value

            if (dateFactor >= 0.2 && animation.name.includes('Cube.009')) {
                action.play()
            }

            if (dateFactor >= 0.4 && animation.name.includes('Cube.010')) {
                action.play()
            }

            if (dateFactor >= 0.75 && animation.name.includes('Cube.003')) {
                action.play()
            }
        }

        await w.delay(3000)
        this.generateFlowers()
        w.kill()
    }

    generateFlowers() {
        this.screen = this.experience.world.terminal.screen
        this.flowers = new Flowers({
            scene: this.group,
        })
        this.screen.setStencil()
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
        this.group.remove(this.scene)
        w.kill()
    }
}
