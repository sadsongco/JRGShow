// import registered visualisers
import { visList } from "./modules/visualisers/registeredVis.js";
import { visualiserDraw } from "./modules/common/visualiserDraw.js";
import { importModules } from "./modules/common/importModules.js";
import { setupVisualisers } from "./modules/common/setupVisualisers.js";

export let visualiserModules = {}, visualiserParamVals = {};

/**
 * Adds a visualiser to a screen slot
 * @param {Event} e - HTML event
 */
const addModule = (e) => {
    selectedSlot.innerText = moduleSelector.value;
    selectedSlot.filled = true;
    selectedSlot.classList.add('slot-filled');
    setOutputPath();
    updateModuleChain();
    showParams(moduleSelector.value);
}

/**
 * Updates the chain of modules to match screen slots
 */
const updateModuleChain = () => {
    moduleChain = [];
    visualiserParamVals = {};
    for (let modSlot of modSlots) {
        if (modSlot.filled) {
            moduleChain.push(visModules[modSlot.innerText])
            const moduleParams = {};
            for (let param of visualiserModules[modSlot.innerText].params) {
                moduleParams[param.name] = param.value;
            }
            visualiserParamVals[modSlot.innerText] = moduleParams;
        }
    }
}

/**
 * Update appearance of slot when selected
 * @param {HTMLElement} slot - slot that has been clicked on
 */
const selectSlot = (slot) => {
    deselectAll();
    selectedSlot = slot;
    slot.selected = true;
    slot.classList.add('slot-selected')
    if (slot.classList.contains('slot-filled'))
        showParams(slot.innerText);
    else
        clearParams();
}

/**
 * Display parameters for visualiser in selected module
 * @param {string} modName - module to show params of
 */
const showParams = (modName) => {
    const paramsEl = document.getElementById('params');
    // empty parameters element
    while (paramsEl.firstChild)
        paramsEl.removeChild(paramsEl.firstChild);
    const paramTitle = document.getElementById('parameters-title');
    paramTitle.innerText = `Parameters for ${modName}`;
    for (let param of visualiserModules[modName].params) {
        const paramContainer = document.createElement('div');
        paramContainer.appendChild(document.createTextNode(param.name));
        const paramEntry = document.createElement('input');
        paramEntry.name = `${modName}-${param.name}`;
        paramEntry.addEventListener('change', updateParameter);
        switch (param.type) {
            case 'val':
                paramEntry.type = 'range';
                paramEntry.min = param.range ? param.range[0] : 0;
                paramEntry.max = param.range ? param.range[1]: 255;
                paramEntry.value = param.value || 100;
                break;
            case 'toggle':
                paramEntry.type = 'checkbox';
                break;
        };
        paramContainer.appendChild(paramEntry);
        paramsEl.appendChild(paramContainer);
    }
}

const updateParameter = (e) => {
    const names = e.target.name.split("-");
    const moduleName = names[0], paramName = names[1];
    if (e.target.type === 'checkbox')
        visualiserParamVals[moduleName][paramName] = e.target.checked;
    else
        visualiserParamVals[moduleName][paramName] = parseInt(e.target.value);
}

/**
 * Clear parameter display
 */
const clearParams = () => {
    const paramsEl = document.getElementById('params');
    // empty parameters element
    while (paramsEl.firstChild)
        paramsEl.removeChild(paramsEl.firstChild);
    const paramTitle = document.getElementById('parameters-title');
    paramTitle.innerText = "";
}

/**
 * Clears slot
 */
const clearSlot = () => {
    selectedSlot.innerText = "";
    selectedSlot.filled = false;
    selectedSlot.classList.remove('slot-filled');
    clearParams();
    setOutputPath();
    updateModuleChain();
}

/**
 * Deselects all slots
 */
const deselectAll = () => {
    for (let modSlot of modSlots) {
        modSlot.selected = false;
        modSlot.classList.remove('slot-selected')
    }
    selectedSlot = false;
}

/**
 * Shows visualiser signal flow path
 */
const setOutputPath = () => {
    hideAllOutputPaths(modSlots);
    const slotArr = []
    for (let modSlot of modSlots)
        slotArr.push(modSlot);
    slotArr.reverse();
    let prevMod = false;
    for (let modSlot of slotArr) {
        if (!modSlot.filled)
            continue;
        if (prevMod)
            activatePath(modSlot);
        else
            activateOutput(modSlot)
        prevMod = modSlot;
    }
}

/**
 * Shows correct output for selected slot
 * @param {HTMLElement} modSlot - slot made active
 */
const activateOutput = (modSlot) => {
    const outputPath = document.getElementById(`${modSlot.id}-out`);
    return outputPath.style.opacity = 1;
}

/**
 * Shows correct inter-slot path when slot selected
 * @param {HTMLElement} modSlot - slot made active
 */
const activatePath = (modSlot) => {
    const modPath = document.getElementById(`${modSlot.id}-path`)
    return modPath.style.opacity = 1;

}

