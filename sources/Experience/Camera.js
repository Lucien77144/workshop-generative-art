import { Euler, PerspectiveCamera, Vector3 } from 'three'
import Experience from './Experience.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import gsap from 'gsap'

const V3 = new Vector3()

export default class Camera {
    constructor(_options) {
        // Options
        this.experience = new Experience()
        this.config = this.experience.config
        this.debug = this.experience.debug
        this.time = this.experience.time
        this.targetElement = this.experience.targetElement
        this.scene = this.experience.scene
        this.screenInterface = null

        this.cursor = {
            x: 0,
            y: 0,
        }

        this.order = 'YXZ'

        // Set up
        this.mode = 'default'

        if (this.debug) {
            this.debugCameraFolder = this.debug.addFolder('Camera')
        }

        window.addEventListener('mousemove', (event) => {
            this.cursor.x = event.clientX / this.experience.config.width - 0.5
            this.cursor.y = event.clientY / this.experience.config.height - 0.5
        })

        this.setInstance()
        this.setModes()

        this.cameraPosition = new Vector3(0, 0, 0)
        this.cameraPosition.copy(this.modes[this.mode].instance.position)
        this.cameraRotation = new Euler()
        this.cameraRotation.copy(this.modes[this.mode].instance.rotation)

        this.hasListener = false
    }

    setInstance() {
        // Set up
        this.instance = new PerspectiveCamera(
            25,
            this.experience.config.width / this.experience.config.height,
            0.1,
            150
        )
        this.instance.rotation.reorder(this.order)
        this.instance.near = 0

        this.scene.add(this.instance)
    }

    setModes() {
        this.modes = {}

        // Default
        this.modes.default = {}
        this.modes.default.instance = this.instance.clone()
        this.modes.default.instance.rotation.reorder(this.order)
        this.modes.default.instance.position.set(50, -50, 12)
        this.modes.default.instance.rotation.set(-0.43, -0.6, 0)

        // Focus
        this.modes.focus = {}
        this.modes.focus.instance = this.instance.clone()
        this.modes.focus.instance.position.set(0, 0.6, 2)
        this.modes.default.instance.rotation.set(0, 0, 0)

        // Debug
        this.modes.debug = {}
        this.modes.debug.instance = this.instance.clone()
        this.modes.debug.instance.position.set(-7, 6, 10)
        this.modes.debug.instance.rotation.set(-0.43, -0.6, 0)

        /**
         * Debug options
         */

        if (this.debug) {
            this.debugCameraFolder
                .add(this, 'mode', ['default', 'focus', 'debug'])
                .onFinishChange(() => {
                    this.modes.debug.orbitControls?.update()
                })
        }
    }

    resize() {
        const aspect = this.config.width / this.config.height

        this.instance.aspect = aspect
        this.instance.updateProjectionMatrix()

        this.modes.default.instance.aspect = aspect
        this.modes.default.instance.updateProjectionMatrix()

        this.modes.debug.instance.aspect = aspect
        this.modes.debug.instance.updateProjectionMatrix()
    }

    update() {
        if (
            this.experience.renderer.instance.domElement &&
            !this.modes.debug.orbitControls
        ) {
            this.createOrbitControls()
        }

        if (this.experience.eventEmitter && this.hasListener === false) {
            this.hasListener = true
            this.experience.eventEmitter.addEventListener(
                'goFocusMode',
                (e) => {
                    this.mode = 'focus'
                    this.screenInterface ??= this.experience.screenInterface

                    this.cameraPosition.copy(this.instance.position)
                    this.cameraRotation.copy(this.instance.rotation)

                    gsap.to(this.cameraPosition, {
                        x: this.modes.focus.instance.position.x,
                        y: this.modes.focus.instance.position.y,
                        z: this.modes.focus.instance.position.z,
                        duration: 2,
                        ease: 'power3.inOut',
                        onComplete: () => {
                            this.experience.screenInterface.toggleInterface()
                        },
                    })

                    gsap.to(this.cameraRotation, {
                        x: this.modes.focus.instance.rotation.x,
                        y: this.modes.focus.instance.rotation.y,
                        z: this.modes.focus.instance.rotation.z,
                        duration: 2,
                        ease: 'power3.inOut',
                    })
                }
            )
        }

        if (this.mode === 'default') {
            const parallaxX = this.cursor.x
            const parallaxY = this.cursor.y

            this.instance.position.copy(this.cameraPosition)
            this.instance.position.x =
                parallaxX - this.instance.position.x * 0.1
            this.instance.position.y =
                parallaxY - this.instance.position.y * 0.1

            this.instance.lookAt(V3.set(0, 0, 0))
        } else {
            this.instance.position.copy(this.cameraPosition)
            this.instance.rotation.copy(this.cameraRotation)
        }
        this.instance.updateMatrixWorld() // To be used in projection
    }

    destroy() {
        this.modes.debug.orbitControls?.destroy()
    }

    createOrbitControls() {
        this.modes.debug.orbitControls = new OrbitControls(
            this.modes.debug.instance,
            this.experience.renderer.instance.domElement
        )

        this.modes.debug.orbitControls.enabled = this.modes.debug.active
        this.modes.debug.orbitControls.screenSpacePanning = true
        this.modes.debug.orbitControls.enableKeys = false
        this.modes.debug.orbitControls.maxPolarAngle = Math.PI * 0.4
        this.modes.debug.orbitControls.zoomSpeed = 0.25
        this.modes.debug.orbitControls.enableDamping = true
        this.modes.debug.orbitControls.update()
    }
}
