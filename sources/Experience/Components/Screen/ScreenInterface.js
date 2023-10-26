import {
    DoubleSide,
    EqualStencilFunc,
    Euler,
    MathUtils,
    Mesh,
    MeshBasicMaterial,
    MeshLambertMaterial,
    NoBlending,
    PlaneGeometry,
    Vector2,
    Vector3,
} from 'three'
import Experience from '../../Experience'
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js'
import { LAYERS } from '../../Const/const'
import gsap from 'gsap'

// const IFRAME_PADDING = 32;
const IFRAME_PADDING = 0
let instance
export default class ScreenInterface {
    constructor(_options = {}) {
        if (instance) {
            return instance
        }
        instance = this

        this.experience = new Experience()
        this.renderer = this.experience.renderer
        this.sizes = this.experience.sizes
        this.config = this.experience.config
        this.scene = this.experience.scene
        this.cssScene = this.experience.cssScene
        this.time = this.experience.time
        this.debug = this.experience.debug
        this.stencilRef = _options.stencilRef
        this.isOpened = false

        // this.position = new Vector3(-0.164, .476, 0);
        this.position = new Vector3(-0.15, 0.624, 0.032)
        this.rotation = new Euler(-3 * MathUtils.DEG2RAD, 0, 0)

        this.init()
        setTimeout(() => {
            this.openInterface()
            setTimeout(() => {
                this.openInterface()
            }, 2000);
        }, 2000);
    }

    openInterface(duration = .25) {
        if (this.isOpened) {
            this.isOpened = false;
            gsap.to(this.mesh.material, {
                opacity: 0,
                duration,
                onComplete: () => {
                    this.mesh.material.opacity = 0
                }
            })
            gsap.to(this.renderer.renderMesh.material.uniforms.uScene, {
                value: 0,
                duration,
                onComplete: () => {
                    this.renderer.renderMesh.material.uniforms.uScene.value = 0
                }
            })
            // this.renderer.renderMesh.material.uniforms.uScene.value = 0
            // this.mesh.material.opacity = 0
        } else {
            this.isOpened = true;
            gsap.to(this.mesh.material, {
                opacity: 1,
                duration,
                onComplete: () => {
                    this.mesh.material.opacity = 1
                }
            })
            gsap.to(this.renderer.renderMesh.material.uniforms.uScene, {
                value: 1,
                duration,
                onComplete: () => {
                    this.renderer.renderMesh.material.uniforms.uScene.value = 1
                }
            })
            // this.renderer.renderMesh.material.uniforms.uScene.value = 1
            // this.mesh.material.opacity = 1
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
        const iframe = document.createElement('iframe')
        if (iframe.contentWindow) {
            window.addEventListener('message', (event) => {
                var evt = new CustomEvent(event.data.type, {
                    bubbles: true,
                    cancelable: false,
                })
                // @ts-ignore
                evt.inComputer = true
                if (event.data.type === 'mousemove') {
                    var clRect = iframe.getBoundingClientRect()
                    const { top, left, width, height } = clRect
                    const widthRatio = width / IFRAME_SIZE.w
                    const heightRatio = height / IFRAME_SIZE.h
                    // @ts-ignore
                    evt.clientX = Math.round(
                        event.data.clientX * widthRatio + left
                    )
                    //@ts-ignore
                    evt.clientY = Math.round(
                        event.data.clientY * heightRatio + top
                    )
                } else if (event.data.type === 'keydown') {
                    // @ts-ignore
                    evt.key = event.data.key
                } else if (event.data.type === 'keyup') {
                    // @ts-ignore
                    evt.key = event.data.key
                }
                iframe.dispatchEvent(evt)
            })
        }

        iframe.src = 'https://henryheffernan-os.vercel.app/'
        iframe.style.width = this.sizes.width + 'px'
        iframe.style.height = this.sizes.height + 'px'
        iframe.style.padding = IFRAME_PADDING + 'px'
        iframe.style.boxSizing = 'border-box'
        iframe.style.opacity = '1'
        iframe.className = 'jitter'
        iframe.id = 'computer-screen'
        iframe.frameBorder = '0'
        container.appendChild(iframe)

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
        object.scale.setScalar(0.0007558754)
        object.layers.set(LAYERS.SCREEN)
        this.cssScene.add(object)

        this.material = new MeshLambertMaterial({
            side: DoubleSide,
            color: '#00f',
            transparent: true,
            opacity: 0,
        })
        this.material.stencilWrite = true
        this.material.stencilRef = this.stencilRef
        this.material.stencilFunc = EqualStencilFunc

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