/**
 * Hides all output paths
 * @param {array} modSlots - array of module slots
 */
const hideAllOutputPaths = (modSlots) => {
    for (let modSlot of modSlots) {
        const modPath = document.getElementById(`${modSlot.id}-path`);
        if (modPath)
            modPath.style.opacity = 0;
        const modOut = document.getElementById(`${modSlot.id}-out`);
        if (modOut)
            modOut.style.opacity = 0;
    }
}

/**
 * Saves visualiser setup to setlist
 * @param {Event} e 
 */
const saveSettings = (e) => {
    const trackName = document.getElementById('trackName').value;
    if (trackName === "")
    return alert('Track must have a name');
    const track = {
        name: trackName,
        source: document.getElementById('trackSource')?.value,
        feature: document.getElementById('trackFeatured')?.value,
        visChain: [],
        position: -1 // placeholder, value retrieved from database
    }
    for (let visModule of moduleChain) {
        const trackModule = {
            name: visModule.name,
            params: visualiserParamVals[visModule.name]
        }
        track.visChain.push(trackModule);
    }
    let openRequest = indexedDB.open('visDB', 1);
    openRequest.onerror = (err) => {
        console.log(`Error opening database: ${err.message}`);
    }
    openRequest.onsuccess = () => {
        let db = openRequest.result;
        const transaction = db.transaction('setlist', 'readwrite');
        const setList = transaction.objectStore('setlist');
        // get next set position to put setlist item at end
        const index = setList.index('setpos');
        const openCursorRequest = index.openCursor(null, 'prev');
        openCursorRequest.onerror = (err) => {
            console.log(`Error getting max position: ${err.message}`);
        }
        openCursorRequest.onsuccess = (event) => {
            if (event.target.result)
                track.position = event.target.result.value.position + 1;
            else
                track.position = 0
            console.log(track)
            let saveRequest = setList.put(track);
            saveRequest.onerror = (err) => {
                console.log(`Error saving setlist item: ${err.target.error.message}`, err);
            }
            saveRequest.onsuccess = () => {
                console.log('Setlist item saved');
                window.location.href = "/hub.html";
            }
        }
    }
}

// make module selector
const selectorTarget = document.getElementById('module-selector');

const moduleSelector = document.createElement('select');

const visModules = {};

for (let visGroup of visList) {
    const optGroup = document.createElement('optgroup');
    optGroup.label = visGroup.visGroup;
    for (let vis of visGroup.visualisers) {
        const option = document.createElement('option');
        option.value = vis.name;
        option.text = vis.name;
        optGroup.appendChild(option);
        visModules[vis.name] = {
            name: vis.name
        };
    }
    moduleSelector.add(optGroup);
}

selectorTarget.appendChild(moduleSelector)

// add fill and clear slot buttons
const addModuleButton = document.createElement('button');
addModuleButton.innerText = "Module to Selected Slot"
selectorTarget.appendChild(addModuleButton)
addModuleButton.addEventListener('click', addModule)
const clearSlotButton = document.createElement('button');
clearSlotButton.innerText = "Clear Selected Slot"
selectorTarget.appendChild(clearSlotButton)
clearSlotButton.addEventListener('click', clearSlot)

// make save settings
const saveSettingsEl = document.getElementById('saveSettings');
const saveSettingsButton = document.createElement('button');
saveSettingsButton.innerText = "Save To Setlist";
saveSettingsButton.addEventListener('click', saveSettings);
saveSettingsEl.appendChild(saveSettingsButton);

// initialise module slots, make selectable
let selectedSlot = false;
const modSlots = document.getElementsByClassName('vis-module');
let modSlot;
for (modSlot of modSlots) {
    modSlot.addEventListener("click", (e) => selectSlot(e.target));
    modSlot.selected = false;
    modSlot.filled = false;
}
// initialise last slot as selected
modSlot.selected = true;
modSlot.classList.add('slot-selected');
selectedSlot = modSlot;
setOutputPath();

// track module chain
export let moduleChain = []

// p5js preview visualiser

export let inputDevice, outputRes, cnv, vidIn;
let asciiart_width, asciiart_height;
const asciiCof = 12;

// setters for exporting global contants to modules
// https://stackoverflow.com/questions/53723251/javascript-modifing-an-imported-variable-causes-assignment-to-constant-varia

export const setInputDevice = function(device) {
    inputDevice = device;
}

export const setOutputRes = function(res) {
    outputRes = res;
}

export const setCanvas = function(canvas) {
    cnv = canvas;
}

export const setVidIn = function(vidSrc) {
    vidIn = vidSrc;
}

/**
 * P5.JS preload function
 * Called asnchronously once at beginning of execution
 */
window.preload = function() {
    importModules()
}

/**
 * P5.JS setup function
 * Called once after preload is done
 */
window.setup = function() {
    // get data from persistent storage
    setupVisualisers();
}

/**
 * P5.JS draw function
 * Called every frame
 */
window.draw = function() {
    visualiserDraw();
}
