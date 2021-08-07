import { setlist } from './modules/setlist.js'
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
    channel.postMessage({ setItem: e.target.id })
    currSetId = e.target.id
    currSetState = 0
}

const channel = new BroadcastChannel('vis-comms')

const keyEvent = function(e) {
    if (e.key == 'f') channel.postMessage('fullscreen')
    if (e.key == 'Enter') {
        switch(currSetState) {
            case 0:
                channel.postMessage({ setItemFadeIn: currSetId })
                currSetState ++
                break
            case 1:
                channel.postMessage({ setItemFadeOut: currSetId })
                currSetState = 0
                break
        }
    }
    if (e.key == 'ArrowRight') {
        switch(currVisState) {
            case 0:
                channel.postMessage({ visFadeIn: currSetId })
                currVisState ++
                break
            case 1:
                channel.postMessage({ visFadeOut: currSetId })
                currVisState = 0
                break
        }
    }
}

document.addEventListener('keydown', keyEvent)

