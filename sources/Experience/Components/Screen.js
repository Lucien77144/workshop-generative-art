import { EqualStencilFunc, Group, MeshPhongMaterial, Vector3 } from 'three'
import Experience from '../Experience'
import City from './City'
import { LAYERS } from '../Const/const'
import GrassFloor from './GrassFloor/GrassFloor'

export default class Screen {
    constructor(_options = {}) {
        this.experience = new Experience()
        this.config = this.experience.config
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.stencilRef = _options.stencilRef

        this.init()
    }

    init() {
        this.group = new Group() // group for screen

        this.city = new City({
            group: this.group,
            inputDate: 3000,
        })

        let _target;
        this.city.instance.traverse((o) => {
            if (o.name === 'Cube') {
                _target = o;
                o.material = new MeshPhongMaterial({
                    color: 'red',
                })
            }
        })

        this.floor = new GrassFloor({
            _group: this.group,
            _position: this.city.instance.position,
            _target,
            _count: 5000,
        })

        this.group.traverse((o) => {
            o.layers.set(LAYERS.SCREEN)
            if (this.stencilRef && o.material) {
                o.material = o.material.clone()
                o.material.stencilWrite = true
                o.material.stencilRef = this.stencilRef
                o.material.stencilFunc = EqualStencilFunc
            }
        })

        this.scene.add(this.group)
    }

    resize() {}

    update() {
        if (this.city) {
            this.city.update()
        }
        this.floor?.update()
    }

    destroy() {}
}
