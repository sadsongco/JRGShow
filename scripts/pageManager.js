// LOAD PARAMETERS
import { setlist } from './modules/parameters/setlist.js'

// BUILD CONTROLS
import { threshBase, threshBaseVal, threshDynVal, threshDyn, threshDynMin, threshDynMinVal, threshDinMax, threshDinMaxVal } from './modules/controls/threshControls.js'

// LOAD UTILITIES
import keyEvent from './modules/util/controlKeyEvents.js'

let currSetId = -1
let currSetState = 0
let currVisState = 0
let scriptTextRun = false

window.name = 'visControl'

window.onload = function () {
    window.open('/vis.html', 'visualiser')
}

const setlistContainer = document.getElementById('setListContainer')
const scriptTextRunEl = document.getElementById('scriptTextRunning')
scriptTextRunEl.innerText = "Script Text Stopped"

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

document.addEventListener('keydown', (e)=>{
    [currSetState, currVisState, scriptTextRun] = keyEvent(e, currVisState, currSetState, currSetId, scriptTextRun)
    if (scriptTextRun)
        scriptTextRunEl.innerText = "Script Text Running"
    else
        scriptTextRunEl.innerText = "Script Text Stopped"
}, true)

