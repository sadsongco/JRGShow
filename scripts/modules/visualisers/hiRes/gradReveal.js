const GradReveal = function() {
    this.init = function() {
        this.buffer = createGraphics(width, height)
        this.buffer.noStroke()
        this.buffer.fill(255)
        this.buffer.rect(90, 90, 200, 200)
    }

    this.draw = function(pixIdx, iR, iG, iB, pixels) {
        pixels[pixIdx + 0] = iR << 2
        pixels[pixIdx + 1] = iG << 2
        pixels[pixIdx + 2] = iB << 2
        pixels[pixIdx + 3] = pixels[pixIdx + 3]
    }
}

export default GradReveal