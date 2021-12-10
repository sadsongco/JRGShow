// LOAD PARAMETERS
import {    BGCOL,
            activeVis } from './modules/parameters/visParams.js'
import { setlist }      from './modules/parameters/setlist.js'

// LOAD UTILITIES
import vignetteMask     from './modules/util/vignetteMask.js'
import getPixelValues   from './modules/util/getPixelValues.js'
import resetActiveVis   from './modules/util/resetActiveVis.js'
import prepareVis       from './modules/util/prepareVis.js'
import { htmlToElement }    from './modules/util/utils.js'
// import resetPixels      from './modules/util/resetPixels.js'


// LOAD VISUALISERS

// initial test card
import TestCard         from './modules/visualisers/testCard.js'

// straight video
import vidThru          from './modules/visualisers/straightVideo/vidThru.js'
import vidThruPoster    from './modules/visualisers/straightVideo/vidThruPoster.js'
import vidThruHalf      from './modules/visualisers/straightVideo/vidThruHalf.js'
import pixThru          from './modules/visualisers/straightVideo/pixThru.js'

// text
import Ascii            from './modules/visualisers/text/ascii.js'
import ScriptTextFull   from './modules/visualisers/text/scriptText.js'
import Score            from './modules/visualisers/text/score.js'
import DetunedQuintet   from './modules/visualisers/text/detunedQuintet.js'

// lo res
import circles          from './modules/visualisers/loRes/circles.js'
import boxes            from './modules/visualisers/loRes/boxes.js'
import lines            from './modules/visualisers/loRes/lines.js'

// bitwise
import bitwise1         from './modules/visualisers/bitwise/bitwise1.js'
import bitwise2         from './modules/visualisers/bitwise/bitwise2.js'
import bitwiseBrighten  from './modules/visualisers/bitwise/bitwiseBrighten.js'
import specLoading      from './modules/visualisers/bitwise/specLoading.js'

// hi res
import edgeDetect       from './modules/visualisers/hiRes/edgeDetect.js'
import motion           from './modules/visualisers/hiRes/motion.js'
import threshold        from './modules/visualisers/hiRes/threshold.js'
import GradReveal       from './modules/visualisers/hiRes/gradReveal.js'

// common
import randomBoxes      from './modules/visualisers/common/randomBoxes.js'
import vignette         from './modules/visualisers/common/vignette.js'

// GLOBAL VARIABLES
const visVars = {
    bgOpacity: 0,
    run: false,
    testCard: true,
    resetPixels: false,
    brighten: 1,
    bw: false,
}
let cnv, maxIdx
let vidIn
let prevFrame
let asciiVis, context
let vigMask, vigMaskImage
let asciiart_width, asciiart_height, asciiCof
let scriptFont
let scriptVis, gradRevealVis
let scoreVis
let detunedVis
let currTrack
let vignetteImage

// VISUALISER ADJUSTABLE VARIABLES
let procSpeed
let loResStep, loResHalfStep
let loLoRes, hiLoRes, baseLoRes, dynLoRes
let motionThresh
let loThresh, hiThresh, baseThresh, dynThresh
let lineSpeed
let scriptText, testCard
let scoreTrig = false
let yellowTrig = false
let randy = []

// TARGET HTML ELEMENTS
// const fr = document.getElementById('fr')
// const info = document.getElementById('info')
// const setStatus = document.getElementById('setStatus')
const visTitle = document.getElementById('visTitle')
const visSource = document.getElementById('visSource')
const visFeat = document.getElementById('visFeat')
const busyEl = document.getElementById('busy')
const canvasContainer = document.getElementById('canvasContainer')

// get data from persistent storage
let openRequest = indexedDB.open('visSettings', 1);
openRequest.onupgradeneeded = () => {
    console.log('onupgradeneeded');
    console.log(openRequest);
    // let db = openRequest.result;
    // if (!db.objectStoreNames.contains('setlist'))
    //     db.createObjectStore('setlist', {keyPath: 'id'});
}
openRequest.onerror = () => {
    console.log('onerror');
    console.log(openRequest);
}
openRequest.onsuccess = () => {
    let db = openRequest.result;
    let transaction = db.transaction('visChains', 'readwrite');
    let setlistDB = transaction.objectStore('visChains');
    let setlist = setlistDB.getAll()
    setlist.onsuccess = () => {
        console.log('Setlist: ', setlist.result);
    }
    console.log('success');
    console.log(db);
}



