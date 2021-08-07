// LOAD PARAMETERS
import { setlist } from './modules/parameters/setlist.js'

// BUILD CONTROLS
import { threshBase, threshBaseVal, threshDynVal, threshDyn, threshDynMin, threshDynMinVal, threshDinMax, threshDinMaxVal } from './modules/controls/threshControls.js'

// LOAD UTILITIES
import keyEvent from './modules/util/controlKeyEvents.js'

let currSetId = -1
let currSetState = 0
let currVisState = 0

window.name = 'visControl'

window.onload = function () {
    window.open('/vis.html', 'visualiser')
}

const setlistContainer = document.getElementById('setListContainer')



for (let setlistNo in setlist) {
    const newEl = document.createElement('div')
    newEl.id = setlistNo
    newEl.classList.add('setlistItem')
    newEl.addEventListener('click', (e)=>launchSetlistItem(e))
    const newContent = document.createTextNode(setlist[setlistNo])
    newEl.appendChild(newContent)
    setlistContainer.appendChild(newEl)
}

const launchSetlistItem = function(e) {
    let currTrackEl = document.querySelector('.currTrack')
    if (currTrackEl) currTrackEl.classList.remove('currTrack')
    channel.postMessage({ setItem: e.target.id })
    currSetId = e.target.id
    currSetState = 0
    currVisState = 0
    currTrackEl = document.getElementById(e.target.id)
    currTrackEl.classList.add('currTrack')
}

const channel = new BroadcastChannel('vis-comms')

document.addEventListener('keydown', (e)=>{
    [currSetState, currVisState] = keyEvent(e, currVisState, currSetState, currSetId)
}, true)

