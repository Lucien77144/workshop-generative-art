import * as THREE from 'three'
import Experience from './Experience.js'
import { LAYERS } from './Const/const.js'
import vertexShader from './Shaders/vertexShader.vert?raw'
import fragmentShader from './Shaders/fragmentShader.frag?raw'
import { CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer.js'

export default class Renderer {
    constructor(_options = {}) {
        this.experience = new Experience()
        this.config = this.experience.config
        this.sizes = this.experience.sizes
        this.debug = this.experience.debug
        this.stats = this.experience.stats
        this.time = this.experience.time
        this.scene = this.experience.scene
        this.cssScene = this.experience.cssScene
        this.camera = this.experience.camera

        // Debug
        if (this.debug) {
            this.debugRendererFolder = this.debug.addFolder('Renderer')
        }

        this.setInstance()
        this.setPostProcess()
    }

    setInstance() {
        this.clearColor = '#030303'

        // Renderer
        this.instance = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
        })
        this.instance.domElement.style.position = 'absolute'
        this.instance.domElement.style.top = 0
        this.instance.domElement.style.left = 0
        this.instance.domElement.style.width = '100%'
        this.instance.domElement.style.height = '100%'

        this.instance.setClearColor(this.clearColor, 0)
        this.instance.setSize(this.sizes.width, this.sizes.height)
        this.instance.setPixelRatio(this.config.pixelRatio)

        this.instance.physicallyCorrectLights = true
        // this.instance.gammaOutPut = true
        this.instance.outputEncoding = THREE.sRGBEncoding
        // this.instance.shadowMap.type = THREE.PCFSoftShadowMap
        // this.instance.shadowMap.enabled = false
        this.instance.toneMapping = THREE.NoToneMapping
        this.instance.toneMappingExposure = 1

        this.cssInstance = new CSS3DRenderer();
        this.cssInstance.setSize(this.sizes.width, this.sizes.height);
        this.cssInstance.domElement.style.position = 'absolute';
        this.cssInstance.domElement.style.top = '0px';
        document.querySelector('#css')?.appendChild(this.cssInstance.domElement);

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
        this.rt1 = this.rt0.clone()
        this.rt2 = this.rt0.clone()

        this.renderMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(2, 2),
            new THREE.ShaderMaterial({
                uniforms: {
                    uBase: {
                        value: this.rt0.texture,
                    },
                    uScreen: {
                        value: this.rt1.texture,
                    },
                    uMask: {
                        value: this.rt2.texture,
                    },
                    uTime: { value: 0 },
                    uScene: { value: 0 },
                    uDateFactorMin: {
                        value: this.experience.dateFactor?.min(90),
                    },
                },
                vertexShader,
                fragmentShader,
            })
        )
    }

    resize() {
        // Instance
        this.instance.setPixelRatio(this.config.pixelRatio)
        this.instance.setSize(this.sizes.width, this.sizes.height)
        this.cssInstance.setSize(this.sizes.width, this.sizes.height);
    }

    renderTargets() {
        this.scene = this.experience.scene

        // Base
        this.scene?.traverse((o) => {
            if (o.material?.name == 'TerminalMaterial') {
                o.material.colorWrite = true
            }
        })
        this.experience.world?.terminal?.screenStencil?.setMaterial('baseMat')
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
        this.experience.world?.terminal?.screenStencil?.setMaterial('maskMat')
        this.scene?.traverse((o) => {
            if (o.material?.name == 'TerminalMaterial') {
                o.material.colorWrite = false
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

        this.camera.instance.layers.disableAll()
        this.camera.instance.layers.enable(LAYERS.GLOBAL)
        this.camera.instance.layers.enable(LAYERS.SCREEN)
        this.cssInstance.render(this.cssScene, this.camera.instance);
    }

    update() {
        if (this.stats) {
            this.stats.beforeRender()
        }

        this.renderTargets()

        if (this.renderMesh?.material.uniforms.uTime) {
            this.renderMesh.material.uniforms.uTime.value = this.time.elapsed
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
