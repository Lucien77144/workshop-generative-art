import {
    AmbientLight,
    DirectionalLight,
    Group,
    Mesh,
    MeshBasicMaterial,
    PlaneGeometry,
} from 'three'
import Experience from './Experience.js'
import Terminal from './Components/Terminal.js'
import Floor from './Components/Floor.js'
import { LAYERS } from './Const/const.js'
import City from './Components/City.js'
import GrassFloor from './Components/GrassFloor/GrassFloor.js'

export default class World {
    constructor(_options) {
        this.experience = new Experience()
        this.config = this.experience.config
        this.scene = this.experience.scene
        this.resources = this.experience.resources

        this.resources.on('groupEnd', (_group) => {
            if (_group.name === 'base') {
                this.init()
            }
        })
    }

    init() {
        this.ambientLight = new AmbientLight(0xaaffaa, 0.5)
        this.ambientLight.layers.set(LAYERS.GLOBAL)
        this.scene.add(this.ambientLight)

        this.directionalLight = new DirectionalLight(0xffffff, 5)
        this.directionalLight.position.set(0, 5, 5)
        this.directionalLight.layers.set(LAYERS.GLOBAL)
        this.scene.add(this.directionalLight)

        this.terminal = new Terminal()
        this.floor = new Floor()
    }

    resize() {}

    update() {
        // TEMPORARY
        if (this.city) {
            this.city.update()
        }

        if (this.terminal) {
            this.terminal.update()
        }
        this.floors?.forEach((floor) => {
            floor.update()
        })
    }
}
