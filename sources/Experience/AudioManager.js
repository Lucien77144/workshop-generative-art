import Experience from './Experience.js'
import { Wait } from './Utils/Wait.js'
import gsap from 'gsap'

const w = new Wait()

export default class AudioManager {
    constructor(_options) {
        // Options
        this.experience = new Experience()
        this.config = this.experience.config
        this.targetElement = this.experience.targetElement

        this.setInstance()
    }

    setInstance() {
        // Set up
        const ambientSound = new Audio()
        ambientSound.src = './assets/sounds/synth-unease.mp3'
        ambientSound.volume = 0.02
        ambientSound.loop = true

        const lightSound = new Audio()
        lightSound.src = './assets/sounds/light-on.mp3'
        lightSound.volume = 1

        const clickSound = new Audio()
        clickSound.src = './assets/sounds/click.mp3'

        const $$boot = document.querySelector('.c-experience-boot')
        const $$bootInput = document.querySelector('.c-experience-boot-content__input')

        $$boot.addEventListener('click', async () => {
            clickSound.play()
        })

        const keyboardSounds = []

        for (let i = 0; i <= 3; i++) {
            keyboardSounds.push(new Audio())
            keyboardSounds[i].src = `./assets/sounds/key-${i}.mp3`
            keyboardSounds[i].volume = 1
        }

        $$bootInput.addEventListener('input', () => {
            keyboardSounds[
                Math.floor(Math.random() * keyboardSounds.length)
            ].play()
        })

        this.experience.eventEmitter.addEventListener('playAmbient', () => {
            ambientSound.play()
            lightSound.play()
        })

        const bootSound = new Audio()
        bootSound.src = './assets/sounds/boot-2.mp3'
        bootSound.volume = 0.1

        this.experience.eventEmitter.addEventListener(
            'goFocusMode',
            async () => {
                gsap.to(ambientSound, {
                    volume: 0.2,
                    duration: 2,
                    ease: 'power3.out',
                })
                await w.delay(2000)
                bootSound.play()
                w.kill()
            }
        )

        const processSound = new Audio()
        processSound.src = './assets/sounds/process.mp3'
        processSound.volume = 0.1

        this.experience.eventEmitter.addEventListener('generate', async () => {
            processSound.play()
        })
    }

    destroy() {
        //
    }
}
