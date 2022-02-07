// async indexeddb wrapper https://github.com/jakearchibald/idb
import { openDB } from '../lib/openDB.js';

// import registered visualisers for selector
import { visList } from './modules/visualisers/registeredVis.js';

// import utilities and generators
import { outputParameters, outputParamVals } from './modules/parameters/outputParameters.js';
import { rgbToHex, hexToRgb } from './modules/util/utils.js';

// import visualiser engine for preview
import { VisOutputEngine } from './modules/common/VisOutputEngine.js';

/**
 * Adds a visualiser to a screen slot
 * @param {Event} e - HTML event
 */
const addModule = (e) => {
  if (!selectedSlot) return; // don't try and fill output, or if no slot is selected somehow
  if (e.target.id === 'output') return; // can't fill output slot
  // update vis chain
  const visObj = {};
  visObj.name = visualiserSelector.value;
  const paramsObj = {};
  Object.values(visualiserModules[visualiserSelector.value].params).map((param) => (paramsObj[param.name] = param.value));
  visObj.params = paramsObj;
  currentVisChain[selectedSlot.dataset.visIdx] = visObj;
  // update screen module
  selectedSlot.innerText = visualiserSelector.value;
  selectedSlot.filled = true;
  selectedSlot.classList.add('slot-filled');
  setOutputPath();
  visOutputEngine.setCurrentVisChain(currentVisChain);
  showParams(selectedSlot.dataset.visIdx);
};

/**
 * Update appearance of slot when selected
 * @param {HTMLElement} slot - slot that has been clicked on
 */
const selectSlot = (slot) => {
  // audioIn.start();
  deselectAll();
  selectedSlot = slot;
  slot.selected = true;
  slot.classList.add('slot-selected');
  if (slot.classList.contains('slot-filled')) showParams(slot.dataset.visIdx);
  else clearParams();
};

const selectOutput = () => {
  deselectAll();
  outSlot.classList.add('slot-selected');
  showParams('Output');
};

const deselectOutput = () => {
  outSlot.classList.remove('slot-selected');
};

const createParamSelect = (param, paramVal, name) => {
  const selecter = document.createElement('select');
  selecter.name = name;
  selecter.addEventListener('change', updateParameter);
  param.options.map((option) => {
    let opt = document.createElement('option');
    opt.value = option;
    opt.text = option;
    if (option === paramVal) opt.selected = true;
    selecter.add(opt);
  });
  return selecter;
};

/**
 * Display parameters for visualiser in selected module
 * @param {string} modName - module to show params of
 */
