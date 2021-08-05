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
import ascii from './modules/ascii.js'
import circles from './modules/circles.js'
import boxes from './modules/boxes.js'
import lines from './modules/lines.js'
import motion from './modules/motion.js'
import bitwise2 from './modules/bitwise2.js'
import threshold from './modules/threshold.js'

let cnv, bg, maxIdx, procSpeed
let prevFrame
let showLoRes, showAscii, showPreRandomBoxes, showPostRandomBoxes,
    showVidThru, showCircles, showBoxes, showLines,
    showMotion, showThreshold, showEdge, showBitwise1, showBitwise2,
    showSpec, showVignette
let vidIn
let loResStep, loResHalfStep
let loLoRes, hiLoRes, baseLoRes, dynLoRes
let motionThresh

let loThresh, hiThresh, baseThresh, dynThresh

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

let vigMask, vigMaskImage
let myAsciiArt, gfx
const asciiart_width = 240, asciiart_height = 120;


window.setup = function() {

    // standalone vis
    showVidThru = false
    showAscii = false

    // general settings
    procSpeed = 30 // higher is slower
    
    // general
    showPreRandomBoxes = true

    // loRes vis
    
    showLoRes = false
    loLoRes = 4
    hiLoRes = 32
    baseLoRes = 15
    loResStep = baseLoRes
    loResHalfStep = Math.floor(baseLoRes / 2)
    dynLoRes = false
    
    showCircles = true
    showBoxes = false
    showLines = false
    showMotion = false
    motionThresh = 50
    
    // hi res settings
    loThresh = 50
    hiThresh = 190
    baseThresh = 100
    dynThresh = true

    // hi res vis
    showThreshold = true
    showEdge = false
    showBitwise1 = false
    showBitwise2 = false
    showSpec = false
    
    // global vis
    showVignette = true
    
    // general
    showPostRandomBoxes = true
    
    pixelDensity(1)
    cnv = createCanvas(1920, 1080)
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
    vigMaskImage = createImage(cnv.width, cnv.height)
    vigMaskImage.loadPixels()
    vigMaskImage.pixels = vigMask
    vigMaskImage.updatePixels()
}

window.draw = function() {
    const currSin = Math.sin(frameCount)
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
        loResStep = baseLoRes
        if (dynLoRes) {
            loResStep = Math.floor(map(sin(frameCount/procSpeed), -1, 1, loLoRes, hiLoRes))
            loResHalfStep = Math.floor(loResStep / 2)
        }
        for (let vy = 0; vy < cnv.height; vy += loResStep) {
            for (let vx = 0; vx < cnv.width; vx += loResStep) {
                const pixIdx = ((vy * width) + vx) * 4
                let [iR, iG, iB] = getPixelValues(pixIdx, vidIn.pixels)
                if (showCircles)
                    circles(vx, vy, iR, iG, iB, loResStep)
                
                if (showBoxes)
                    boxes(vx, vy, iR, iG, iB, loResStep)
                
                if (showLines)
                    lines(vx, vy, iR, iG, iB, loResStep)
                
                if (showMotion)
                    motion(pixIdx, iR, iG, iB, loResHalfStep, motionThresh, prevFrame, pixels)

                if (showVignette)
                    vignette(pixIdx, vigMask, pixels)
                }    
        }
        fr.innerText = parseInt(frameRate())
        if (showMotion) {
            prevFrame = vidIn.pixels.slice(0);
            return updatePixels()
        }
        if (showVignette)
            image(vigMaskImage, 0, 0)
        return 
    }

    let thresh = baseThresh
    if (dynThresh)
        thresh = map(sin(frameCount/procSpeed), -1, 1, loThresh, hiThresh)
    info.innerText = thresh
    // const thresh = 200
    for (let vy = 0; vy < cnv.height; vy++) {
        for (let vx = 0; vx < cnv.width; vx++) {
            const pixIdx = ((vy * width) + vx) * 4
            let r, g, b
            
            let [iR, iG, iB] = getPixelValues(pixIdx, vidIn.pixels)

            if (showThreshold)
                threshold(pixIdx, iR, iG, iB, thresh, pixels)
            
            if (showEdge) {
                [r, g, b] = edgeDetect(vx, vy, pixIdx, vidIn.pixels, pixels)
                bitwiseBrighten(pixIdx, r, g, b, 2, pixels)
            }
            
            // [iR, iG, iB] = getPixelValues(pixIdx, pixels)

            if (showBitwise1)
                bitwise1(pixIdx, iR, iG, iB, thresh, pixels)
            if (showBitwise2)
                bitwise2(pixIdx, iR, iG, iB, thresh, pixels)

            // [iR, iG, iB] = getPixelValues(pixIdx, pixels)
            
            // pixThru(pixIdx, iR, iG, iB, pixels)
            
            if (showSpec)
                specLoading(pixIdx, iR, iG, iB, thresh, maxIdx, pixels)
            
            // pixels[pixIdx + 3] = map((pixIdx + frameCount) % maxIdx, 0, maxIdx, 0, 255)

            if (showVignette)
                vignette(pixIdx, vigMask, pixels)
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