const addModule = (e) => {
    console.log(moduleSelector.value)
    alert(`add module ${moduleSelector.value}`)
}

// make module selector
import { visList } from "./modules/visualisers/registeredVis.js";
const selectorTarget = document.getElementById('module-selector');

const moduleSelector = document.createElement('select');

for (let vis of visList) {
    const option = document.createElement('option');
    option.value = vis.name;
    option.text = vis.name;
    moduleSelector.add(option);
}

selectorTarget.appendChild(moduleSelector)
const addModuleButton = document.createElement('button');
addModuleButton.innerText = "Add Module"
selectorTarget.appendChild(addModuleButton)
addModuleButton.addEventListener('click', addModule)

// make save settings
const saveSettingsEl = document.getElementById('saveSettings');
const saveSettingsButton = document.createElement('button');
saveSettingsButton.innerText = "Save To Setlist";
saveSettingsEl.appendChild(saveSettingsButton);

const setlistName = document.createElement('input');
setlistName.setAttribute("type", "text");
saveSettingsEl.appendChild(setlistName);