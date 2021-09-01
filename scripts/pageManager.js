// LOAD PARAMETERS
import { setlist } from './modules/parameters/setlist.js'

// BUILD CONTROLS
import { threshBase, threshBaseVal, threshDynVal, threshDyn } from './modules/controls/threshControls.js'

// LOAD UTILITIES
import keyEvent from './modules/util/controlKeyEvents.js'
import processVisMessage from './modules/util/processVisMessage.js'

let currSetId = -1
let currSetState = 0
let currVisState = 0
let currSourceState = 0
let currFeatState = 0
let run = false

window.name = 'visControl'

window.onload = function () {
    window.open('/vis.html', 'visualiser')
}

const setlistContainer = document.getElementById('setListContainer')
const runEl = document.getElementById('visRunning')
runEl.innerText = "Visualiser Stopped"

for (let id in setlist) {
    const setlistItem = setlist[id]
    const newEl = document.createElement('div')
    newEl.id = setlist[id].id
    newEl.classList.add('setlistItem')
    newEl.addEventListener('click', (e)=>launchSetlistItem(e))
    const newContent = document.createTextNode((parseInt(setlistItem.id) + 1) + ' - ' + setlistItem.title)
    newEl.appendChild(newContent)
    setlistContainer.appendChild(newEl)
}

const launchSetlistItem = function(e) {
    if (e.target.id === currSetId)
        return
    let currTrackEl = document.querySelector('.currTrack')
    if (currTrackEl) currTrackEl.classList.remove('currTrack')
    channel.postMessage({
        changeTrack: true,
        setItem: e.target.id,
    })
    currSetId = e.target.id
    currSetState = 0
    currVisState = 0
    currTrackEl = document.getElementById(e.target.id)
    currTrackEl.classList.add('currTrack')
}

const channel = new BroadcastChannel('vis-comms')
channel.addEventListener('message', (e)=> processVisMessage(e))

document.addEventListener('keydown', (e)=>{
    [currSetState, currSourceState, currFeatState, currVisState, run] = keyEvent(e, currVisState, currSetState, currSourceState, currFeatState, currSetId, run)
    if (run)
        runEl.innerText = "Visualiser Running [arrow left]"
    else
        runEl.innerText = "Visualiser Stopped [arrow left]"
}, true)