// CONTROLLER / VISUALISER COMMUNICATION
const channel = new BroadcastChannel('vis-comms')
channel.addEventListener('message', (e) => {
    // console.log(e.data)
    if (e.data.changeTrack) {
        // if this is our first track change from the test card,
        // make sure we're looping 
        if (!isLooping())
            loop()
        channel.postMessage({
            visTransition: true
        })
        if (currTrack !== e.data.setItem)
            currTrack = e.data.setItem
        if (visTitle.style.opacity != 0
            || visSource.style.opacity != 0
            || visFeat.style.opacity != 0
            ) {
            visTitle.style.opacity = 0
            visSource.style.opacity = 0
            visFeat.style.opacity = 0
            busyEl.style.opacity = 0
            visTitle.ontransitionend = () => {
                displayTrackTitle(currTrack)
                displayTrackSource(currTrack)
                displayTrackFeat(currTrack)
            }
            visSource.ontransitionend = () => {
                displayTrackTitle(currTrack)
                displayTrackSource(currTrack)
                displayTrackFeat(currTrack)
            }
            visFeat.ontransitionend = () => {
                displayTrackTitle(currTrack)
                displayTrackSource(currTrack)
                displayTrackFeat(currTrack)
            }
        } else {

            displayTrackTitle(currTrack)
            displayTrackSource(currTrack)
            displayTrackFeat(currTrack)
        }
        if (canvasContainer.style.opacity != 0) {
            canvasContainer.style.opacity = 0
            canvasContainer.ontransitionend = () => {
                if (canvasContainer.style.opacity != 0 || e.data.setItem === -1) return
                updateVis(e)
            }
        } else {
            updateVis(e)
        }
        return
    }
    if (e.data.setItemFadeIn)
        visTitle.style.opacity = 1
    if (e.data.setItemFadeOut)
        visTitle.style.opacity = 0
    if (e.data.setSourceFadeIn && visSource.innerHTML != '') 
        visSource.style.opacity = 1
    if (e.data.setSourceFadeOut)
        visSource.style.opacity = 0
    if (e.data.setFeatFadeIn && visFeat.innerHTML != '')
        visFeat.style.opacity = 1
    if (e.data.setFeatFadeOut)
        visFeat.style.opacity = 0
    if (e.data.visFadeIn)
        canvasContainer.style.opacity = 1
    if (e.data.visFadeOut)
        canvasContainer.style.opacity = 0
    if ('toggleScriptText' in e.data)
        visVars.run = e.data.toggleScriptText
    if (e.data.threshBase)
        baseThresh = e.data.threshBase
    if ('threshDyn' in e.data)
        dynThresh = e.data.threshDyn
    if ('scoreTrig' in e.data)
        scoreTrig = e.data.scoreTrig
    if (e.data.yellowTrig)
        yellowTrig = e.data.yellowTrig
    if (e.data.busyFade) {
        if (busyEl.style.opacity == 1)
            busyEl.style.opacity = 0
        else
            busyEl.style.opacity = 1
    }
    // if (e.data.threshDynMin) {
    //     loThresh = e.data.threshDynMin
    //     loResStep = Math.floor(map(sin(frameCount/procSpeed), -1, 1, loLoRes, hiLoRes))
    //     loResHalfStep = Math.floor(loResStep / 2)
    // }
    // if (e.data.threshDynMax) {
    //     hiThresh = e.data.threshDynMax
    //     loResStep = Math.floor(map(sin(frameCount/procSpeed), -1, 1, loLoRes, hiLoRes))
    //     loResHalfStep = Math.floor(loResStep / 2)
    // }
    window.open('', 'visControl')
})

// helper function for capturing from specific video source
// https://editor.p5js.org/codingtrain/sketches/JjRoa1lWO
const devices = [];

function gotDevices(deviceInfos) {
  for (let i = 0; i !== deviceInfos.length; ++i) {
    const deviceInfo = deviceInfos[i];
    if (deviceInfo.kind == 'videoinput') {
      devices.push({
        label: deviceInfo.label,
        id: deviceInfo.deviceId
      });
    }
  }
  console.log(devices);
  let supportedConstraints = navigator.mediaDevices.getSupportedConstraints();
  console.log(supportedConstraints);
  var constraints = {
    video: {
      deviceId: {
        exact: devices[0].id
      },
    }
  };
  vidIn = createCapture(constraints, ()=>{
    vidIn.hide()
    vidIn.size(cnv.width, cnv.height)
  })
}

// p5.js preload
window.preload = function() {
    testCard = new TestCard()
    testCard.init()
    scriptText = loadStrings('./assets/scriptText/TWBB.txt', ()=>{console.log('text loaded')}, ()=>{console.log('error loading text')});
    scriptFont = loadFont('./assets/fonts/CourierPrime-Regular.ttf')
    scoreVis = new Score()
    scoreVis.init()
    detunedVis = new DetunedQuintet
    detunedVis.init()
    // image for vignette
    vignetteImage = loadImage('./assets/images/common/vignette.png')
}


