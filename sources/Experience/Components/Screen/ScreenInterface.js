import {
    DoubleSide,
    EqualStencilFunc,
    Euler,
    MathUtils,
    Mesh,
    MeshLambertMaterial,
    PlaneGeometry,
    Vector3,
} from 'three'
import Experience from '../../Experience'
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js'
import { LAYERS } from '../../Const/const'
import gsap from 'gsap'

const SCALE = 0.0005
let instance
export default class ScreenInterface {
    constructor(_options = {}) {
        if (instance) {
            return instance
        }
        instance = this

        this.experience = new Experience()
        this.experience.screenInterface = this
        this.renderer = this.experience.renderer
        this.sizes = this.experience.sizes
        this.config = this.experience.config
        this.scene = this.experience.scene
        this.cssScene = this.experience.cssScene
        this.time = this.experience.time
        this.debug = this.experience.debug
        this.stencilRef = _options.stencilRef
        this.world = this.experience.world
        this.isOpened = false

        this.position = new Vector3(-0.15, 0.624, -0.032)
        this.rotation = new Euler(-3 * MathUtils.DEG2RAD, 0, 0)

        this.init()
    }

    // toggleInterface(duration = 0.25) {
    toggleInterface(duration = 0.25) {
        if (this.isOpened) {
            this.isOpened = false
            this.world.terminal.screen.group.visible = true
            gsap.to([this.mesh.scale, this.object.scale], {
                x: 0,
                y: 0,
                z: 0,
                duration,
                onComplete: () => {
                    this.object.scale.setScalar(0)
                },
            })
        } else {
            this.isOpened = true
            this.world.terminal.screen.group.visible = false
            gsap.to([this.mesh.scale, this.object.scale], {
                x: SCALE,
                y: SCALE,
                z: SCALE,
                duration,
                onComplete: () => {
                    this.object.scale.setScalar(SCALE)
                },
            })
        }
    }

    init() {
        this.createIframe()
    }
    /**
     * Creates the iframe for the computer screen
     */
    createIframe() {
        // Create container
        const container = document.createElement('div')
        container.style.width = this.sizes.width + 'px'
        container.style.height = this.sizes.height + 'px'
        container.style.opacity = '1'

        const content = document.getElementById('panel')
        container.innerHTML = content.innerHTML
        setTimeout(() => {
            content.remove()
        })

        this.createCssPlane(container)
    }

    /**
     * Creates a CSS plane and GL plane to properly occlude the CSS plane
     * @param element the element to create the css plane for
     */
    createCssPlane(element) {
        // Create CSS3D object
        this.object = new CSS3DObject(element)
        this.object.position.copy(this.position)
        this.object.rotation.copy(this.rotation)
        this.object.scale.setScalar(0)
        this.object.layers.set(LAYERS.SCREEN)
        this.cssScene.add(this.object)

        this.material = new MeshLambertMaterial({
            side: DoubleSide,
            color: '#0000ff',
            transparent: true,
        })
        this.material.stencilWrite = true
        this.material.stencilRef = this.stencilRef
        this.material.stencilFunc = EqualStencilFunc

        const geometry = new PlaneGeometry(this.sizes.width, this.sizes.height)

        this.mesh = new Mesh(geometry, this.material)
        this.mesh.position.copy(this.object.position)
        this.mesh.rotation.copy(this.object.rotation)
        this.mesh.scale.copy(this.object.scale)
        this.mesh.layers.set(LAYERS.SCREEN)

        this.scene.add(this.mesh)
    }

    resize() {}

    update() {}

    destroy() {}
}
