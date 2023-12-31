import vertexShader from './shaders/vertexShader.vert?raw'
import fragmentShader from './shaders/fragmentShader.frag?raw'
import Experience from '../../Experience'
import {
    AdditiveBlending,
    BufferAttribute,
    BufferGeometry,
    Color,
    Points,
    ShaderMaterial,
    Vector3,
} from 'three'

export default class Fireflies {
    constructor({
        _scene = null,
        _count = 150,
        _size = new Vector3(100, 100, 100),
        _fliesSize = 100,
        _position = new Vector3(0, 0, 0),
        _startTime = null,
    } = {}) {
        this.experience = new Experience()
        this.scene = _scene ?? this.experience.scene
        this.time = this.experience.time
        this.firefliesCount = _count
        this.size = _size
        this.position = _position
        this.FliesSize = _fliesSize
        this.startTime = _startTime

        this.setGeometry()
        this.setMaterial()
        this.setFireflies()

        window.addEventListener('resize', () => {
            // Update fireflies
            this.firefliesMaterial.uniforms.uPixelRatio.value = Math.min(
                window.devicePixelRatio,
                2
            )
        })
    }

    setGeometry() {
        this.firefliesGeometry = new BufferGeometry()
        this.positionArray = new Float32Array(this.firefliesCount * 3)

        this.scaleArray = new Float32Array(this.firefliesCount)

        for (let i = 0; i < this.firefliesCount; i++) {
            this.positionArray[i * 3 + 0] = Math.random(-7) * this.size.x
            this.positionArray[i * 3 + 1] = Math.random() * 10
            this.positionArray[i * 3 + 2] = Math.random() * this.size.z

            this.scaleArray[i] = Math.random() * 2
        }

        this.firefliesGeometry.setAttribute(
            'position',
            new BufferAttribute(this.positionArray, 3)
        )
        this.firefliesGeometry.setAttribute(
            'aScale',
            new BufferAttribute(this.scaleArray, 1)
        )
    }

    setMaterial() {
        this.firefliesMaterial = new ShaderMaterial({
            transparent: true,
            blending: AdditiveBlending,
            depthWrite: false,
            uniforms: {
                uTime: { value: 0 },
                uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
                uFliesSize: { value: this.FliesSize },
                uSize: { value: this.size },
                uColor: { value: new Color('#757575') },
            },
            vertexShader,
            fragmentShader,
        })
    }

    setFireflies() {
        this.fireflies = new Points(
            this.firefliesGeometry,
            this.firefliesMaterial
        )
        this.fireflies.position.set(
            this.position.x - this.size.x / 2,
            this.position.y,
            this.position.z - this.size.z / 2
        )
        this.scene.add(this.fireflies)
    }

    update() {
        this.firefliesMaterial.uniforms.uTime.value = this.time.elapsed
        const sizeF = Math.max((this.time.elapsed - this.startTime) * 0.01, 1)
        this.firefliesMaterial.uniforms.uSize.value = new Vector3(
            this.size.x * sizeF,
            this.size.y * sizeF,
            this.size.z * sizeF
        )
    }
}
