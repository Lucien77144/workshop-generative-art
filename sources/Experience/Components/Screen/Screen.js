import { EqualStencilFunc, Group } from 'three'
import Experience from '../../Experience'
import City from './../City/City'
import { LAYERS } from '../../Const/const'
import GrassFloor from '../GrassFloor/GrassFloor'
import ScreenInterface from './ScreenInterface'

export default class Screen {
    constructor(_options = {}) {
        this.experience = new Experience()
        this.config = this.experience.config
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.stencilRef = _options.stencilRef
        this.time = this.experience.time
        this.interface = null

        this.init()
    }

    init() {
        this.group = new Group() // group for screen
        this.group.visible = false
        this.group.position.set(-0.5, 0.65, -5)
        this.group.rotation.set(0.5, 0.5, -0)
        this.group.scale.set(0.25, 0.25, 0.25)

        this.city = new City({ group: this.group })

        let _target
        this.city.instance.traverse((o) => {
            if (o.name === 'Cube') {
                _target = o
            }
        })

        this.grassFloor = new GrassFloor({
            _group: this.group,
            _position: _target.position,
            _target,
            _count: 10000,
            _grassScale: 5,
        })

        this.interface = new ScreenInterface({
            stencilRef: this.stencilRef,
        })

        this.setStencil()
        this.scene.add(this.group)
    }

    setStencil() {
        this.group.traverse((o) => {
            o.layers.set(LAYERS.SCREEN)
            if (o.material) {
                o.material = o.material.clone()
                o.material.stencilWrite = true
                o.material.stencilRef = this.stencilRef
                o.material.stencilFunc = EqualStencilFunc
            }
        })
    }

    resize() {}

    update() {
        this.city?.update()
        this.grassFloor?.update()

        if (this.group) {
            this.group.rotation.y += this.time.delta * 0.00005
        }
    }

    destroy() {}
}
