const GradReveal = function() {
    this.init = function() {
        console.log('GradReveal init', width, height)
        this.buffer = createGraphics(width, height)
        this.buffer.noStroke()
        this.buffer.fill(255)
        this.buffer.rect(90, 90, 200, 200)
    }

    this.draw = function(pixIdx, iR, iG, iB, pixels) {
        // image(this.buffer, 0, 0)
        // if (random(0, 1) > 0.99999995)
        //     console.log('gradReveal')
        // if (pixels[pixIdx + 3] > 30) {
            pixels[pixIdx + 0] = iR
            pixels[pixIdx + 1] = iG
            pixels[pixIdx + 2] = iB
            pixels[pixIdx + 3] = pixels[pixIdx + 3]
        // }

        // return [pixels[pixIdx + 0], pixels[pixIdx + 1], pixels[pixIdx + 2]]
    }
}

export default GradReveal