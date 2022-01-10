// async indexeddb wrapper https://github.com/jakearchibald/idb
import { openDB } from 'https://cdn.jsdelivr.net/npm/idb@7/+esm';

// import p5 draw functions
// import { visPreload, p5Preload, p5Setup, p5Draw } from './modules/common/p5Funcs.js';

// import registered visualisers for selector
import { visList } from "./modules/visualisers/registeredVis.js";

// import utilities and generators
import { outputParameters, outputParamVals } from "./modules/parameters/outputParameters.js"

import { VisOutputEngine } from "./modules/common/visOutputEngine.js"

/**
 * Adds a visualiser to a screen slot
 * @param {Event} e - HTML event
 */
const addModule = (e) => {
    if (!selectedSlot) return // don't try and fill output, or if no slot is selected somehow
    if (e.target.id === 'output') return // can't fill output slot
    selectedSlot.innerText = visualiserSelector.value;
    selectedSlot.filled = true;
    selectedSlot.classList.add('slot-filled');
    setOutputPath();
    updateModuleChain();
    showParams(visualiserSelector.value);
}

/**
 * Updates the chain of modules to match screen slots
 */
const updateModuleChain = () => {
    let tempVisChain = []
    for (let modSlot of document.getElementsByClassName('slot-filled')) {
        let slotObjUpdated = false;
        for (let visMod of currentVisChain) {
            if (visMod.name === modSlot.innerText) {
                tempVisChain.push(visMod);
                slotObjUpdated = true;
            }
        }
        if (slotObjUpdated) continue;
        const modObj = {};
        modObj.name = modSlot.innerText;
        const moduleParams = {};
        for (let param of visualiserModules[modSlot.innerText].params)
            moduleParams[param.name] = param.value;
        modObj.params = moduleParams;
        tempVisChain.push(modObj)
    }
    currentVisChain = tempVisChain
    visOutputEngine.setCurrentVisChain(currentVisChain);
    console.log(currentVisChain)
}

/**
 * Update appearance of slot when selected
 * @param {HTMLElement} slot - slot that has been clicked on
 */
const selectSlot = (slot) => {
    // audioIn.start();
    deselectAll();
    selectedSlot = slot;
    slot.selected = true;
    slot.classList.add('slot-selected')
    if (slot.classList.contains('slot-filled'))
        showParams(slot.innerText);
    else
        clearParams();
}

const selectOutput = () => {
    // audioIn.start()
    deselectAll()
    outSlot.classList.add('slot-selected');
    showParams('Output');
}

const deselectOutput = () => {
    outSlot.classList.remove('slot-selected');
}

/**
 * Display parameters for visualiser in selected module
 * @param {string} modName - module to show params of
 */
const showParams = (modName) => {
    let paramVals;
    if (modName === 'Output')
        paramVals = outputParamVals
    else
        for (let visMod of currentVisChain) {
            if (visMod.name === modName)
                paramVals = visMod.params
        }
    const paramsEl = document.getElementById('params');
    // empty parameters element
    while (paramsEl.firstChild)
        paramsEl.removeChild(paramsEl.firstChild);
    const paramTitle = document.getElementById('parameters-title');
    paramTitle.innerText = `${modName} Parameters`;
    const params = modName === 'Output' ? outputParameters : visualiserModules[modName].params;
    let paramContainer
    paramContainer = document.createElement('div');
    for (let param of params) {
        paramContainer.classList.add('param-container')
        const paramNameEl = document.createElement('div');
        paramNameEl.classList.add('param-name')
        paramNameEl.innerText = param.displayName;
        paramContainer.appendChild(paramNameEl);
        const paramEntry = document.createElement('input');
        paramEntry.name = `${modName}-${param.name}`;
        paramEntry.addEventListener('input', updateParameter);
        switch (param.type) {
            case 'val':
                paramEntry.type = 'range';
                paramEntry.min = param.hasOwnProperty('range') ? param.range[0] : 0;
                paramEntry.max = param.hasOwnProperty('range') ? param.range[1]: 255;
                paramEntry.value = param.hasOwnProperty('value') ? paramVals[param.name] : 100;
                paramEntry.step = param.hasOwnProperty('step') ? param.step : 1;
                break;
            case 'toggle':
                paramEntry.type = 'checkbox';
                paramEntry.checked = paramEntry.value = param.hasOwnProperty('value') ? paramVals[param.name] : false;
                break;
        };
        paramContainer.appendChild(paramEntry);
        const paramVal = document.createElement('div');
        paramVal.id = `${modName}-${param.name}-value`;
        paramVal.classList.add('param-val');
        paramVal.innerText = paramVals[param.name];
        paramContainer.appendChild(paramVal)
    }
    paramsEl.appendChild(paramContainer);
}


/**
 * Update parameter values when control is changed
 * @param {Event} e - triggering event
 */
const updateParameter = (e) => {
    const names = e.target.name.split("-");
    const moduleName = names[0], paramName = names[1];
    const newValue = getParameterValue(e);
    if (moduleName === 'Output') {
        outputParamVals[paramName] = newValue;
    } else {
        for (let visMod of currentVisChain) {
            if (visMod.name == moduleName) {
                visMod.params[paramName] = newValue;
            }
        }
    }
    moduleName === 'Output' ? visOutputEngine.setOutputSettings(outputParamVals) : visOutputEngine.setCurrentVisChain(currentVisChain);
    document.getElementById(`${e.target.name}-value`).innerText = newValue;
}

