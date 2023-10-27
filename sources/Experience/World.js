import {
    AmbientLight,
    DirectionalLight,
    SpotLight,
} from 'three'
import Experience from './Experience.js'
import Terminal from './Components/Terminal.js'
import Floor from './Components/Floor.js'
import { LAYERS } from './Const/const.js'
import gsap from 'gsap'

export default class World {
    constructor(_options) {
        this.experience = new Experience()
        this.config = this.experience.config
        this.debug = this.experience.debug
        this.scene = this.experience.scene
        this.resources = this.experience.resources

        this.resources.on('groupEnd', (_group) => {
            if (_group.name === 'base') {
                this.init()
            }
        })
    }

    init() {
        // this.fog = new Fog(0x000000, 20, 20)
        // this.scene.fog = this.fog

        this.ambientLight = new AmbientLight(0xffffff, 0)
        this.ambientLight.layers.set(LAYERS.DEFAULT)
        this.scene.add(this.ambientLight)

        this.ambientLight2 = new AmbientLight(0x00E4FF, 1)
        this.ambientLight2.layers.set(LAYERS.SCREEN)
        this.scene.add(this.ambientLight2)

        this.directionalLight = new DirectionalLight(0xffffff, 2)
        this.directionalLight.position.set(0, 5, 5)
        this.directionalLight.layers.set(LAYERS.SCREEN)
        this.scene.add(this.directionalLight)

        this.spotLight = new SpotLight(0xfffdd1, 0)
        this.spotLight.position.set(0, 4, 0)
        this.spotLight.layers.set(LAYERS.DEFAULT)
        this.spotLight.angle = 0.528
        this.spotLight.penumbra = 0.2
        this.spotLight.decay = 2.8
        this.spotLight.distance = 0
        this.scene.add(this.spotLight)

        this.experience.eventEmitter.addEventListener('playAmbient', () => {
            gsap.to(this.ambientLight, {
                intensity: 0.3,
                duration: 1,
                ease: 'power4.out',
            })
            gsap.to(this.spotLight, {
                intensity: 100,
                duration: 1,
                ease: 'power4.out',
            })
        })

        this.terminal = new Terminal()
        this.floor = new Floor()
    }

    resize() {}

    update() {
        if (this.terminal) {
            this.terminal.update()
        }
        this.floors?.forEach((floor) => {
            floor.update()
        })
    }
}
