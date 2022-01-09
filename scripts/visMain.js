// import utilities
import { htmlToElement } from "./modules/util/utils.js";

// import default settings
import { VisOutputEngine } from "./modules/common/visOutputEngine.js"

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
const visTitle = document.getElementById('visTitle')
const visSource = document.getElementById('visSource')
const visFeat = document.getElementById('visFeat')
const canvasContainer = document.getElementById('canvasContainer')

// CONTROLLER / VISUALISER COMMUNICATION
const channel = new BroadcastChannel('vis-comms')
channel.addEventListener('message', (e) => {
    if (e.data.changeTrack) {
        // if this is our first track change from the test card,
        // make sure we're looping 
        // if (!isLooping())
        // loop()
        channel.postMessage({
            visTransition: true
        })
        if (currTrack.name !== e.data.track.name) {
            currTrack = e.data.track;
        }
        // fade out title, source and featuring if visible before changing values
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
            // change title, source and featuring values
            displayTrackTitle(currTrack)
            displayTrackSource(currTrack)
            displayTrackFeat(currTrack)
        }
        // fade out canvas if visible before changing visualiser chain
        if (canvasContainer.style.opacity != 0) {
            canvasContainer.style.opacity = 0
            canvasContainer.ontransitionend = () => {
                if (canvasContainer.style.opacity != 0 || e.data.setItem === -1) return
                updateVis(currTrack)
            }
        } else {
            // change visualiser chain
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
    visOutputEngine.setCurrentVisChain(currTrack.visChain);
    visOutputEngine.setOutputSettings(currTrack.outputSettings);
}

/**
 * Fullscreen control event listener callback
 * @param {Event} e 
 */
window.onkeydown = function(e) {
    e.preventDefault()
    if (e.key === 'f')
        visOutputEngine.launchFullscreen(document);
    else if (e.key === 'escape')
        visOutputEngine.exitFullscreen();
}
let visOutputEngine, visualiserModules;

window.onload = async() => {
    visOutputEngine = new VisOutputEngine()
    visualiserModules = await visOutputEngine.loadVisModules();
    await visOutputEngine.setupCanvas()
    visOutputEngine.drawCanvas();
}