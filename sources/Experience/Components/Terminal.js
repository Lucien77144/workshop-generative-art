import Experience from '../Experience'
import Stencil from './Stencil'
import { LAYERS } from '../Const/Const'
import { MeshBasicMaterial, PointLight } from 'three'
import Screen from './Screen/Screen'

export default class Terminal {
    constructor(_options) {
        this.experience = new Experience()
        this.config = this.experience.config
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.debug = this.experience.debug

        this.init()
    }

    init() {
        this.terminal = this.resources.items.terminal.scene
        this.terminal.traverse((o) => {
            if (o.material?.name == 'Screen') {
                this.screenStencil = new Stencil({
                    target: o,
                    instance: Screen,
                })
                o.layers.set(LAYERS.GLOBAL)
            } else if (o.material?.name == 'Screen_color') {
                o.material = new MeshBasicMaterial({
                    map: this.resources.items.screenDirt,
                })
            } else if (o.material?.name == 'TerminalMaterial') {
                o.layers.set(LAYERS.GLOBAL)
            }
        })
        this.screen = this.screenStencil.instance
        this.terminal.position.set(0, 0, 0)
        this.scene.add(this.terminal)
        
        this.light = new PointLight('#ddf', 2, 200)
        this.light.position.clone(this.terminal.position)
        this.light.position.x -= 0.1
        this.light.position.z += this.terminal.scale.z / 2
        this.light.position.y += this.terminal.scale.y / 1.75
        this.light.rotation.x = Math.PI / 2
        this.light.layers.set(LAYERS.DEFAULT)
        this.scene.add(this.light)
    }

    resize() {}

    update() {
        if (this.screen) {
            this.screen.update()
        }
    }

    destroy() {}
}
