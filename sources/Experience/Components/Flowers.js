import Experience from '../Experience'
import {
    Mesh,
    CatmullRomCurve3,
    Vector3,
    MeshBasicMaterial,
    TubeGeometry,
    SphereGeometry,
    Group,
    MathUtils,
} from 'three'

export default class Flowers {
    constructor(_options) {
        this.experience = new Experience()
        this.scene = _options.scene
        this.config = this.experience.config
        this.resources = this.experience.resources

        // Params
        this.targetScale = 0.3

        this.init()
    }

    init() {
        this.group = new Group()
        this.scene.add(this.group)

        const material = new MeshBasicMaterial({ color: 0x45b7e8 })
        const alienFlower = this.resources.items.alienFlower.scene

        for (let i = 0; i < this.experience.inputDate / 10; i++) {
            const curve = new CatmullRomCurve3([
                new Vector3(
                    Math.random() < 0.5 ? -1 : 1,
                    0,
                    Math.random() < 0.5 ? -1 : 1
                ),
                new Vector3(0, Math.floor(Math.random() * 2) * 2 + 3, 0),
                new Vector3(
                    Math.random() < 0.5 ? -1 : 1,
                    (Math.floor(Math.random() * 2) * 2 + 3) * 2,
                    Math.random() < 0.5 ? -1 : 1
                ),
            ])

            // TODO - Avoid creating a new geometry for each flower ?
            const geometry = new TubeGeometry(curve, 20, 0.1, 20, false)
            const mesh = new Mesh(geometry, material)

            alienFlower.position.copy(curve.getPointAt(1))
            alienFlower.scale.set(
                0.25 + Math.random() * 0.5,
                0.25 + Math.random() * 0.5,
                0.25 + Math.random() * 0.5
            )

            mesh.add(alienFlower.clone())

            mesh.scale.set(0, 0, 0)
            mesh.position.set(2.5 - Math.random() * 5, -0.05, 3)

            this.group.add(mesh)
        }

        console.log(this.group)
    }

    resize() {}

    update() {
        this.group.traverse((_child) => {
            if (_child instanceof Mesh && _child.scale.x < this.targetScale) {
                const lerpFactor = 0.01

                _child.scale.x = MathUtils.lerp(
                    _child.scale.x,
                    this.targetScale,
                    lerpFactor
                )
                _child.scale.y = MathUtils.lerp(
                    _child.scale.y,
                    this.targetScale,
                    lerpFactor
                )
                _child.scale.z = MathUtils.lerp(
                    _child.scale.z,
                    this.targetScale,
                    lerpFactor
                )
            }
        })
    }

    destroy() {}
}
