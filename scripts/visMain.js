// LOAD PARAMETERS
import { BGCOL }        from './modules/parameters/vis1.js'
import { setlist }      from './modules/parameters/setlist.js'

// LOAD UTILITIES
import vignetteMask     from './modules/util/vignetteMask.js'
import getPixelValues   from './modules/util/getPixelValues.js'

// LOAD VISUALISERS
import vidThru          from './modules/visualisers/vidThru.js'
import vidThruPoster    from './modules/visualisers/vidThruPoster.js'
import vidThruHalf      from './modules/visualisers/vidThruHalf.js'
import randomBoxes      from './modules/visualisers/randomBoxes.js'
import bitwise1         from './modules/visualisers/bitwise1.js'
import bitwiseBrighten  from './modules/visualisers/bitwiseBrighten.js'
import specLoading      from './modules/visualisers/specLoading.js'
import pixThru          from './modules/visualisers/pixThru.js'
import vignette         from './modules/visualisers/vignette.js'
import edgeDetect       from './modules/visualisers/edgeDetect.js'
import ascii            from './modules/visualisers/ascii.js'
import circles          from './modules/visualisers/circles.js'
import boxes            from './modules/visualisers/boxes.js'
import lines            from './modules/visualisers/lines.js'
import motion           from './modules/visualisers/motion.js'
import bitwise2         from './modules/visualisers/bitwise2.js'
import threshold        from './modules/visualisers/threshold.js'
import scriptTextFull   from './modules/visualisers/scriptText.js'

// GLOBAL VARIABLES
let cnv, maxIdx
let vidIn
let prevFrame
let myAsciiArt, gfx
let vigMask, vigMaskImage
const asciiart_width = 240, asciiart_height = 120;
let scriptFont
let scriptVis

// VISUALISER FLAGS
let showLoRes, showAscii, showPreRandomBoxes, showPostRandomBoxes,
    showVidThru, showVidThruPoster, showVidThruHalf,
    showCircles, showBoxes, showLines,
    showMotion, showThreshold, showEdge, showBitwise1, showBitwise2,
    showSpec, showVignette,
    showFullScript, showHalfScript

// BACKGROUND FLAGS AND VARIABLES
let bgs = [], bgOpacity
    
// VISUALISER ADJUSTABLE VARIABLES
let procSpeed
let loResStep, loResHalfStep
let loLoRes, hiLoRes, baseLoRes, dynLoRes
let motionThresh
let loThresh, hiThresh, baseThresh, dynThresh
let lineSpeed
let scriptText

// TARGET HTML ELEMENTS
const fr = document.getElementById('fr')
const info = document.getElementById('info')
const setStatus = document.getElementById('setStatus')
const visTitle = document.getElementById('visTitle')
const canvasContainer = document.getElementById('canvasContainer')

let scriptLines

// CONTROLLER / VISUALISER COMMUNICATION
const channel = new BroadcastChannel('vis-comms')
channel.addEventListener('message', (e) => {
    console.log(e.data)
    if (e.data.setItem) {
        if (visTitle.style.opacity != 0) {
            visTitle.style.opacity = 0
            visTitle.ontransitionend = () => displayTrackTitle(e.data.setItem)
        } else {
            displayTrackTitle(e.data.setItem)
        }
        canvasContainer.style.opacity = 0
    }
    if (e.data.setItemFadeIn) {
        e.data.setItem = e.data.setItemFadeIn
        visTitle.style.opacity = 1
    }
    if (e.data.setItemFadeOut)
        visTitle.style.opacity = 0
    if (e.data.visFadeIn)
        canvasContainer.style.opacity = 1
    if (e.data.visFadeOut)
        canvasContainer.style.opacity = 0
    if (e.data.threshBase)
        baseThresh = e.data.threshBase
    if ('threshDyn' in e.data)
        dynThresh = e.data.threshDyn
    if (e.data.threshDynMin) {
        loThresh = e.data.threshDynMin
        loResStep = Math.floor(map(sin(frameCount/procSpeed), -1, 1, loLoRes, hiLoRes))
        loResHalfStep = Math.floor(loResStep / 2)
    }
    if (e.data.threshDynMax) {
        hiThresh = e.data.threshDynMax
        loResStep = Math.floor(map(sin(frameCount/procSpeed), -1, 1, loLoRes, hiLoRes))
        loResHalfStep = Math.floor(loResStep / 2)
    }
    window.open('', 'visControl')
})

