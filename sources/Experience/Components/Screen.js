import {
    BoxGeometry,
    EqualStencilFunc,
    Group,
    Mesh,
    MeshBasicMaterial,
} from 'three'
import Experience from '../Experience'
import City from './City'
import { LAYERS } from '../Const/const'

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
        this.group = new Group(); // group for screen

        // this.box = new Mesh(
        //     new BoxGeometry(0.1, 0.1, 0.1),
        //     new MeshBasicMaterial({ color: 'white' })
        // );
        // this.box.position.y = 0.5;
        // this.group.add(this.box);

        this.city = new City({
            group: this.group,
        });

        this.group.traverse((o) => {
            o.layers.set(LAYERS.SCREEN);
            if (o.material) {
                o.material = o.material.clone();
                o.material.stencilWrite = true;
                o.material.stencilRef = this.stencilRef;
                o.material.stencilFunc = EqualStencilFunc;
            }
        })

        this.scene.add(this.group);
    }

    resize() {}

    update() {
        if (this.city) {
            this.city.update();
        }
    }

    destroy() {}
}