// p5.js setup
window.setup = function() {
    resetActiveVis(activeVis)
    
    // general settings
    procSpeed =             30 // higher is slower
    currTrack =             {}
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

    // computationally cheap 50/50 random generator
    for (let i = 0; i < 1000; i ++) {
        if (random(0, 1) > 0.5)
            randy.push(true)
        else
            randy.push(false)
    }

    // background flags
    
    pixelDensity(1)
    cnv = createCanvas(1080, 720)
    asciiart_width = Math.floor(cnv.width / asciiCof)
    asciiart_height = Math.floor(cnv.height / asciiCof)
    // noLoop()
    cnv.parent('canvasContainer')

    // set up camera to capture from other source
    navigator.mediaDevices.enumerateDevices()
    .then(gotDevices)
    // vidIn = createCapture(VIDEO, ()=>{
    //     vidIn.hide()
    //     vidIn.size(cnv.width, cnv.height)
    // })
    // console.log(setlist)

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
    gradRevealVis.init()

    frameRate(24)
    maxIdx = cnv.width * cnv.height * 4

    // set up vignette
    vigMask = vignetteMask(cnv.width, cnv.height)
    vigMaskImage = createImage(cnv.width, cnv.height)
    vigMaskImage.loadPixels()
    vigMaskImage.pixels = vigMask
    vigMaskImage.updatePixels()

    // start on noloop
    if (visVars.testCard)
        noLoop()
}


// p5.js draw loop
window.draw = function() {
    if (visVars.resetPixels) {
        loadPixels()
        for (const i in pixels)
            pixels[i] = 0
        updatePixels()
        visVars.resetPixels = false
    }
    // fr.innerText = parseInt(frameRate())
    // info.innerText = visVars.bgOpacity
    background(0, 0, 0, visVars.bgOpacity)
    const currRandy = randy.pop()

    if (visVars.testCard) {
        return testCard.draw()
    }
    if (activeVis.showFullScript && visVars.run && frameCount % int(frameRate()/4) === 0)
        return scriptVis.draw(scriptText, 40)
    
    if (activeVis.showHalfScript) {
        vidThruHalf(vidIn)
        if (visVars.run && frameCount % int(frameRate()/4) === 0)
        return scriptVis.draw(scriptText, 40)
    }
    if (activeVis.showVidThru)
        return vidThru(vidIn, visVars.bw, visVars.vignette, vignetteImage)
    
    if (activeVis.showVidThruPoster)
        return vidThruPoster(vidIn)
    
    if (activeVis.showVidThruHalf)
        return vidThruHalf(vidIn)
    
    // activeVis.showScore = true
    if (activeVis.showScore) {
        scoreVis.draw(scoreTrig)
        return scoreTrig = false
    }

    if (activeVis.showDetuned) {
        detunedVis.drawBG(yellowTrig)
    }

    vidIn.loadPixels()

    if (activeVis.showAscii)
        return asciiVis.draw(vidIn, visVars.bw)
    
    if (activeVis.showPreRandomBoxes)
        randomBoxes(visVars.run, currRandy)
    
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
        // fr.innerText = parseInt(frameRate())
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
                pixThru(pixIdx, iR, iG, iB, visVars.bw, pixels)
            
            if (activeVis.showSpec)
                specLoading(pixIdx, iR, iG, iB, thresh, maxIdx, pixels)

            if (activeVis.showBitwiseBrighten)
                bitwiseBrighten(pixIdx, iR, iG, iB, visVars.brighten, visVars.bw, pixels)
            
            if (activeVis.showGradReveal)
                gradRevealVis.draw(pixIdx, iR, iG, iB, pixels)

            if (activeVis.showDetuned)
                detunedVis.draw(pixIdx, iR, iG, iB, pixels)
            
            if (activeVis.showVignette)
                vignette(pixIdx, vigMask, pixels)
            
        }
    }
    updatePixels()
    yellowTrig = false

    if (activeVis.showPostRandomBoxes)
        randomBoxes(visVars.run, currRandy)

    randy.unshift(currRandy)
}

window.keyPressed = function(e) {
    e.preventDefault()
    if (key === 'f')
        fullscreen(1)
    else if (key === 'escape')
        fullscreen(0)
    // return window.open('', 'visControl')
}

const displayTrackTitle = function(id) {
    visTitle.innerHTML = ''
    const title = setlist[id].title.replace(/(?:\r\n|\r|\n)/g, '<br>');
    const setName = htmlToElement(title)
    visTitle.appendChild(setName)
}

const displayTrackSource = function(id) {
    visSource.innerHTML = ''
    const source = setlist[id].source.replace(/(?:\r\n|\r|\n)/g, '<br>');
    const setName = htmlToElement(source)
    visSource.appendChild(setName)
}

const displayTrackFeat = function(id) {
    visFeat.innerHTML = ''
    const feat = setlist[id].feat.replace(/(?:\r\n|\r|\n)/g, '<br>');
    const setName = htmlToElement(feat)
    visFeat.appendChild(setName)
}

const updateVis = function(e) {
    channel.postMessage({
        visTransition: false
    })
    if (visVars.testCard)
        visVars.testCard = false
    resetActiveVis(activeVis)
    prepareVis(setlist[currTrack], activeVis, scriptVis, scriptText, visVars, asciiVis)
    // clear pixel array
    visVars.resetPixels = true
    e.data.setItem = -1
}