import Experience from '../Experience'

export default class City {
    constructor(_options) {
        this.experience = new Experience()
        this.config = this.experience.config
        this.group = _options.group
        this.resources = this.experience.resources

        this.init()
    }

    init() {
        this.city = this.resources.items.city.scene
        // console.log(this.city)
        // this.mixer = new AnimationMixer(this.city);

        this.city.position.set(.1, 0.2, -1)
        this.city.scale.set(0.2, 0.2, 0.2)

        this.group.add(this.city)
    }

    resize() {}

    update() {}

    destroy() {}
}
