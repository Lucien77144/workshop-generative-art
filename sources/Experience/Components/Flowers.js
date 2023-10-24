import Experience from '../Experience'
import {
    Mesh,
    CatmullRomCurve3,
    Vector3,
    MeshBasicMaterial,
    TubeGeometry,
    Group,
    MathUtils,
    Quaternion,
    Euler,
    AxesHelper,
} from 'three'
import Alea from 'alea'

export default class Flowers {
    constructor(_options) {
        this.experience = new Experience()
        this.scene = _options.scene
        this.config = this.experience.config
        this.resources = this.experience.resources

        // Params
        const prng = new Alea(this.experience.inputDate)
        this.targetScale = 0.5

        this.init()
    }

    init() {
        const prng = new Alea(this.experience.inputDate)
        this.flowers = new Group()
        this.scene.add(this.flowers)

        const material = new MeshBasicMaterial({ color: 0x45b7e8 })
        const alienFlower = this.resources.items.alienFlower.scene

        const _RADIUS = 3.5

        for (let i = 0; i < this.experience.inputDate / 30; i++) {
            const angle = (i / (this.experience.inputDate / 30)) * Math.PI * 2
            const x = _RADIUS * Math.cos(angle)
            const z = _RADIUS * Math.sin(angle)

            const flowerGroup = new Group()

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
            const flower = new Mesh(geometry, material)

            alienFlower.position.copy(curve.getPointAt(1))
            const dir = curve
                .getPointAt(1)
                .sub(curve.getPointAt(0.99))
                .normalize()

            // alienFlower.scale.set(
            //     1 + prng() * 5,
            //     1 + prng() * 5,
            //     1 + prng() * 5
            // )

            alienFlower.scale.set(
                0.1 + prng() * 0.5,
                0.1 + prng() * 0.5,
                0.1 + prng() * 0.5
            )
            const targetPos = alienFlower.position.clone().add(dir)
            alienFlower.lookAt(targetPos)
            flowerGroup.add(alienFlower.clone())

            const axesHelper = new AxesHelper(5)
            axesHelper.scale.set(2, 2, 2)
            alienFlower.add(axesHelper)
            flowerGroup.scale.set(0.5, 0.5, 0.5)
            flowerGroup.position.set(x, -0.05, z)
            flowerGroup.add(flower)

            this.scene.add(flowerGroup)
        }
    }

    resize() {}

    update() {
        // animate flowers
    }

    destroy() {}
}
