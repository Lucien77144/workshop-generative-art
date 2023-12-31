import {
    GreaterStencilFunc,
    Mesh,
    MeshStandardMaterial,
    PlaneGeometry,
} from 'three'
import Experience from '../Experience'
import { LAYERS } from '../Const/const'

export default class Floor {
    constructor(_options) {
        this.experience = new Experience()
        this.config = this.experience.config
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.terminal = this.experience.world.terminal

        this.init()
    }

    init() {
        this.mesh = new Mesh(
            new PlaneGeometry(10, 10),
            new MeshStandardMaterial({
                color: '#131313',
            })
        )

        this.mesh.material.stencilWrite = true
        this.mesh.material.stencilRef = this.terminal.screenStencil.stencilRef
        this.mesh.material.stencilFunc = GreaterStencilFunc

        this.mesh.rotation.x = -Math.PI * 0.5
        this.mesh.layers.set(LAYERS.DEFAULT)

        this.scene.add(this.mesh)
    }

    resize() {}

    update() {}

    destroy() {}
}
