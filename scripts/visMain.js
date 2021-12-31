// import registered visualisers
import { visualiserDraw } from "./modules/common/visualiserDraw.js";
import { importModules } from "./modules/common/importModules.js";
import { setupVisualisers } from "./modules/common/setupVisualisers.js";

// import utilities
import { htmlToElement } from "./modules/util/utils.js";

// import default settings
import { outputParamVals } from "./modules/parameters/outputParameters.js"

// CONTROLLER VARIABLES
let currTrack = {
    name: null,
    source: null,
    feature: null,
    outputSettings: {
        bg_opacity: 255,
        bg_r: 0,
        bg_g: 0,
        bg_b: 0
    },
    visChain: []
}

// TARGET HTML ELEMENTS
// const fr = document.getElementById('fr')
// const info = document.getElementById('info')
// const setStatus = document.getElementById('setStatus')
const visTitle = document.getElementById('visTitle')
const visSource = document.getElementById('visSource')
const visFeat = document.getElementById('visFeat')
const canvasContainer = document.getElementById('canvasContainer')

// CONTROLLER / VISUALISER COMMUNICATION
const channel = new BroadcastChannel('vis-comms')
channel.addEventListener('message', (e) => {
    console.log(e.data)
    if (e.data.changeTrack) {
        // if this is our first track change from the test card,
        // make sure we're looping 
        if (!isLooping())
            loop()
        channel.postMessage({
            visTransition: true
        })
        if (currTrack.name !== e.data.track.name) {
            currTrack = e.data.track;
        }
        if (visTitle.style.opacity != 0
            || visSource.style.opacity != 0
            || visFeat.style.opacity != 0
            ) {
            visTitle.style.opacity = 0
            visSource.style.opacity = 0
            visFeat.style.opacity = 0
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
                updateVis(currTrack)
            }
        } else {
            updateVis(currTrack)
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
    if (e.data.visFadeIn) {
        const transTime = currTrack.outputSettings.hasOwnProperty('transitionInTime') ? currTrack.outputSettings.transitionInTime : 5;
        canvasContainer.style.transition = `opacity ${transTime}s ease-in-out`;
        canvasContainer.style.opacity = 1
    }
    if (e.data.visFadeOut) {
        const transTime = currTrack.outputSettings.hasOwnProperty('transitionOutTime') ? currTrack.outputSettings.transitionOutTime : 5;
        canvasContainer.style.transition = `opacity ${transTime}s ease-in-out`;        
        canvasContainer.style.opacity = 0
    }

})

const displayTrackTitle = function(currTrack) {
    visTitle.innerHTML = ''
    const name = currTrack.name ? currTrack.name.replace(/(?:\r\n|\r|\n)/g, '<br>') : "";
    const setName = htmlToElement(name)
    visTitle.appendChild(setName)
}

const displayTrackSource = function(currTrack) {
    visSource.innerHTML = ''
    const source = currTrack.source ? currTrack.source.replace(/(?:\r\n|\r|\n)/g, '<br>') : "";
    const setName = htmlToElement(source)
    visSource.appendChild(setName)
}

const displayTrackFeat = function(currTrack) {
    visFeat.innerHTML = ''
    const feat = currTrack.feature ? currTrack.feature.replace(/(?:\r\n|\r|\n)/g, '<br>') : "";
    const setName = htmlToElement(feat)
    visFeat.appendChild(setName)
}

const updateVis = function(currTrack) {
    channel.postMessage({
        visTransition: false
    })
    moduleChain = currTrack.visChain;
    outputSettings = currTrack.outputSettings;
}

// VISUALISER variables
let visualiserModules = {};
let moduleChain = []
let cnv, vidIn, audioIn;
let outputSettings;
let fft;

/**
 * P5.JS preload function
 * Called asnchronously once at beginning of execution
 */
window.preload = function() {
    importModules()
    .then((res) => {
        visualiserModules = res;
    })
}

/**
 * P5.JS setup function
 * Called once after preload is done
 */
window.setup = async function() {
    const audioCtx = getAudioContext();
    // get data from persistent storage
    [cnv, vidIn, audioIn] = await setupVisualisers(1, 'canvasContainer', audioCtx)
    fft = new p5.FFT();
    fft.setInput(audioIn);
    outputSettings = outputParamVals;
}

/**
 * P5.JS draw function
 * Called every frame
 */
window.draw = function() {
    if (!fft || !outputSettings) return;
    visualiserDraw(moduleChain, visualiserModules, vidIn, audioIn, fft, cnv, outputSettings);
}