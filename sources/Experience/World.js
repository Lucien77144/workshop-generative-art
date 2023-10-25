import {
    AmbientLight,
    DirectionalLight,
    SpotLight,
    SpotLightHelper,
    Fog,
} from 'three'
import Experience from './Experience.js'
import Terminal from './Components/Terminal.js'
import Floor from './Components/Floor.js'
import { LAYERS } from './Const/const.js'

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

        this.ambientLight = new AmbientLight(0xffffff, 0.5)
        this.ambientLight.layers.set(LAYERS.GLOBAL)
        this.scene.add(this.ambientLight)

        this.directionalLight = new DirectionalLight(0xffffff, 5)
        this.directionalLight.position.set(0, 5, 5)
        this.directionalLight.layers.set(LAYERS.SCREEN)
        this.scene.add(this.directionalLight)

        this.spotLight = new SpotLight(0xFFFDD1, 100)
        this.spotLight.position.set(0, 4, 0)
        this.spotLight.layers.set(LAYERS.DEFAULT)
        this.spotLight.angle = 0.528
        this.spotLight.penumbra = 0.2
        this.spotLight.decay = 2.8
        this.spotLight.distance = 0
        // this.spotLightHelper = new SpotLightHelper(this.spotLight)
        // this.scene.add(this.spotLightHelper)
        this.scene.add(this.spotLight)

        // add debug for all options of spotlight
        if (this.debug) {
            console.log('debug')

            this.debugSpotLightFolder = this.debug.addFolder('SpotLight')
            // add deug for position x y z
            this.debugSpotLightFolder
                .add(this.spotLight.position, 'x')
                .min(-10)
                .max(10)
                .step(0.1)
                .onChange(() => {
                    this.spotLightHelper.update()
                })
            this.debugSpotLightFolder
                .add(this.spotLight.position, 'y')
                .min(0)
                .max(10)
                .step(0.1)
                .onChange(() => {
                    this.spotLightHelper.update()
                })
            this.debugSpotLightFolder
                .add(this.spotLight.position, 'z')
                .min(-10)
                .max(10)
                .step(0.1)
                .onChange(() => {
                    this.spotLightHelper.update()
                })
            this.debugSpotLightFolder
                .add(this.spotLight, 'intensity')
                .min(0)
                .max(1000)
                .step(0.01)
            this.debugSpotLightFolder
                .add(this.spotLight, 'angle')
                .min(0)
                .max(Math.PI / 2)
                .step(0.01)
                .onChange(() => {
                    this.spotLightHelper.update()
                })
            this.debugSpotLightFolder
                .add(this.spotLight, 'penumbra')
                .min(0)
                .max(1)
                .step(0.01)
            this.debugSpotLightFolder
                .add(this.spotLight, 'decay')
                .min(0)
                .max(10)
                .step(0.01)
            this.debugSpotLightFolder
                .add(this.spotLight, 'distance')
                .min(0)
                .max(40)
                .step(0.01)
        }

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
