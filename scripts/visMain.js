// import registered visualisers
import { visualiserDraw } from "./modules/common/visualiserDraw.js";
import { importModules } from "./modules/common/importModules.js";
import { setupVisualisers } from "./modules/common/setupVisualisers.js";

// import default settings
import { outputParamVals } from "./modules/parameters/outputParameters.js"

// CONTROLLER VARIABLES
let currTrack

// CONTROLLER / VISUALISER COMMUNICATION
const channel = new BroadcastChannel('vis-comms')
channel.addEventListener('message', (e) => {
    if (e.data.changeTrack) {
        if (currTrack !== e.data.track.title)
            currTrack = e.data.track.title;
            moduleChain = e.data.track.visChain;
            outputSettings = e.data.track.outputSettings;
    }
})

// VISUALISER variables
let visualiserModules = {};
let moduleChain = []
let cnv, vidIn;
let outputSettings;

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
        outputSettings = outputParamVals;
    })
}

/**
 * P5.JS draw function
 * Called every frame
 */
window.draw = function() {
    visualiserDraw(moduleChain, visualiserModules, vidIn, cnv, outputSettings);
}