const showParams = (visIdx) => {
  let paramVals, modName;
  if (visIdx === 'Output') {
    modName = 'Output';
    paramVals = outputSettings;
  } else {
    if (!currentVisChain[visIdx]) return;
    paramVals = currentVisChain[visIdx].params;
    modName = currentVisChain[visIdx].name;
  }
  const paramsEl = document.getElementById('params');
  // empty parameters element
  while (paramsEl.firstChild) paramsEl.removeChild(paramsEl.firstChild);
  const paramTitle = document.getElementById('parameters-title');
  paramTitle.innerText = `${modName} Parameters`;
  const params = modName === 'Output' ? outputParameters : visualiserModules[modName].params;
  let paramContainer;
  paramContainer = document.createElement('div');
  if (params.length === 0) {
    paramContainer.innerText = 'No user parameters for this visualiser';
    return;
  }
  for (let param of Object.values(params)) {
    paramContainer.classList.add('param-container');
    const paramNameEl = document.createElement('div');
    paramNameEl.classList.add('param-name');
    paramNameEl.innerText = param.displayName;
    if (param.tooltip) {
      paramNameEl.dataset.tooltip = param.tooltip;
    }
    paramContainer.appendChild(paramNameEl);
    let paramEntry = document.createElement('input');
    paramEntry.classList.add('param-entry');
    paramEntry.name = `${modName}-${param.name}`;
    paramEntry.id = `${modName}-${param.name}`;
    paramEntry.addEventListener('input', updateParameter);
    switch (param.type) {
      case 'val':
        paramEntry.type = 'range';
        paramEntry.min = param.hasOwnProperty('range') ? param.range[0] : 0;
        paramEntry.max = param.hasOwnProperty('range') ? param.range[1] : 255;
        paramEntry.value = param.hasOwnProperty('value') ? paramVals[param.name] : 100;
        paramEntry.step = param.hasOwnProperty('step') ? param.step : 1;
        break;
      case 'toggle':
        paramEntry.type = 'checkbox';
        paramEntry.checked = paramEntry.value = param.hasOwnProperty('value') ? paramVals[param.name] : false;
        break;
      case 'colour':
        paramEntry.type = 'color';
        paramEntry.value = paramVals[param.name];
        break;
      case 'select':
        paramEntry = createParamSelect(param, paramVals[param.name], `${modName}-${param.name}`);
        break;
      case 'text':
        paramEntry.type = 'text';
        if (param.name === 'mediaURL') paramEntry.classList.add('invalidURL');
        paramEntry.value = paramVals[param.name] || '';
        break;
    }
    paramContainer.appendChild(paramEntry);
    const paramVal = document.createElement('div');
    paramVal.id = `${modName}-${param.name}-value`;
    paramVal.classList.add('param-val');
    switch (param.type) {
      case 'colour':
        break;
      default:
        paramVal.innerText = paramVals[param.name];
    }
    paramContainer.appendChild(paramVal);
  }
  paramsEl.appendChild(paramContainer);
};

/**
 * Update parameter values when control is changed
 * @param {Event} e - triggering event
 */
const updateParameter = (e) => {
  const names = e.target.name.split('-');
  const moduleName = names[0],
    paramName = names[1];
  let newValue = getParameterValue(e);
  if (moduleName === 'Output') {
    outputSettings[paramName] = newValue;
  } else {
    const visIdx = selectedSlot.dataset.visIdx;
    currentVisChain[visIdx].params[paramName] = newValue;
  }
  moduleName === 'Output' ? visOutputEngine.setOutputSettings(outputSettings) : visOutputEngine.setCurrentVisChain(currentVisChain);
  // hacky - didn't realise I'd need a type until much later
  const paramType = paramName.split('_')[paramName.split('_').length - 1];
  if (paramType === 'col') {
    // if it's a colour, convert back to hex before adding as the input value
    newValue = rgbToHex(...newValue);
    return;
  }
  document.getElementById(`${e.target.name}-value`).innerText = newValue;
};

/**
 * Returns parameter value from a changed input control, dependent on input type
 * @param {Event} e - Triggering event
 * @returns {Boolean | Float} - Updated parameter value
 */
const getParameterValue = (e) => {
  switch (e.target.type) {
    case 'checkbox':
      return e.target.checked;
      break;
    case 'color':
      return hexToRgb(e.target.value);
      break;
    case 'select-one':
    case 'text':
      return e.target.value;
      break;
    default:
      return parseFloat(e.target.value);
  }
};

/**
 * Clear parameter display
 */
const clearParams = () => {
  const paramsEl = document.getElementById('params');
  // empty parameters element
  while (paramsEl.firstChild) paramsEl.removeChild(paramsEl.firstChild);
  const paramTitle = document.getElementById('parameters-title');
  paramTitle.innerText = 'Visualiser Parameters';
};

/**
 * Update slots when changed
 */
const updateSlots = () => {
  let currSlot;
  currFilledSlots = [];
  for (const visIdx in currentVisChain) {
    const currVis = currentVisChain[visIdx];
    currSlot = document.querySelector(`[data-vis-idx='${visIdx}']`);
    if (currVis) {
      currSlot.innerText = currVis.name;
      currSlot.filled = true;
      currSlot.classList.add('slot-filled');
      currFilledSlots[currSlot.dataset.visIdx] = currSlot;
      visualiserSelector.value = currVis.name;
    } else {
      currSlot.innerText = 'Empty Slot';
    }
  }
  currSlot.classList.add('slot-selected');
  setOutputPath();
  visOutputEngine.setCurrentVisChain(currentVisChain);
  showParams(selectedSlot.dataset.visIdx);
  showParams(visualiserSelector.value);
};

