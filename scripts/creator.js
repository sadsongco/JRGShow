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


// persistent storage
let openRequest = indexedDB.open('visSettings', 1);
openRequest.onupgradeneeded = () => {
    console.log(`DB onupgrade: ${openRequest.result.name}`);
    let db = openRequest.result;
    if (!db.objectStoreNames.contains('visChains'))
        db.createObjectStore('visChains', {keyPath: 'id'});
}
openRequest.onerror = () => {
    console.log(`Database Error: ${openRequest.result}`);
}
openRequest.onsuccess = () => {
    let db = openRequest.result;
    console.log(openRequest.result)
    console.log(`DB open: ${openRequest.result.name}`);
    let transaction = db.transaction('visChains', 'readwrite');
    let visChains = transaction.objectStore('visChains');
    let visChain = {
        id: 1,
        setlistId: 1,
        chain: [
            {moduleName: 'bitwise1'}
        ]
    }
    let request = visChains.put(visChain);
    request.onsuccess = () => {
        console.log(`vis chain added: ${request.result}`);
    }
    request.onerror = () => {
        console.log(`Error: ${request.error}`);
    }
}

// let deleteRequest = indexedDB.deleteDatabase('visSettings');