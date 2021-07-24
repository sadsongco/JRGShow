import { setlist } from './modules/setlist.js'

window.name = 'visControl'

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
    window.open('/vis.html?setno='+e.target.id, 'visualiser')
}

const channel = new BroadcastChannel('vis-comms')

const keyEvent = function(e) {
    if (e.key == 'f') channel.postMessage('fullscreen')
    // channel.postMessage(e.code)
    // window.open('', 'visualiser')
}

document.addEventListener('keydown', keyEvent)