/**
 * Returns parameter value from a changed input control, dependent on input type
 * @param {Event} e - Triggering event
 * @returns {Boolean | Float} - Updated parameter value
 */
const getParameterValue = (e) => {
    if (e.target.type === 'checkbox')
        return e.target.checked;
    else
        return parseFloat(e.target.value);
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
    paramTitle.innerText = "Visualiser Parameters";
}

/**
 * Update slots when changed
 */
const updateSlots = () => {
    let currSlot;
    for (const visIdx in currentVisChain) {
        const currVis = currentVisChain[visIdx]
        currSlot = modSlots[parseInt(visIdx) + (modSlots.length - currentVisChain.length)];
        currSlot.innerText = currVis.name;
        currSlot.filled = true;
        currSlot.classList.add('slot-filled')
        visualiserSelector.value = currVis.name;
    }
    currSlot.classList.add('slot-selected');
    setOutputPath();
    updateModuleChain();
    showParams(visualiserSelector.value);
}

/**
 * Clears slot
 */
const clearSlot = () => {
    if (!selectedSlot) return;
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
    deselectOutput();
    for (let modSlot of modSlots) {
        modSlot.selected = false;
        modSlot.classList.remove('slot-selected')
    }
    selectedSlot = false;
}

/**
 * Fills save form with values from set item when editing
 * @param {Object} setItem 
 */
const fillDetails = async (setItem) => {
    document.getElementById('trackName').value = setItem.name;
    document.getElementById('trackSource').value = setItem.source;
    document.getElementById('trackFeatured').value = setItem.feature;
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
        position: -1,
        outputSettings: outputParamVals // placeholder, value retrieved from database
    }
    for (let visModule of currentVisChain) {
        const trackModule = {
            name: visModule.name,
            params: visModule.params
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
                track.position = parseInt(event.target.result.value.position) + 1;
            else
                track.position = 0
            let saveRequest = setList.put(track);
            saveRequest.onerror = (err) => {
                console.log(`Error saving setlist item: ${err.target.error.message}`, err);
            }
            saveRequest.onsuccess = () => {
                console.log('Setlist item saved');
                window.location.href = "hub.html";
            }
        }
    }
}

// check if editing or creating new
/**
 * Retrieves setlist item from database when editing
 * @param {String} trackName - name of setlist item to edit
 * @returns {Object} - setlist item
 */
const editExisting = async (trackName) => {
    let db = await openDB('visDB', 1, db => {
        if (db.oldVersion == 0) {
            console.log(`Error opening database: ${err.message}`);
            return [];
        }
    });
    try {
        let res = await db.get('setlist', trackName);
        return res;
    }
    catch (err) {
        console.log(`Error retrieving ${trackName} from setlist: ${err}`)
        return []
    }
}

/**
 * Build user interface for visualiser creator page
 */
const buildCreatorUI = () => {
    // make visualiser selector
    const selectorTarget = document.getElementById('module-selector');
    
    visualiserSelector = document.createElement('select');
    
    const allVisModules = {};
    
    for (let visGroup of visList) {
        const optGroup = document.createElement('optgroup');
        optGroup.label = visGroup.visGroup;
        for (let vis of visGroup.visualisers) {
            const option = document.createElement('option');
            option.value = vis.name;
            option.text = vis.name;
            optGroup.appendChild(option);
            allVisModules[vis.name] = {
                name: vis.name
            };
        }
        visualiserSelector.add(optGroup);
    }
    selectorTarget.appendChild(visualiserSelector)
    
    // add fill and clear slot buttons
    const addModuleButton = document.createElement('button');
    addModuleButton.innerText = "Module to Selected Slot"
    selectorTarget.appendChild(addModuleButton)
    addModuleButton.addEventListener('click', addModule)
    const clearSlotButton = document.createElement('button');
    clearSlotButton.innerText = "Clear Selected Slot"
    selectorTarget.appendChild(clearSlotButton)
    clearSlotButton.addEventListener('click', clearSlot)
    
    // make save settings and exit buttons
    const saveSettingsEl = document.getElementById('saveSettings');
    const saveSettingsButton = document.createElement('button');
    saveSettingsButton.innerText = "Save To Setlist";
    saveSettingsButton.addEventListener('click', saveSettings);
    saveSettingsEl.appendChild(saveSettingsButton);
    
    const exitButton = document.createElement('button');
    exitButton.innerText = "Exit Creator";
    exitButton.addEventListener('click', (e)=>{
        window.location.href = 'hub.html';
    })
    saveSettingsEl.appendChild(exitButton);
    
    // initialise module slots, make selectable
    // let selectedSlot = false;
    modSlots = document.getElementsByClassName('vis-module');
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
    
    // setup Output slot
    outSlot = document.getElementById('output');
    outSlot.addEventListener('click', selectOutput)
}

const queryString   = window.location.search;
const urlParams     = new URLSearchParams(queryString);
let currentVisChain = [];

// global variables
let visualiserSelector, modSlots, selectedSlot = false, outSlot;
let visualiserModules, visOutputEngine;

window.onload = async () => {
    // creator page specific preload
    buildCreatorUI();
    if (urlParams.get('edit')) {
        const existingSetItem = await editExisting(urlParams.get('track'));
        currentVisChain = existingSetItem.visChain;
        if (currentVisChain.length > 0 || existingSetItem) {
            await fillDetails(existingSetItem);
            updateSlots();
        }
    }
    visOutputEngine = new VisOutputEngine();
    visualiserModules = await visOutputEngine.loadVisModules();
    await visOutputEngine.setupCanvas()
    visOutputEngine.drawCanvas();
}   