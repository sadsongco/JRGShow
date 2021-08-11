// LOAD PARAMETERS
import {    BGCOL,
            activeVis } from './modules/parameters/visParams.js'
import { setlist }      from './modules/parameters/setlist.js'

// LOAD UTILITIES
import vignetteMask     from './modules/util/vignetteMask.js'
import getPixelValues   from './modules/util/getPixelValues.js'
import resetActiveVis   from './modules/util/resetActiveVis.js'
import prepareVis       from './modules/util/prepareVis.js'
// import resetPixels      from './modules/util/resetPixels.js'


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
import Ascii            from './modules/visualisers/ascii.js'
import circles          from './modules/visualisers/circles.js'
import boxes            from './modules/visualisers/boxes.js'
import lines            from './modules/visualisers/lines.js'
import motion           from './modules/visualisers/motion.js'
import bitwise2         from './modules/visualisers/bitwise2.js'
import threshold        from './modules/visualisers/threshold.js'
import ScriptTextFull   from './modules/visualisers/scriptText.js'
import GradReveal       from './modules/visualisers/gradReveal.js'

// GLOBAL VARIABLES
const visVars = {
    bgOpacity: 0,
    scriptTextRun: false,
}
let cnv, maxIdx
let vidIn
let prevFrame
let asciiVis, context
let vigMask, vigMaskImage
let asciiart_width, asciiart_height, asciiCof
let scriptFont
let scriptVis, gradRevealVis
let currTrack

// VISUALISER FLAGS


// BACKGROUND FLAGS AND VARIABLES
// let bgs = []
    
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

// let scriptLines

