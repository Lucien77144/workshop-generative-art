import * as THREE from 'three'
import GUI from 'lil-gui'

import Time from './Utils/Time.js'
import Sizes from './Utils/Sizes.js'
import Stats from './Utils/Stats.js'

import Resources from './Resources.js'
import Renderer from './Renderer.js'
import Camera from './Camera.js'
import World from './World.js'

import assets from './assets.js'
import Crack from './Components/Cracks.js'

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
        this.setDateFactor()
        this.setStats()
        this.setScene()
        this.setCamera()
        this.setRenderer()
        this.setResources()
        this.setWorld()

        this.sizes.on('resize', () => {
            this.resize()
        })

        this.update()
    }

    // makeCracks() {
    //     this.cracks = new Crack()
    //     this.cracks.setup()
    //     this.cracks.render()
    // }

    setConfig() {
        this.config = {}

        // Debug
        this.config.debug = window.location.hash === '#debug'

        // Pixel ratio
        this.config.pixelRatio = Math.min(
            Math.max(window.devicePixelRatio, 1),
            2
        )

        // Width and height
        const boundings = this.targetElement.getBoundingClientRect()
        this.config.width = boundings.width
        this.config.height = boundings.height || window.innerHeight
    }

    setDebug() {
        if (this.config.debug) {
            this.debug = new GUI()
        }
    }

    setDateFactor() {
        // User input
        const USER_INPUT = parseInt(
            new URLSearchParams(window.location.search).get('date')
        )
        const MIN_INPUT = 2000
        const MAX_INPUT = 3000
        const RANGE = MAX_INPUT - MIN_INPUT

        // if 'date' is < MIN_INPUT, force it to be set at MIN_INPUT
        if (USER_INPUT < MIN_INPUT || !USER_INPUT) {
            window.location.search = `date=${MIN_INPUT}`
        }

        // if 'date' is > MAX_INPUT, force it to bet set at MAX_INPUT
        if (USER_INPUT > MAX_INPUT) {
            window.location.search = `date=${MAX_INPUT}`
        }

        // Makes the final value easier to use
        this.dateFactor = {
            date: USER_INPUT,
            value: (USER_INPUT - MIN_INPUT) / RANGE,
            update: () => {
                // this.dateFactor.date = this.dateFactor.value() * RANGE + MIN_INPUT
                if (this.dateFactor.date < MIN_INPUT || !this.dateFactor.date) {
                    this.dateFactor.date = MIN_INPUT
                } else if (this.dateFactor.date > MAX_INPUT) {
                    this.dateFactor.date = MAX_INPUT
                }

                this.dateFactor.value =
                    (this.dateFactor.date - MIN_INPUT) / RANGE
            }, // value between 0 and 1
            min: (offset) => {
                // min value by offset (offset between 0 and 1)

                const DATE = this.dateFactor.date
                const LIMIT = offset * RANGE * 0.01 + MIN_INPUT
                const USER = DATE < LIMIT ? LIMIT : DATE

                return (USER - LIMIT) / (MAX_INPUT - LIMIT)
            },
            max: (offset) => {
                // max value by offset (offset between 0 and 1)

                const DATE = this.dateFactor.date
                const LIMIT = offset * RANGE * 0.01 + MIN_INPUT
                const USER = DATE > LIMIT ? LIMIT : DATE

                return (USER - MIN_INPUT) / (LIMIT - MIN_INPUT)
            },
            step: (offset) => {
                // Steped value by offset

                return Math.floor(this.dateFactor.value / offset) * offset
            },
        }

        if (this.debug) {
            this.debugRendererFolder = this.debug.addFolder('Experience')

            this.debugRendererFolder
                .add(this.dateFactor, 'date')
                .name('Date')
                .min(MIN_INPUT)
                .max(MAX_INPUT)
                .onChange((e) => {
                    e = parseInt(e)
                    const renderU =
                        this.renderer?.renderMesh?.material?.uniforms
                    const grassFloor = this.world?.terminal?.screen?.grassFloor
                    const grassU = grassFloor?.grass?.material?.uniforms
                    const groundU = grassFloor?.ground?.material?.uniforms

                    this.dateFactor.update()
                    if (renderU?.uDateFactor) {
                        renderU.uDateFactorMin.value = this.dateFactor.min(90)
                        renderU.uDateFactor.value = this.dateFactor.value
                    }
                    if (grassU?.uDateFactor) {
                        grassU.uDateFactor.value = this.dateFactor.value
                    }
                    if (groundU?.uDateFactor) {
                        groundU.uDateFactor.value = this.dateFactor.value
                    }
                })
        }
    }

    setStats() {
        if (this.config.debug) {
            this.stats = new Stats(true)
        }
    }

    setScene() {
        this.scene = new THREE.Scene()
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
    }

    setWorld() {
        this.world = new World()
    }

    update() {
        if (this.stats) this.stats.update()

        this.camera.update()

        if (this.world) this.world.update()

        if (this.renderer) this.renderer.update()

        window.requestAnimationFrame(() => {
            this.update()
        })
    }

    resize() {
        // Config
        const boundings = this.targetElement.getBoundingClientRect()
        this.config.width = boundings.width
        this.config.height = boundings.height

        this.config.pixelRatio = Math.min(
            Math.max(window.devicePixelRatio, 1),
            2
        )

        if (this.camera) this.camera.resize()

        if (this.renderer) this.renderer.resize()

        if (this.world) this.world.resize()
    }

    destroy() {}
}
