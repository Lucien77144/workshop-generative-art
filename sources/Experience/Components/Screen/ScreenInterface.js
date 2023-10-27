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

        console.log(_options)

        // this.position = new Vector3(-0.164, .476, 0);
        this.position = new Vector3(-0.15, 0.624, -0.032)
        // this.position = new Vector3(-0.17, 0.65, 0)

        this.rotation = new Euler(-3 * MathUtils.DEG2RAD, 0, 0)

        this.init()
        // setTimeout(() => {
        //     this.toggleInterface()
        //     setTimeout(() => {
        //         this.toggleInterface()
        //     }, 10000);
        // }, 2000);
    }

    toggleInterface(duration = 0.25) {
        if (this.isOpened) {
            this.isOpened = false
            gsap.to(this.mesh.material, {
                opacity: 0,
                duration,
                onComplete: () => {
                    this.mesh.material.opacity = 0
                },
            })
            gsap.to(this.renderer.renderMesh.material.uniforms.uScene, {
                value: 0,
                duration,
                onComplete: () => {
                    this.renderer.renderMesh.material.uniforms.uScene.value = 0
                },
            })
        } else {
            this.isOpened = true
            gsap.to(this.mesh.material, {
                opacity: 1,
                duration,
                onComplete: () => {
                    this.mesh.material.opacity = 1
                },
            })
            gsap.to(this.renderer.renderMesh.material.uniforms.uScene, {
                value: 1,
                duration,
                onComplete: () => {
                    this.renderer.renderMesh.material.uniforms.uScene.value = 1
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

            const $$boot = document.querySelector('.c-experience-boot')
            const $$bootInput = document.querySelector(
                '.c-experience-boot-content__input'
            )
            const $$bootButton = document.querySelector(
                '.c-experience-boot-content__button'
            )

            $$bootButton.addEventListener('click', (e) => {
                console.log('click');

                this.experience.eventEmitter.dispatchEvent(
                    new CustomEvent('setDateFactor', {
                        detail: $$bootInput.value,
                    })
                )

                this.toggleInterface()
            })
        })

        this.createCssPlane(container)
    }

    /**
     * Creates a CSS plane and GL plane to properly occlude the CSS plane
     * @param element the element to create the css plane for
     */
    createCssPlane(element) {
        // Create CSS3D object
        const object = new CSS3DObject(element)
        object.position.copy(this.position)
        object.rotation.copy(this.rotation)
        // object.scale.setScalar(0.0007558754)
        object.scale.setScalar(0.0005)
        object.layers.set(LAYERS.SCREEN)
        this.cssScene.add(object)

        this.material = new MeshLambertMaterial({
            side: DoubleSide,
            color: '#0000ff',
            transparent: true,
            opacity: this.isOpened ? 1 : 0,
        })
        this.material.stencilWrite = true
        this.material.stencilRef = this.stencilRef
        this.material.stencilFunc = EqualStencilFunc
        this.renderer.renderMesh.material.uniforms.uScene.value = this.isOpened
            ? 1
            : 0

        const geometry = new PlaneGeometry(this.sizes.width, this.sizes.height)

        this.mesh = new Mesh(geometry, this.material)
        this.mesh.position.copy(object.position)
        this.mesh.rotation.copy(object.rotation)
        this.mesh.scale.copy(object.scale)
        this.mesh.layers.set(LAYERS.SCREEN)

        this.scene.add(this.mesh)
    }

    resize() {}

    update() {}

    destroy() {}
}
