import { BGCOL } from './modules/vis1.js'
import { setlist } from './modules/setlist.js'
import randomBoxes from './modules/randomBoxes.js'
import vidThru from './modules/vidThru.js'
import bitwise1 from './modules/bitwise1.js'
import bitwiseBrighten from './modules/bitwiseBrighten.js'
import specLoading from './modules/specLoading.js'
import pixThru from './modules/pixThru.js'
import vignetteMask from './modules/vignetteMask.js'
import vignette from './modules/vignette.js'
import getPixelValues from './modules/getPixelValues.js'
import edgeDetect from './modules/edgeDetect.js'
import getPixelMatrix from './modules/getPixelMatrix.js'
import ascii from './modules/ascii.js'

let cnv, bg, maxIdx
let vidIn
const fr = document.getElementById('fr')
const info = document.getElementById('info')
const visTitle = document.getElementById('visTitle')

const urlParams = new URLSearchParams(window.location.search)
const setno = urlParams.get('setno')
const setName = document.createTextNode(setlist[setno])
visTitle.appendChild(setName)

const channel = new BroadcastChannel('vis-comms')
channel.addEventListener('message', (e) => {
    window.open('', 'visControl')
})

let vigMask
let myAsciiArt, gfx
const asciiart_width = 240, asciiart_height = 120;


window.setup = function() {
    pixelDensity(1)
    cnv = createCanvas(1920, 1080)
    // console.log(`cnv w: ${cnv.width}, cnv h: ${cnv.height}`)
    cnv.parent('vis')
    vidIn = createCapture(VIDEO, ()=>{
        vidIn.hide()
        vidIn.size(cnv.width, cnv.height)
    })

    // graphics helper for ascii
    gfx = createGraphics(asciiart_width, asciiart_height)
    gfx.pixelDensity(1)
    myAsciiArt = new AsciiArt(this)
    textAlign(CENTER, CENTER); textFont('monospace', 8); textStyle(NORMAL);

    bg = color(BGCOL)
    bg.setAlpha(255)
    background(bg)
    // bg.setAlpha(50)
    frameRate(30)
    maxIdx = cnv.width * cnv.height * 4
    vigMask = vignetteMask(cnv.width, cnv.height)
}

window.draw = function() {
    background(bg)

    ascii(vidIn, gfx, myAsciiArt, this)

    // const currSin = Math.sin(frameCount/2)

    // randomBoxes()

    // vidThru(vidIn)

    // loadPixels()
    // vidIn.loadPixels()

    // const thresh = map(sin(frameCount/20), -1, 1, 100, 150)
    // for (let vy = 0; vy < cnv.height; vy++) {
    //     for (let vx = 0; vx < cnv.width; vx++) {
    //         const pixIdx = ((vy * width) + vx) * 4
            
    //         let [iR, iG, iB] = getPixelValues(pixIdx, vidIn.pixels)
            
    //         // edgeDetect(vx, vy, pixIdx, vidIn.pixels, pixels)
            
    //         // let [iR, iG, iB] = getPixelValues(pixIdx, pixels)

    //         // bitwiseBrighten(pixIdx, iR, iG, iB, 2, pixels)

    //         // const idxCoff = 1
            
    //         // bitwise1(pixIdx, iR, iG, iB, thresh, pixels)

    //         // [iR, iG, iB] = getPixelValues(pixIdx, pixels)
            
    //         pixThru(pixIdx, iR, iG, iB, pixels)
            
    //         // specLoading(pixIdx, iR, iG, iB, thresh, maxIdx, pixels)
            
    //         // pixels[pixIdx + 3] = map((pixIdx + frameCount) % maxIdx, 0, maxIdx, 0, 255)

    //         // vignette(pixIdx, vigMask, pixels)
    //     }
    // }
    // updatePixels()

    // randomBoxes()

    fr.innerText = parseInt(frameRate())
}

window.keyPressed = function() {
    if (key === 'f') {
        let fs = fullscreen()
        fullscreen(!fs)
    }
}

window.windowResized = function(){
    ascii.onResize()
}

window.onload = function() {
    window.open('', 'visControl')
}