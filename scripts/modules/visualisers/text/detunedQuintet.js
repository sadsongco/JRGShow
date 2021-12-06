const DetunedQuintet = function() {
    const backgroundImagePath = "./assets/images/score/DeTunedBackdrop.png"
    let bgImg
    let yellowAmt = 0
    let maxYellow = 100
    let minYellow = 0
    let yellowFalloff = 0.75
    this.init = function() {
        // console.log('INIT')
        bgImg = loadImage(backgroundImagePath)
    }

    this.drawBG = function(yellowTrig=false) {
        image(bgImg, 0, 0)
        if (yellowTrig)
            yellowAmt = maxYellow
        if (yellowAmt > minYellow)
            yellowAmt = Math.floor(yellowAmt * yellowFalloff)
    }

    this.draw = function(pixIdx, iR, iG, iB, pixels) {
        pixels[pixIdx + 0] = pixels[pixIdx + 0] >> 1
        pixels[pixIdx + 1] = yellowAmt
        pixels[pixIdx + 2] = 0
        pixels[pixIdx + 3] = 255
    }
}

export default DetunedQuintet