/**
 * Clears slot
 */
const clearSlot = () => {
  if (!selectedSlot) return;
  currentVisChain[selectedSlot.dataset.visIdx] = null;
  selectedSlot.innerText = 'Empty Slot';
  selectedSlot.filled = false;
  selectedSlot.classList.remove('slot-filled');
  clearParams();
  setOutputPath();
  visOutputEngine.setCurrentVisChain(currentVisChain);
};

/**
 * Deselects all slots
 */
const deselectAll = () => {
  deselectOutput();
  for (let modSlot of modSlots) {
    modSlot.selected = false;
    modSlot.classList.remove('slot-selected');
  }
  selectedSlot = false;
};

/**
 * Fills save form with values from set item when editing
 * @param {Object} setItem
 */
const fillDetails = (setItem) => {
  document.getElementById('trackName').value = setItem.name;
  document.getElementById('trackSource').value = setItem.source;
  document.getElementById('trackFeatured').value = setItem.feature;
};

/**
 * Shows visualiser signal flow path
 */
const setOutputPath = () => {
  hideAllOutputPaths(modSlots);
  const slotArr = [];
  for (let modSlot of modSlots) slotArr.push(modSlot);
  slotArr.reverse();
  let prevMod = false;
  for (let modSlot of slotArr) {
    if (!modSlot.filled) continue;
    if (prevMod) activatePath(modSlot);
    else activateOutput(modSlot);
    prevMod = modSlot;
  }
};

/**
 * Shows correct output for selected slot
 * @param {HTMLElement} modSlot - slot made active
 */
const activateOutput = (modSlot) => {
  const outputPath = document.getElementById(`${modSlot.id}-out`);
  return (outputPath.style.opacity = 1);
};

/**
 * Shows correct inter-slot path when slot selected
 * @param {HTMLElement} modSlot - slot made active
 */
const activatePath = (modSlot) => {
  const modPath = document.getElementById(`${modSlot.id}-path`);
  return (modPath.style.opacity = 1);
};

/**
 * Hides all output paths
 * @param {array} modSlots - array of module slots
 */
const hideAllOutputPaths = (modSlots) => {
  for (let modSlot of modSlots) {
    const modPath = document.getElementById(`${modSlot.id}-path`);
    if (modPath) modPath.style.opacity = 0;
    const modOut = document.getElementById(`${modSlot.id}-out`);
    if (modOut) modOut.style.opacity = 0;
  }
};

/**
 * Saves visualiser setup to setlist
 * @param {Event} e
 */
const saveSettings = (e) => {
  const trackName = document.getElementById('trackName').value;
  if (trackName === '') return alert('Track must have a name');
  const track = {
    name: trackName,
    source: document.getElementById('trackSource')?.value,
    feature: document.getElementById('trackFeatured')?.value,
    visChain: [],
    position: -1,
    outputSettings: outputSettings, // placeholder, value retrieved from database
  };

  for (let visModule of currentVisChain) {
    track.visChain.push(visModule);
  }
  let openRequest = indexedDB.open('visDB', 1);
  openRequest.onerror = (err) => {
    console.log(`Error opening database: ${err.message}`);
  };
  openRequest.onsuccess = () => {
    let db = openRequest.result;
    const transaction = db.transaction('setlist', 'readwrite');
    const setList = transaction.objectStore('setlist');
    // get next set position to put setlist item at end
    const index = setList.index('setpos');
    const openCursorRequest = index.openCursor(null, 'prev');
    openCursorRequest.onerror = (err) => {
      console.log(`Error getting max position: ${err.message}`);
    };
    openCursorRequest.onsuccess = (event) => {
      if (event.target.result) track.position = parseInt(event.target.result.value.position) + 1;
      else track.position = 0;
      let saveRequest = setList.put(track);
      saveRequest.onerror = (err) => {
        console.log(`Error saving setlist item: ${err.target.error.message}`, err);
      };
      saveRequest.onsuccess = () => {
        console.log('Setlist item saved');
        window.location.href = 'hub.html';
      };
    };
  };
};

