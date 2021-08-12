const GradReveal = function() {
    this.draw = function(pixIdx, iR, iG, iB, pixels) {
        if (pixels[pixIdx + 3] > 30) {
            pixels[pixIdx + 0] = iR
            pixels[pixIdx + 1] = iG
            pixels[pixIdx + 2] = iB
            pixels[pixIdx + 3] = pixels[pixIdx + 3] << 1
        }
        // return [pixels[pixIdx + 0], pixels[pixIdx + 1], pixels[pixIdx + 2]]
    }
}

export default GradReveal