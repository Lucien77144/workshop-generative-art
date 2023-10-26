const CANVAS_WIDTH = 512
const CANVAS_HEIGHT = 512

const NB_POINTS = 20

export default class Crack {
    constructor() {
        this.cvs = null
        this.ctx = null
    }

    setup() {
        this.cvs = document.createElement('canvas')
        this.ctx = this.cvs.getContext('2d')

        this.cvs.width = CANVAS_WIDTH
        this.cvs.height = CANVAS_HEIGHT
        this.cvs.style.width = CANVAS_WIDTH + 'px'
        this.cvs.style.height = CANVAS_HEIGHT + 'px'
        this.cvs.style.position = 'absolute'
        this.cvs.style.top = 0
        this.cvs.style.left = 0
        this.cvs.style.zIndex = 1
        this.cvs.style.border = '1px solid blue'

        document.body.appendChild(this.cvs)
    }

    render() {
        const ctx = this.ctx

        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

        ctx.strokeStyle = 'white'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.moveTo(0, 0) // starting point
        for (let i = 0; i < NB_POINTS; i++) {
            const x = Math.random() * CANVAS_WIDTH
            const y = Math.random() * CANVAS_HEIGHT

            // ctx.save()
            // ctx.translate(x, y)
            // ctx.beginPath()
            ctx.lineTo(x, y)
            // ctx.arc(0, 0, 100, 0, Math.PI * 2, false)
            // ctx.fill()
            // ctx.restore()
        }
        ctx.closePath()
        ctx.stroke()
        // ctx.fill()
    }
}
