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
import circles from './modules/circles.js'
import boxes from './modules/boxes.js'

let cnv, bg, maxIdx
let showLoRes, showAscii, showPreRandomBoxes, showPostRandomBoxes, showVidThru, showCircles, showBoxes
let vidIn
let loResStep
let dynLoRes
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
    showLoRes = false
    showCircles = false
    showBoxes = false
    showAscii = false
    showPreRandomBoxes = false
    showPostRandomBoxes = false
    showVidThru = false
    loResStep = 17
    dynLoRes = false
    pixelDensity(1)
    cnv = createCanvas(1920, 1080)
    console.log(`cnv w: ${cnv.width}, cnv h: ${cnv.height}`)
    // noLoop()
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

    if (showVidThru)
        return vidThru(vidIn)

    if (showAscii)
        return ascii(vidIn, gfx, myAsciiArt, this)

    loadPixels()
    vidIn.loadPixels()
    
    if (showPreRandomBoxes)
        randomBoxes()
    
    loadPixels()
    vidIn.loadPixels()
    
    if (showLoRes) {
        if (dynLoRes)
            loResStep = Math.floor(map(sin(frameCount/100), -1, 1, 8, 32))
        for (let vy = 0; vy < cnv.height; vy += loResStep) {
            for (let vx = 0; vx < cnv.width; vx += loResStep) {
                const pixIdx = ((vy * width) + vx) * 4
                
                let [iR, iG, iB] = getPixelValues(pixIdx, vidIn.pixels)

                if (showCircles)
                    circles(vx, vy, iR, iG, iB, loResStep)
                
                if (showBoxes)
                    boxes(vx, vy, iR, iG, iB, loResStep)
            }
        }
        fr.innerText = parseInt(frameRate())
        return 
    }

    // const thresh = map(sin(frameCount/20), -1, 1, 10, 150)
    const thresh = 200
    for (let vy = 0; vy < cnv.height; vy++) {
        for (let vx = 0; vx < cnv.width; vx++) {
            const pixIdx = ((vy * width) + vx) * 4
            
            let [iR, iG, iB] = getPixelValues(pixIdx, vidIn.pixels)
            
            // edgeDetect(vx, vy, pixIdx, vidIn.pixels, pixels)
            
            // let [iR, iG, iB] = getPixelValues(pixIdx, pixels)

            // bitwiseBrighten(pixIdx, iR, iG, iB, 2, pixels)

            // bitwise1(pixIdx, iR, iG, iB, thresh, pixels)

            // [iR, iG, iB] = getPixelValues(pixIdx, pixels)
            
            // pixThru(pixIdx, iR, iG, iB, pixels)
            
            specLoading(pixIdx, iR, iG, iB, thresh, maxIdx, pixels)
            
            // pixels[pixIdx + 3] = map((pixIdx + frameCount) % maxIdx, 0, maxIdx, 0, 255)

            // vignette(pixIdx, vigMask, pixels)
        }
    }
    updatePixels()

    if (showPostRandomBoxes)
        randomBoxes()

    fr.innerText = parseInt(frameRate())
}

window.keyPressed = function() {
    if (key === 'f') {
        let fs = fullscreen()
        fullscreen(!fs)
    }
}

window.windowResized = function(){
    // ascii.onResize()
}

window.onload = function() {
    window.open('', 'visControl')
}