import * as THREE from 'three'
import Experience from './Experience.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { HalftonePass } from 'three/examples/jsm/postprocessing/HalftonePass.js'

export default class Renderer {
    constructor(_options = {}) {
        this.experience = new Experience()
        this.config = this.experience.config
        this.debug = this.experience.debug
        this.stats = this.experience.stats
        this.time = this.experience.time
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene
        this.camera = this.experience.camera

        // Debug
        if (this.debug) {
            this.debugRendererFolder = this.debug.addFolder('Renderer')
            this.debugHalftoneFolder = this.debug.addFolder('Halftone')
        }

        this.usePostprocess = true

        this.setInstance()
        this.setPostProcess()
    }

    setInstance() {
        this.clearColor = '#010101'

        // Renderer
        this.instance = new THREE.WebGLRenderer({
            alpha: false,
            antialias: true,
        })
        this.instance.domElement.style.position = 'absolute'
        this.instance.domElement.style.top = 0
        this.instance.domElement.style.left = 0
        this.instance.domElement.style.width = '100%'
        this.instance.domElement.style.height = '100%'

        this.instance.setClearColor(this.clearColor, 1)
        this.instance.setSize(this.config.width, this.config.height)
        this.instance.setPixelRatio(this.config.pixelRatio)

        this.instance.physicallyCorrectLights = true
        // this.instance.gammaOutPut = true
        this.instance.outputEncoding = THREE.sRGBEncoding
        // this.instance.shadowMap.type = THREE.PCFSoftShadowMap
        // this.instance.shadowMap.enabled = false
        this.instance.toneMapping = THREE.NoToneMapping
        this.instance.toneMappingExposure = 1

        this.context = this.instance.getContext()

        // Add stats panel
        if (this.stats) {
            this.stats.setRenderPanel(this.context)
        }

        // Debug
        if (this.debug) {
            this.debugRendererFolder.addColor(this, 'clearColor').onChange(() => {
                this.instance.setClearColor(this.clearColor)
            })

            this.debugRendererFolder
                .add(this.instance, 'toneMapping', {
                    NoToneMapping: THREE.NoToneMapping,
                    LinearToneMapping: THREE.LinearToneMapping,
                    ReinhardToneMapping: THREE.ReinhardToneMapping,
                    CineonToneMapping: THREE.CineonToneMapping,
                    ACESFilmicToneMapping: THREE.ACESFilmicToneMapping,
                })
                .onChange(() => {
                    this.scene.traverse((_child) => {
                        if (_child instanceof THREE.Mesh) _child.material.needsUpdate = true
                    })
                })

            this.debugRendererFolder.add(this.instance, 'toneMappingExposure').min(0).max(10)
        }
    }

    setPostProcess() {
        this.postProcess = {}

        /**
         * Render pass
         */
        this.postProcess.renderPass = new RenderPass(this.scene, this.camera.instance)
        this.postProcess.halftonePass = new HalftonePass()

        // TODO - Try to pass params to the instance directly
        this.postProcess.halftonePass.uniforms.shape.value = 3
        this.postProcess.halftonePass.uniforms.radius.value = 100
        this.postProcess.halftonePass.uniforms.rotateR.value = 90
        this.postProcess.halftonePass.uniforms.rotateB.value = 90
        this.postProcess.halftonePass.uniforms.rotateG.value = 90
        this.postProcess.halftonePass.uniforms.scatter.value = 0
        this.postProcess.halftonePass.uniforms.blendingMode.value = 1
        this.postProcess.halftonePass.uniforms.blending.value = 1

        // Debug
        if (this.debug) {
            this.debugHalftoneFolder
                .add(this.postProcess.halftonePass.uniforms.shape, 'value')
                .min(1)
                .max(5)
                .step(1)
                .name('shape')
            this.debugHalftoneFolder
                .add(this.postProcess.halftonePass.uniforms.radius, 'value')
                .min(0)
                .max(100)
                .step(1)
                .name('radius')
            this.debugHalftoneFolder
                .add(this.postProcess.halftonePass.uniforms.rotateR, 'value')
                .min(0)
                .max(180)
                .step(1)
                .name('rotateR')
            this.debugHalftoneFolder
                .add(this.postProcess.halftonePass.uniforms.rotateB, 'value')
                .min(0)
                .max(180)
                .step(1)
                .name('rotateB')
            this.debugHalftoneFolder
                .add(this.postProcess.halftonePass.uniforms.rotateG, 'value')
                .min(0)
                .max(180)
                .step(1)
                .name('rotateG')
            this.debugHalftoneFolder
                .add(this.postProcess.halftonePass.uniforms.scatter, 'value')
                .min(0)
                .max(1)
                .step(0.01)
                .name('scatter')
            this.debugHalftoneFolder
                .add(this.postProcess.halftonePass.uniforms.blendingMode, 'value')
                .min(0)
                .max(1)
                .step(0.01)
                .name('blendingMode')
            this.debugHalftoneFolder
                .add(this.postProcess.halftonePass.uniforms.blending, 'value')
                .min(0)
                .max(5)
                .step(1)
                .name('blending')
        }

        /**
         * Effect composer
         */
        this.renderTarget = new THREE.WebGLRenderTarget(this.config.width, this.config.height, {
            generateMipmaps: false,
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
            encoding: THREE.sRGBEncoding,
            samples: 1,
        })
        this.postProcess.composer = new EffectComposer(this.instance, this.renderTarget)
        this.postProcess.composer.setSize(this.config.width, this.config.height)
        this.postProcess.composer.setPixelRatio(this.config.pixelRatio)

        this.postProcess.composer.addPass(this.postProcess.renderPass)
        this.postProcess.composer.addPass(this.postProcess.halftonePass)
    }

    resize() {
        // Instance
        this.instance.setSize(this.config.width, this.config.height)
        this.instance.setPixelRatio(this.config.pixelRatio)

        // Post process
        this.postProcess.composer.setSize(this.config.width, this.config.height)
        this.postProcess.composer.setPixelRatio(this.config.pixelRatio)
    }

    update() {
        if (this.stats) {
            this.stats.beforeRender()
        }

        if (this.usePostprocess) {
            this.postProcess.composer.render()

            // Animate halftone
            if (this.postProcess.halftonePass.uniforms.radius.value > 10) {
                this.postProcess.halftonePass.uniforms.radius.value -= 1
            }
        } else {
            this.instance.render(this.scene, this.camera.instance)
        }

        if (this.stats) {
            this.stats.afterRender()
        }
    }

    destroy() {
        this.instance.renderLists.dispose()
        this.instance.dispose()
        this.renderTarget.dispose()
        this.postProcess.composer.renderTarget1.dispose()
        this.postProcess.composer.renderTarget2.dispose()
    }
}