// check if editing or creating new
/**
 * Retrieves setlist item from database when editing
 * @param {String} trackName - name of setlist item to edit
 * @returns {Object} - setlist item
 */
const editExisting = async (trackName) => {
  let db = await openDB('visDB', 1, (db) => {
    if (db.oldVersion == 0) {
      throw new Error(`Error opening database: ${err.message}`);
      return [];
    }
  });
  try {
    let res = await db.get('setlist', trackName);
    return res;
  } catch (err) {
    throw new Error(`Error retrieving ${trackName} from setlist: ${err}`);
    return [];
  }
};

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
        name: vis.name,
      };
    }
    visualiserSelector.add(optGroup);
  }
  selectorTarget.appendChild(visualiserSelector);

  // add fill and clear slot buttons
  const addModuleButton = document.createElement('button');
  addModuleButton.innerText = 'Module to Selected Slot';
  selectorTarget.appendChild(addModuleButton);
  addModuleButton.addEventListener('click', addModule);
  const clearSlotButton = document.createElement('button');
  clearSlotButton.innerText = 'Clear Selected Slot';
  selectorTarget.appendChild(clearSlotButton);
  clearSlotButton.addEventListener('click', clearSlot);

  // make save settings and exit buttons
  const saveSettingsEl = document.getElementById('saveSettings');
  const saveSettingsButton = document.createElement('button');
  saveSettingsButton.innerText = 'Save To Setlist';
  saveSettingsButton.addEventListener('click', saveSettings);
  saveSettingsEl.appendChild(saveSettingsButton);

  const exitButton = document.createElement('button');
  exitButton.innerText = 'Exit Creator';
  exitButton.addEventListener('click', (e) => {
    window.location.href = 'hub.html';
  });
  document.getElementById('exit').appendChild(exitButton);

  // initialise module slots, make selectable
  modSlots = document.getElementsByClassName('vis-module');
  let modSlot;
  let idx = 0;
  for (modSlot of modSlots) {
    modSlot.addEventListener('click', (e) => selectSlot(e.target));
    modSlot.selected = false;
    modSlot.filled = false;
    modSlot.dataset.visIdx = idx;
    idx++;
  }
  // initialise last slot as selected
  modSlot.selected = true;
  modSlot.classList.add('slot-selected');
  selectedSlot = modSlot;
  setOutputPath();

  // setup Output slot
  outSlot = document.getElementById('output');
  outSlot.addEventListener('click', selectOutput);
  outSlot.dataset.visIdx = 'Output';
};

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
let currentVisChain = [];
let visChainLength = 0;
let currFilledSlots = [];

// global variables
let visualiserSelector,
  modSlots,
  selectedSlot = false,
  outSlot;
let visualiserModules, visOutputEngine;
let outputSettings;

window.onload = async () => {
  visOutputEngine = new VisOutputEngine({ debug: true });
  visualiserModules = await visOutputEngine.loadVisModules();
  outputSettings = outputParamVals;
  // creator page specific preload
  buildCreatorUI();
  await visOutputEngine.setupCanvas();
  if (urlParams.get('edit')) {
    const existingSetItem = await editExisting(urlParams.get('track'));
    currentVisChain = existingSetItem.visChain;
    outputSettings = existingSetItem.outputSettings;
    visOutputEngine.setOutputSettings(outputSettings);
    if (currentVisChain.length > 0 || existingSetItem) {
      fillDetails(existingSetItem);
      updateSlots();
    }
    // provide hint for saving
    document.getElementById('saveSettings').appendChild(document.createTextNode(' - Change the Track Name to save a copy'));
  }
  visOutputEngine.drawCanvas();
  const loading = document.getElementById('loading');
  loading.style.opacity = 0;
  loading.ontransitionend = () => {
    loading.style.visibility = 'hidden';
  };
};
