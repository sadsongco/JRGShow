import { BGCOL } from './modules/vis1.js'

let cnv, bg, maxIdx
let vidIn
const fr = document.getElementById('fr')
// const ander = 0b11000000

window.setup = function() {
    cnv = createCanvas(window.innerWidth, window.innerHeight)
    cnv.parent('vis')
    vidIn = createCapture(VIDEO, ()=>{
        vidIn.hide()
        vidIn.size(cnv.width, cnv.height)
    })
    bg = color(BGCOL)
    bg.setAlpha(255)
    background(bg)
    bg.setAlpha(28)
    frameRate(24)
    maxIdx = width * height * 4
}

window.draw = function() {
    background(bg)
    // const currSin = Math.sin(frameCount/2)
    fill(random(0, 255), random(0, 255), random(0, 255), random(0, 100))
    const x = random(30, width-30)
    const y = random(30, height-30)
    const w = random(10, 30)
    const h = random(10, 30)
    rect(x, y, w, h)
    loadPixels()
    vidIn.loadPixels()
    const thresh = map(sin(frameCount/200), -1, 1, 0, 255)
    for (let vy = 0; vy <height; vy++) {
        for (let vx = 0; vx < width; vx++) {
            const pixIdx = ((vy * width) + vx) * 4
            const idxCoff = (1 - ((maxIdx - pixIdx) / maxIdx)) * 255
            // const idxCoff = 1
            // const iR = (vidIn.pixels[pixIdx + 0] * idxCoff)/255
            // const iG = (vidIn.pixels[pixIdx + 1] * idxCoff)/255
            // const iB = (vidIn.pixels[pixIdx + 2] * idxCoff)/255

            const iR = (vidIn.pixels[pixIdx + 0] & thresh) << 1
            const iG = vidIn.pixels[pixIdx + 1] | idxCoff
            const iB = (vidIn.pixels[pixIdx + 2] & 255- thresh) << 1

            pixels[pixIdx + 0] = iR
            pixels[pixIdx + 1] = iG
            pixels[pixIdx + 2] = iB

            // if (iR < thresh) {
            //     pixels[pixIdx + 0] *= iR*idxCoff/255
            // }
            // if (iG < thresh) {
            //     pixels[pixIdx + 1] *= iG*idxCoff/255
            // }
            // if (iB < thresh) {
            //     pixels[pixIdx + 2] *= iB*idxCoff/255
            // }
            // pixels[pixIdx + 3] = map((pixIdx + frameCount) % maxIdx, 0, maxIdx, 0, 255)
        }
    }
    updatePixels()
    fill(random(0, 255), random(0, 255), random(0, 255), random(0, 100))
    const x2 = random(30, width-30)
    const y2 = random(30, height-30)
    const w2 = random(10, 30)
    const h2 = random(10, 30)
    rect(x2, y2, w2, h2)

    fr.innerText = frameRate()
}

window.keyPressed = function() {
    if (key === 'f') {
        let fs = fullscreen()
        fullscreen(!fs)
    }
}

window.windowResized = function(){
	// when window is resized loop through all visualisations
	// call their onResize method, if they have it
	resizeCanvas(windowWidth, windowHeight);
    vidIn.size(width, height)
}