// CONTROLLER / VISUALISER COMMUNICATION
const channel = new BroadcastChannel('vis-comms')
channel.addEventListener('message', (e) => {
    // console.log(e.data)
    if (e.data.changeTrack) {
        asciiVis.init(context, asciiart_width, asciiart_height)
        if (currTrack !== e.data.setItem)
            currTrack = e.data.setItem
        if (visTitle.style.opacity != 0) {
            visTitle.style.opacity = 0
            visTitle.ontransitionend = () => displayTrackTitle(currTrack)
        } else {
            displayTrackTitle(currTrack)
        }
        if (canvasContainer.style.opacity != 0) {
            canvasContainer.style.opacity = 0
            canvasContainer.ontransitionend = () => {
                resetActiveVis(activeVis)
                prepareVis(currTrack, activeVis, scriptVis, scriptText, visVars, asciiVis)
            }
        } else {
            resetActiveVis(activeVis)
            prepareVis(currTrack, activeVis, scriptVis, scriptText, visVars, asciiVis)
        }
    }
    if (e.data.setItemFadeIn)
        visTitle.style.opacity = 1
    if (e.data.setItemFadeOut)
        visTitle.style.opacity = 0
    if (e.data.visFadeIn)
        canvasContainer.style.opacity = 1
    if (e.data.visFadeOut)
        canvasContainer.style.opacity = 0
    if ('toggleScriptText' in e.data)
        visVars.scriptTextRun = e.data.toggleScriptText
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
    resetActiveVis(activeVis)
    
    // general settings
    procSpeed =             30 // higher is slower
    currTrack =             -1
    visVars.bgOpacity =     255
    
    // loRes vis settings
    loLoRes =               4
    hiLoRes =               32
    baseLoRes =             15
    loResStep =             baseLoRes
    loResHalfStep =         Math.floor(baseLoRes / 2)
    dynLoRes =              false
    lineSpeed =             10 // higher is slower
    motionThresh =          50
    asciiCof =              12 // higher numbers = lower res ascii
    
    // hi res settings
    loThresh =              50
    hiThresh =              190
    baseThresh =            100
    dynThresh =             false
    
    // background flags
    
    pixelDensity(1)
    cnv = createCanvas(1920, 1080)
    asciiart_width = Math.floor(cnv.width / asciiCof)
    asciiart_height = Math.floor(cnv.height / asciiCof)
    // noLoop()
    cnv.parent('canvasContainer')
    vidIn = createCapture(VIDEO, ()=>{
        vidIn.hide()
        vidIn.size(cnv.width, cnv.height)
    })

    /* ****** CREATE VISUALISER OBJECTS ******* */
    
    // set up Ascii vis object
    asciiVis = new Ascii()
    context = this
    asciiVis.init(context, asciiart_width, asciiart_height)
    
    // set up Script vis object
    scriptVis = new ScriptTextFull()
    textFont(scriptFont)

    // set up gradReveal object
    gradRevealVis = new GradReveal()

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
    fr.innerText = parseInt(frameRate())
    const currSin = Math.sin(frameCount)
    background(0, 0, 0, visVars.bgOpacity)
    
    if (activeVis.showFullScript && visVars.scriptTextRun && frameCount % int(frameRate()/4) === 0)
        return scriptVis.draw(scriptText, 40)
    
    if (activeVis.showHalfScript) {
        vidThruHalf(vidIn)
        if (visVars.scriptTextRun && frameCount % int(frameRate()/4) === 0)
        return scriptVis.draw(scriptText, 40)
    }
    
    if (activeVis.showVidThru)
        return vidThru(vidIn)
    
    if (activeVis.showVidThruPoster)
        return vidThruPoster(vidIn)
    
    if (activeVis.showVidThruHalf)
        return vidThruHalf(vidIn)
    
    // resetActiveVis(activeVis)
    // if (currTrack < 0 || frameCount > 600)
    //     activeVis.showAscii = true
    vidIn.loadPixels()
    if (activeVis.showAscii)
        return asciiVis.draw(vidIn)
    
    if (activeVis.showPreRandomBoxes)
        randomBoxes()
    
    loadPixels()

    /* *****************
       LO RES VISUALISER
       ***************** */
    
    if (activeVis.showLoRes) {
        loResStep = baseLoRes
        if (dynLoRes) {
            loResStep = Math.floor(map(sin(frameCount/procSpeed), -1, 1, loLoRes, hiLoRes))
            loResHalfStep = Math.floor(loResStep / 2)
        }
        for (let vy = 0; vy < cnv.height; vy += loResStep) {
            for (let vx = 0; vx < cnv.width; vx += loResStep) {
                const pixIdx = ((vy * width) + vx) * 4
                let [iR, iG, iB] = getPixelValues(pixIdx, vidIn.pixels)
                if (activeVis.showCircles)
                    circles(vx, vy, iR, iG, iB, loResStep, activeVis.showVignette, vigMask)
                
                if (activeVis.showBoxes)
                    boxes(vx, vy, iR, iG, iB, loResStep, activeVis.showVignette, vigMask)
                
                if (activeVis.showLines)
                    lines(vx, vy, iR, iG, iB, loResStep, lineSpeed, activeVis.showVignette, vigMask)
                
                if (activeVis.showMotion)
                    motion(pixIdx, iR, iG, iB, loResHalfStep, motionThresh, prevFrame, pixels)

                if (activeVis.showVignette)
                    vignette(pixIdx, vigMask, pixels)
                }    
        }
        fr.innerText = parseInt(frameRate())
        if (activeVis.showMotion) {
            prevFrame = vidIn.pixels.slice(0);
            return updatePixels()
        }
        if (activeVis.showVignette)
            image(vigMaskImage, 0, 0)
        return 
    }

    let thresh = baseThresh
    if (dynThresh)
        thresh = map(sin(frameCount/procSpeed), -1, 1, loThresh, hiThresh)
    // info.innerText = thresh

    /* *****************
       HI RES VISUALISER
    /  ***************** */
    

    for (let vy = 0; vy < cnv.height; vy++) {
        for (let vx = 0; vx < cnv.width; vx++) {
            const pixIdx = ((vy * width) + vx) * 4
            let r, g, b
            
            let [iR, iG, iB] = getPixelValues(pixIdx, vidIn.pixels)

            if (activeVis.showThreshold)
                threshold(pixIdx, iR, iG, iB, thresh, pixels)
            
            // activeVis.showEdge = true
            if (activeVis.showEdge)
                edgeDetect(vx, vy, pixIdx, vidIn.pixels, 2, pixels)
            
            if (activeVis.showBitwise1)
                bitwise1(pixIdx, iR, iG, iB, thresh, pixels)
            if (activeVis.showBitwise2)
                bitwise2(pixIdx, iR, iG, iB, thresh, pixels)
            if (activeVis.showPixThru)
                pixThru(pixIdx, iR, iG, iB, pixels)
            
            if (activeVis.showSpec)
                specLoading(pixIdx, iR, iG, iB, thresh, maxIdx, pixels)
            
            if (activeVis.showVignette)
                vignette(pixIdx, vigMask, pixels)

            if (activeVis.showGradReveal)
                gradRevealVis.draw(pixIdx, iR, iG, iB, pixels)
            // if (pixels[pixIdx + 3] > 30) {
            //     pixels[pixIdx + 0] = iR
            //     pixels[pixIdx + 1] = iG
            //     pixels[pixIdx + 2] = iB
            //     pixels[pixIdx + 3] = pixels[pixIdx + 3] << 1
            // }
        }
    }
    updatePixels()
    // background(0, 0, 0, 5)
    // activeVis.showPostRandomBoxes = true
    // info.innerText = visVars.bgOpacity

    if (activeVis.showPostRandomBoxes)
        randomBoxes()
}

window.keyPressed = function() {
    if (key === 'f')
        fullscreen(1)
    window.open('', 'visControl')
}

const displayTrackTitle = function(id) {
    visTitle.innerHTML = ''
    const setName = document.createTextNode(setlist[id])
    visTitle.appendChild(setName)
}