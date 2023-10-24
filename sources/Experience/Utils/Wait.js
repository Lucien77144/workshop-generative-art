class Wait {
    constructor() {
        this.delayTimer = null
    }

    async delay(ms) {
        return new Promise((resolve, reject) => {
            this.delayTimer = setTimeout(() => {
                resolve()
            }, ms)
        })
    }

    kill() {
        if (this.delayTimer) {
            clearTimeout(this.delayTimer)
            this.delayTimer = null
        }
    }
}

export { Wait }
