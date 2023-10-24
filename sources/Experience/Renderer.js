import * as THREE from 'three'
import Experience from './Experience.js'
import { LAYERS } from './Const/const.js'
import vertexShader from './Shaders/vertexShader.vert?raw'
import fragmentShader from './Shaders/fragmentShader.frag?raw'

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
            this.debugRendererFolder
                .addColor(this, 'clearColor')
                .onChange(() => {
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
                        if (_child instanceof THREE.Mesh)
                            _child.material.needsUpdate = true
                    })
                })

            this.debugRendererFolder
                .add(this.instance, 'toneMappingExposure')
                .min(0)
                .max(10)
        }
    }

    setPostProcess() {
        this.halftonePass = {
            uniforms: {
                shape: { value: 3 },
                radius: { value: 100 },
                rotateR: { value: 90 },
                rotateB: { value: 90 },
                rotateG: { value: 90 },
                scatter: { value: 0 },
                blendingMode: { value: 1 },
                blending: { value: 1 },
            },
        }

        // Debug
        if (this.debug) {
            this.debugHalftoneFolder
                .add(this.halftonePass.uniforms.shape, 'value')
                .min(1)
                .max(5)
                .step(1)
                .name('shape')
            this.debugHalftoneFolder
                .add(this.halftonePass.uniforms.radius, 'value')
                .min(0)
                .max(100)
                .step(1)
                .name('radius')
            this.debugHalftoneFolder
                .add(this.halftonePass.uniforms.rotateR, 'value')
                .min(0)
                .max(180)
                .step(1)
                .name('rotateR')
            this.debugHalftoneFolder
                .add(this.halftonePass.uniforms.rotateB, 'value')
                .min(0)
                .max(180)
                .step(1)
                .name('rotateB')
            this.debugHalftoneFolder
                .add(this.halftonePass.uniforms.rotateG, 'value')
                .min(0)
                .max(180)
                .step(1)
                .name('rotateG')
            this.debugHalftoneFolder
                .add(this.halftonePass.uniforms.scatter, 'value')
                .min(0)
                .max(1)
                .step(0.01)
                .name('scatter')
            this.debugHalftoneFolder
                .add(this.halftonePass.uniforms.blendingMode, 'value')
                .min(0)
                .max(1)
                .step(0.01)
                .name('blendingMode')
            this.debugHalftoneFolder
                .add(this.halftonePass.uniforms.blending, 'value')
                .min(0)
                .max(5)
                .step(1)
                .name('blending')
        }

        /**
         * Effect composer
         */
        this.rt0 = new THREE.WebGLRenderTarget(
            this.config.width,
            this.config.height,
            {
                generateMipmaps: false,
                minFilter: THREE.LinearFilter,
                magFilter: THREE.LinearFilter,
                format: THREE.RGBAFormat,
                encoding: THREE.sRGBEncoding,
                samples: 1,
                stencilBuffer: true,
            }
        )
        this.rt1 = this.rt0.clone();
        this.rt2 = this.rt0.clone();

        this.renderMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(2, 2),
            new THREE.ShaderMaterial({
                uniforms: {
                    ...this.halftonePass.uniforms,
                    uBase: {
                        value: this.rt0.texture,
                    },
                    uHalfstone: {
                        value: this.rt1.texture,
                    },
                    uMask: {
                        value: this.rt2.texture,
                    },
                },
                vertexShader,
                fragmentShader,
            })
        )
    }

    resize() {
        // Instance
        this.instance.setSize(this.config.width, this.config.height)
        this.instance.setPixelRatio(this.config.pixelRatio)
    }

    renderTargets() {
        this.scene = this.experience.scene;

        // Base
        this.scene?.traverse((o) => {
            if (o.material?.name == 'TerminalMaterial') {
                o.material.colorWrite = true;
            }
        })
        this.experience.world?.terminal?.screenStencil.setMaterial('baseMat')
        this.camera.instance.layers.disableAll()
        this.camera.instance.layers.enable(LAYERS.DEFAULT)
        this.camera.instance.layers.enable(LAYERS.GLOBAL)
        this.instance.setRenderTarget(this.rt0)
        this.instance.render(this.scene, this.camera.instance)

        // Content
        this.camera.instance.layers.disableAll()
        this.camera.instance.layers.enable(LAYERS.GLOBAL)
        this.camera.instance.layers.enable(LAYERS.SCREEN)
        this.instance.setRenderTarget(this.rt1)
        this.instance.render(this.scene, this.camera.instance)
        
        // Mask
        this.experience.world?.terminal?.screenStencil.setMaterial('maskMat')
        this.scene?.traverse((o) => {
            if (o.material?.name == 'TerminalMaterial') {
                o.material.colorWrite = false;
            }
        })
        this.camera.instance.layers.disableAll()
        this.camera.instance.layers.enable(LAYERS.GLOBAL)
        this.instance.setRenderTarget(this.rt2)
        this.instance.render(this.scene, this.camera.instance)

        // Shader
        this.camera.instance.layers.set(LAYERS.DEFAULT)
        this.instance.setRenderTarget(null)
        this.instance.render(this.renderMesh, this.camera.instance)
    }

    update() {
        if (this.stats) {
            this.stats.beforeRender()
        }

        this.renderTargets()

        // Animate halftone
        if (this.halftonePass.uniforms.radius.value > 10) {
            this.halftonePass.uniforms.radius.value -= 1
        }

        if (this.stats) {
            this.stats.afterRender()
        }
    }

    destroy() {
        this.instance.renderLists.dispose()
        this.instance.dispose()
        this.rt0.dispose()
        this.rt1.dispose()
        this.rt2.dispose()
    }
}
