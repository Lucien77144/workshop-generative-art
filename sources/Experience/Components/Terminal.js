import Experience from '../Experience'
import Stencil from './Stencil'
import { LAYERS } from '../Const/const'
import { MeshBasicMaterial, PointLight, PointLightHelper } from 'three'
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

        this.light = new PointLight(0xff0000, 2, 200)
        this.light.position.clone(this.terminal.position)
        this.light.position.x -= 0.1
        this.light.position.z += this.terminal.scale.z / 2
        this.light.position.y += this.terminal.scale.y / 1.75
        this.light.rotation.x = Math.PI / 2
        this.light.layers.set(LAYERS.DEFAULT)
        // this.scene.add( this.light );

        // add debug for rotation :
        this.debugFolder = this.debug.addFolder('Terminal Light')
        this.debugFolder.add(this.light.rotation, 'x', 0, Math.PI * 2)
        this.debugFolder.add(this.light.rotation, 'y', 0, Math.PI * 2)
        this.debugFolder.add(this.light.rotation, 'z', 0, Math.PI * 2)

        this.debugFolder.add(this.light.position, 'x', -3, 3)
        this.debugFolder.add(this.light.position, 'y', -3, 3)
        this.debugFolder.add(this.light.position, 'z', -3, 3)

        const helper = new PointLightHelper(this.light, 1)
        // this.scene.add( helper );
    }

    resize() {}

    update() {
        if (this.screen) {
            this.screen.update()
        }
    }

    destroy() {}
}
