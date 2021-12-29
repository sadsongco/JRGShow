// import registered visualisers
import { visualiserDraw } from "./modules/common/visualiserDraw.js";
import { importModules } from "./modules/common/importModules.js";
import { setupVisualisers } from "./modules/common/setupVisualisers.js";

// CONTROLLER VARIABLES
let currTrack

// CONTROLLER / VISUALISER COMMUNICATION
const channel = new BroadcastChannel('vis-comms')
channel.addEventListener('message', (e) => {
    console.log(e.data)
    if (e.data.changeTrack) {
        if (currTrack !== e.data.track.title)
            currTrack = e.data.track.title;
            moduleChain = e.data.track.visChain;
    }
})

// VISUALISER variables
let visualiserModules = {};
let moduleChain = []
let cnv, vidIn;

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
window.setup = function() {
    // get data from persistent storage
    setupVisualisers(1, 'vis')
    .then((res)=>{
        [cnv, vidIn] = res;
    })
}

/**
 * P5.JS draw function
 * Called every frame
 */
window.draw = function() {
    visualiserDraw(moduleChain, visualiserModules, vidIn, cnv);
}