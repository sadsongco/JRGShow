import { getSetlist, sortSetlistByOrder } from './modules/common/getSetlist.js';

// LOAD UTILITIES
import keyEvent from './modules/util/runshowKeyEvents.js'
import processVisMessage from './modules/util/processVisMessage.js'

let setlist = {};
let currSetId = -1
let currSetState = 0
let currVisState = 0
let currSourceState = 0
let currFeatState = 0
let run = false
let visWindow


window.onload = function () {
    // get output resolution from db and open a visualiser window
    let openRequest = indexedDB.open('visDB', 1);
    openRequest.onupgradeneeded = () => {
        console.log('onupgradeneeded');
        console.log(openRequest);
    }
    openRequest.onerror = () => {
        console.log('onerror');
        console.log(openRequest.error);
    }
    openRequest.onsuccess = () => {
        const db = openRequest.result;
        // get output resolution
        const outputResTransaction = db.transaction('outputResolution', 'readwrite');
        const outputResos = outputResTransaction.objectStore('outputResolution');
        const outputResQuery = outputResos.get(1)
        outputResQuery.onsuccess = () => {
            const outputRes = outputResQuery.result.outputResolution;
            // window.open('./vis.html', '_blank', `width=${outputRes.w}, height=${outputRes.h}`);
            visWindow = window.open('./vis.html', 'vis', `width=${outputRes.w}, height=${outputRes.h}`);
        }
        outputResQuery.onerror = () => {
            console.log(`Database error: ${outputResQuery.error}`);
        }
    }
    // get setlist and display
    getSetlist()
    .then((res) => {
        const setlistContainer = document.getElementById('setListContainer')
        for (let item of sortSetlistByOrder(res)) {
            setlist[item.name] = item;
            const newEl = document.createElement('div')
            newEl.id = item.name;
            newEl.classList.add('setlistItem');
            newEl.addEventListener('click', (e)=>launchSetlistItem(e))
            const newContent = document.createTextNode((parseInt(item.position) + 1) + ' - ' + item.name)
            newEl.appendChild(newContent)
            setlistContainer.appendChild(newEl)
        }
    })
}

const launchSetlistItem = function(e) {
    if (e.target.id === currSetId)
        return
    let currTrackEl = document.querySelector('.currTrack')
    if (currTrackEl) currTrackEl.classList.remove('currTrack')
    channel.postMessage({
        changeTrack: true,
        track: setlist[e.target.id],
    })
    currSetId = e.target.id
    currSetState = 0
    currVisState = 0
    currTrackEl = document.getElementById(e.target.id)
    currTrackEl.classList.add('currTrack')
}

// Add animated show running message
const runEl = document.getElementById('visRunning')
runEl.innerText = "Visualiser Stopped"

// add close show button
const closeShowCheck = (e) => {
    const box = document.getElementById('closeShowCheck');
    const closeShowButton = document.createElement('a');
    closeShowButton.classList.add('button');
    closeShowButton.innerText = 'Close Show';
    closeShowButton.addEventListener('click', closeShow)
    document.getElementById('closeShowCheckButton').appendChild(closeShowButton);
    box.style.height = '100%';
    box.style.opacity = 1;
    box.style.borderWidth = '4px';
    box.style.padding = '0.8vw';
    document.getElementById('closeShowCheckText').innerText = "DO YOU REALLY WANT TO CLOSE THE VISUALISER WINDOW AND STOP THE SHOW?";
}

const closeShow = (e) => {
    visWindow.close();
    window.location.href = "hub.html";
}

const closeShowButton = document.createElement('a');
closeShowButton.classList.add('button');
closeShowButton.innerText = 'Close Show';
closeShowButton.addEventListener('click', closeShowCheck)
document.getElementById('closeShow').appendChild(closeShowButton);

// Event listeners for show control
const channel = new BroadcastChannel('vis-comms')
channel.addEventListener('message', (e)=> processVisMessage(e))

document.addEventListener('keydown', (e)=>{
    [currSetState, currSourceState, currFeatState, currVisState, run] = keyEvent(e, currVisState, currSetState, currSourceState, currFeatState, currSetId, run)
    if (run)
        runEl.innerText = "Visualiser Running [arrow left]"
    else
        runEl.innerText = "Visualiser Stopped [arrow left]"
}, true)
