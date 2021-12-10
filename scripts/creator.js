// import registered visualisers
import { visList } from "./modules/visualisers/registeredVis.js";
import getPixelValues   from './modules/util/getPixelValues.js'

let visualiserModules = {};

const importModules = async() => {
    for (let visGroup of visList) {
        for (let vis of visGroup.visualisers) {
            const modulePath = `./modules/visualisers/${visGroup.visGroup}/${vis.name}.js`;
            import (modulePath)
                .then((module) => {
                    visualiserModules[vis.name] = module
                })
        }
    }
}

importModules()

const addModule = (e) => {
    selectedSlot.innerText = moduleSelector.value;
    selectedSlot.filled = true;
    selectedSlot.classList.add('slot-filled');
    setOutputPath();
    updateModelChain();
}

const updateModelChain = () => {
    modelChain = []
    for (let modSlot of modSlots) {
        if (modSlot.filled)
            modelChain.push(visModules[modSlot.innerText])
    }
    console.log(modelChain)
}

const selectSlot = (slot) => {
    deselectAll();
    selectedSlot = slot;
    slot.selected = true;
    slot.classList.add('slot-selected')
}

const clearSlot = () => {
    selectedSlot.innerText = "";
    selectedSlot.filled = false;
    selectedSlot.classList.remove('slot-filled');
    setOutputPath();
    updateModelChain();
}

const deselectAll = () => {
    for (let modSlot of modSlots) {
        modSlot.selected = false;
        modSlot.classList.remove('slot-selected')
    }
    selectedSlot = false;
}

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

const activateOutput = (modSlot) => {
    const outputPath = document.getElementById(`${modSlot.id}-out`);
    return outputPath.style.opacity = 1;
}

const activatePath = (modSlot) => {
    const modPath = document.getElementById(`${modSlot.id}-path`)
    return modPath.style.opacity = 1;

}

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
let modelChain = []

// p5js preview visualiser

let inputDevice, outputRes, cnv, vidIn;
let asciiart_width, asciiart_height;
const asciiCof = 12;

window.preload = function() {
}

window.setup = function() {
    // get data from persistent storage
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
        // get input device
        const inputDeviceTransaction = db.transaction('inputDevice', 'readwrite');
        const inputDevices = inputDeviceTransaction.objectStore('inputDevice');
        const inputDeviceQuery = inputDevices.get(1)
        inputDeviceQuery.onsuccess = () => {
            inputDevice = inputDeviceQuery.result.inputDevice;
        }
        inputDeviceQuery.onerror = () => {
            console.log(`Database error: ${inputDeviceQuery.error}`);
        }
        // get output resolution
        const outputResTransaction = db.transaction('outputResolution', 'readwrite');
        const outputResos = outputResTransaction.objectStore('outputResolution');
        const outputResQuery = outputResos.get(1)
        outputResQuery.onsuccess = () => {
            outputRes = outputResQuery.result.outputResolution;
            const previewRes = {
                w: outputRes.w * ((windowWidth / outputRes.w) / 4),
                h: outputRes.h * ((windowWidth / outputRes.w) / 4),
            }
            // create and place the canvas
            pixelDensity(1)
            cnv = createCanvas(previewRes.w, previewRes.h)
            // asciiart_width = Math.floor(cnv.width / asciiCof)
            // asciiart_height = Math.floor(cnv.height / asciiCof)
            cnv.parent('preview')
        
            // set up camera to capture from input source
            vidIn = createCapture(inputDevice.constraints, ()=>{
                vidIn.hide()
                vidIn.size(cnv.width, cnv.height)
            })
        }
        outputResQuery.onerror = () => {
            console.log(`Database error: ${outputResQuery.error}`);
        }
        frameRate(10)
    }
}
const thresh = 10;
window.draw = function() {
    background(150);
    vidIn.loadPixels();
    for (let vy = 0; vy < cnv.height; vy++) {
        for (let vx = 0; vx < cnv.width; vx++) {
            const pixIdx = ((vy * width) + vx) * 4
            let [iR, iG, iB] = getPixelValues(pixIdx, vidIn.pixels)
            [
                vidIn.pixels[pixIdx + 0],
                vidIn.pixels[pixIdx + 1],
                vidIn.pixels[pixIdx + 2],
                vidIn.pixels[pixIdx + 3]
            ] = visualiserModules['bitwiseN'].pixProcess(pixIdx, iR, iG, iB, thresh, pixels)
        }
    }
    vidIn.updatePixels();
    image(vidIn, 0, 0, cnv.width, cnv.height);
}