// p5.js preload
window.preload = function() {
    scriptText = loadStrings('./assets/scriptText/TWBB.txt', ()=>{console.log('text loaded')}, ()=>{console.log('error loading text')});
    scriptFont = loadFont('./assets/fonts/CourierPrime-Regular.ttf')
}


// p5.js setup
window.setup = function() {

    // set up script variables and object
    scriptLines = scriptText.length
    scriptVis = new scriptTextFull()
    scriptVis.init(scriptText, 80, 560, 28, 22)
    textFont(scriptFont)

    // standalone vis
    showVidThru =           false
    showVidThruPoster =     false
    showVidThruHalf =       false
    showAscii =             true

    // general settings
    procSpeed =             30 // higher is slower
    
    // general
    showPreRandomBoxes =    false

    // loRes vis settings
    showLoRes =             false
    loLoRes =               4
    hiLoRes =               32
    baseLoRes =             15
    loResStep =             baseLoRes
    loResHalfStep =         Math.floor(baseLoRes / 2)
    dynLoRes =              false
    lineSpeed =             10 // higher is slower

    // loRes vis flags
    showCircles =           false
    showBoxes =             false
    showLines =             false
    showMotion =            false
    motionThresh =          50
    
    // hi res settings
    loThresh =              50
    hiThresh =              190
    baseThresh =            100
    dynThresh =             false

    // hi res vis flags
    showThreshold =         false
    showEdge =              false
    showBitwise1 =          false
    showBitwise2 =          false
    showSpec =              false
    showFullScript =        false
    showHalfScript =        false
    
    // global vis flags
    showVignette =          true
    
    // general flags
    showPostRandomBoxes =   false

    // background flags
    bgOpacity =             0
    
    pixelDensity(1)
    cnv = createCanvas(1920, 1080)
    // noLoop()
    cnv.parent('canvasContainer')
    vidIn = createCapture(VIDEO, ()=>{
        vidIn.hide()
        vidIn.size(cnv.width, cnv.height)
    })

    // graphics helper for ascii
    gfx = createGraphics(asciiart_width, asciiart_height)
    gfx.pixelDensity(1)
    myAsciiArt = new AsciiArt(this)
    textAlign(CENTER, CENTER); textFont('monospace', 8); textStyle(NORMAL);

    // common background settings
    bgs[0] = color(BGCOL)
    bgs[0].setAlpha(255)
    bgs[1] = color(BGCOL)
    bgs[1].setAlpha(50)
    bgs[2] = color(BGCOL)
    bgs[2].setAlpha(5)

    frameRate(24)
    maxIdx = cnv.width * cnv.height * 4

    // set up vignette
    vigMask = vignetteMask(cnv.width, cnv.height)
    vigMaskImage = createImage(cnv.width, cnv.height)
    vigMaskImage.loadPixels()
    vigMaskImage.pixels = vigMask
    vigMaskImage.updatePixels()
}


// p5.js draw loop
window.draw = function() {

    const currSin = Math.sin(frameCount)
    background(bgs[bgOpacity])

    if (showFullScript && frameCount > frameRate() * 5 && frameCount % int(frameRate()/4) === 0)
        return scriptVis.draw(scriptText, 40)
    
    if (showHalfScript) {
        vidThruHalf(vidIn)
        if (frameCount > frameRate() * 5 && frameCount % int(frameRate()/4) === 0)
            return scriptVis.draw(scriptText, 40)
    }

    if (showVidThru)
        return vidThru(vidIn)

    if (showVidThruPoster)
        return vidThruPoster(vidIn)

    if (showVidThruHalf)
        return vidThruHalf(vidIn)

    if (showAscii)
        return ascii(vidIn, gfx, myAsciiArt, this)

    if (showPreRandomBoxes)
        randomBoxes()
    
    loadPixels()
    vidIn.loadPixels()

    /* *****************
       LO RES VISUALISER
       ***************** */
    
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
                    circles(vx, vy, iR, iG, iB, loResStep, showVignette, vigMask)
                
                if (showBoxes)
                    boxes(vx, vy, iR, iG, iB, loResStep, showVignette, vigMask)
                
                if (showLines)
                    lines(vx, vy, iR, iG, iB, loResStep, lineSpeed, showVignette, vigMask)
                
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

    /* *****************
       HI RES VISUALISER
       ***************** */    
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
    if (key === 'f')
        fullscreen(1)
}

window.windowResized = function(){
    // ascii.onResize()
}

window.onload = function() {
    window.open('', 'visControl')
}

const displayTrackTitle = function(id) {
    visTitle.innerHTML = ''
    const setName = document.createTextNode(setlist[id])
    visTitle.appendChild(setName)
}