import * as THREE from 'three'
import GUI from 'lil-gui'

import Time from './Utils/Time.js'
import Sizes from './Utils/Sizes.js'
import Stats from './Utils/Stats.js'

import Resources from './Resources.js'
import Renderer from './Renderer.js'
import Camera from './Camera.js'
import World from './World.js'
import AudioManager from './AudioManager.js'

import assets from './assets.js'

export default class Experience {
    static instance

    constructor(_options = {}) {
        if (Experience.instance) {
            return Experience.instance
        }
        Experience.instance = this

        // Options
        this.targetElement = _options.targetElement

        if (!this.targetElement) {
            console.warn("Missing 'targetElement' property")
            return
        }

        this.time = new Time()
        this.sizes = new Sizes()
        this.setConfig()
        this.setDebug()
        this.setStats()
        this.setScene()
        this.setCssScene()
        this.setCamera()
        this.setRenderer()

        this.eventEmitter = this.renderer.instance.domElement

        this.setResources()
        this.setWorld()

        this.dateFactor = {
            value: 0,
        }

        this.setAudioManager()

        this.eventEmitter.addEventListener('click', (e) => {
            if (this.world) {
                this.eventEmitter.dispatchEvent(new CustomEvent('playAmbient'))
            }

            if (this.world.spotLight.intensity !== 0) {
                this.eventEmitter.dispatchEvent(new CustomEvent('goFocusMode'))
                this.eventEmitter.classList.add('-is-not-clickable')
            }
        })

        this.eventEmitter.addEventListener(
            'setDateFactor',
            (e) => {
                this.setDateFactor(e.detail)
                this.renderer.renderMesh.material.uniforms.uDateFactorMin.value =
                    this.dateFactor.min(90)
            },
            { once: true }
        )

        this.sizes.on('resize', () => this.resize())

        this.update()
    }

    setConfig() {
        this.config ??= {}

        // Debug
        this.config.debug = window.location.hash === '#debug'

        // Pixel ratio
        this.config.pixelRatio = Math.min(
            Math.max(window.devicePixelRatio, 1),
            2
        )

        // Width and height
        this.config.width = document.documentElement.clientWidth
        this.config.height = document.documentElement.clientHeight
    }

    setDebug() {
        if (this.config.debug) {
            this.debug = new GUI()
        }
    }

    setDateFactor(value) {
        const MIN_INPUT = 2000
        const MAX_INPUT = 3000

        const clampDate = (
            date = MIN_INPUT + (MAX_INPUT - MIN_INPUT) * 0.5
        ) => {
            if (date < MIN_INPUT) {
                this.screenInterface.toggleInterface()
                return MIN_INPUT
            } else if (date > MAX_INPUT) {
                this.eventEmitter.dispatchEvent(new CustomEvent('setError'))
                return MAX_INPUT
            } else {
                this.screenInterface.toggleInterface()
                return date
            }
        }
        const USER_INPUT = clampDate(parseInt(value))
        const RANGE = MAX_INPUT - MIN_INPUT

        this.dateFactor = {
            date: USER_INPUT,
            value: (USER_INPUT - MIN_INPUT) / RANGE,
            update: (date) => {
                date && (this.dateFactor.date = clampDate(date))

                this.dateFactor.value =
                    (this.dateFactor.date - MIN_INPUT) / RANGE
            },
            min: (offset) => {
                const DATE = this.dateFactor.date
                const LIMIT = offset * RANGE * 0.01 + MIN_INPUT
                const USER = DATE < LIMIT ? LIMIT : DATE

                return (USER - LIMIT) / (MAX_INPUT - LIMIT)
            },
            max: (offset) => {
                const DATE = this.dateFactor.date
                const LIMIT = offset * RANGE * 0.01 + MIN_INPUT
                const USER = DATE > LIMIT ? LIMIT : DATE

                return (USER - MIN_INPUT) / (LIMIT - MIN_INPUT)
            },
            step: (offset) => {
                return Math.floor(this.dateFactor.value / offset) * offset
            },
        }

        this.eventEmitter.dispatchEvent(new CustomEvent('generate'))
    }

    setStats() {
        if (this.config?.debug) {
            this.stats = new Stats(true)
        }
    }

    setScene() {
        this.scene = new THREE.Scene()
    }

    setCssScene() {
        this.cssScene = new THREE.Scene()
    }

    setCamera() {
        this.camera = new Camera()
    }

    setRenderer() {
        this.renderer = new Renderer({
            rendererInstance: this.rendererInstance,
        })

        this.targetElement.appendChild(this.renderer.instance.domElement)
    }

    setResources() {
        this.resources = new Resources(assets)
        this.resources.on('progress', (e) => {
            const prog = Math.round((e.loaded / e.toLoad) * 100 || 0)
            document.getElementById('loading-counter').innerText = prog + '%'

            if (prog === 100) {
                document.querySelector('.loading').classList.add('hidden')
            }
        })
    }

    setWorld() {
        this.world = new World()
    }

    setAudioManager() {
        this.audioManager = new AudioManager()
    }

    update() {
        this.stats?.update()
        this.camera?.update()
        this.world?.update()
        this.renderer?.update()

        window.requestAnimationFrame(() => {
            this.update()
        })
    }

    resize() {
        // Config
        this.setConfig()

        this.camera.resize()
        this.renderer.resize()
    }

    destroy() {}
}
