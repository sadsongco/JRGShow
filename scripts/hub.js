import { getSetlist, sortSetlistByOrder } from './modules/common/getSetlist.js';
import { Sortable } from '../lib/sortable.core.esm.js';

let setlist, setlistContainer;

window.onload = () => {
  setlistContainer = document.getElementById('setlist');
  getSetlist()
    .then((res) => {
      setlist = res;
      createSetlistUI(setlist, setlistContainer);
      setDownloadButton(setlist);
    })
    .catch((err) => {
      throw new Error(err);
    });
};

const createSetlistUI = (setlist, target) => {
  while (target.firstChild) target.removeChild(target.firstChild);
  if (setlist.length === 0) {
    const emptyMessage = document.createElement('div');
    emptyMessage.classList.add('songNameContainer', 'emptyMessage');
    emptyMessage.innerText = "Setlist items will appear here after you save them using 'Create New Song Visual'";
    target.appendChild(emptyMessage);
    return;
  }
  const sortedSetlist = sortSetlistByOrder(setlist);
  for (const setlistItem of sortedSetlist) {
    target.classList.add('slist');
    let items = [];
    const item = document.createElement('li');
    item.value = parseInt(setlistItem.position);
    const songNameContainer = document.createElement('div');
    songNameContainer.classList.add('songNameContainer');
    songNameContainer.innerText = setlistItem.name;
    item.appendChild(songNameContainer);

    // add edit and delete buttons to list
    const options = document.createElement('div');
    options.classList.add('setlistItemOptions');
    const delItem = document.createElement('a');
    const editItem = document.createElement('a');
    editItem.innerText = 'edit';
    editItem.classList.add('optButton');
    editItem.id = setlistItem.name;
    editItem.addEventListener('click', editSetlistItem);
    options.appendChild(editItem);
    delItem.innerText = 'delete';
    delItem.classList.add('optButton');
    delItem.id = setlistItem.name;
    delItem.addEventListener('click', deleteSetlistItem);
    options.appendChild(delItem);
    item.appendChild(options);
    target.appendChild(item);
    items.push(item);
  }
  const sortable = Sortable.create(target, {
    animation: 300,
    onUpdate: (evt) => {
      saveSetlist();
    },
  });
};

/**
 * Save sorted setlist to database
 */
const saveSetlist = (replace = false) => {
  const setlistItems = document.getElementById('setlist').getElementsByTagName('li');
  for (const [setlistPos, setlistItem] of Object.entries(setlistItems)) {
    for (let item of setlist) {
      if (item.name === setlistItem.firstChild.innerText) item.position = parseInt(setlistPos);
    }
  }
  let openRequest = indexedDB.open('visDB', 1);
  openRequest.onerror = (err) => {
    throw new Error(`Error opening database: ${err.message}`);
  };
  openRequest.onsuccess = () => {
    let db = openRequest.result;
    const transaction = db.transaction('setlist', 'readwrite');
    const setListFromDB = transaction.objectStore('setlist');
    if (replace) {
      let clearRequest = setListFromDB.clear();
      clearRequest.onerror = (err) => {
        throw new Error(`Error clearing existing setlist: ${err.message}`);
      };
      clearRequest.onsuccess = () => {
        console.log('replace the whole setlist');
      };
    }
    // reset all positions
    let currPos = -1;
    let updateRequest = setListFromDB.openCursor();
    updateRequest.onerror = (err) => {
      throw new Error(`Error resetting positions: ${err.target.error.message}`);
    };
    updateRequest.onsuccess = () => {
      let cursor = updateRequest.result;
      if (cursor) {
        const updateData = cursor.value;
        updateData.position = currPos;
        currPos--;
        const resetRequest = cursor.update(updateData);
        resetRequest.onerror = (err) => {
          console.log(`Error resetting positions: ${err.target.error.message}`);
        };
        resetRequest.onsuccess = () => {
          console.log('Setlist position updated');
        };
        cursor.continue();
      } else {
        for (let item of setlist) {
          let saveRequest = setListFromDB.put(item);
          saveRequest.onerror = (err) => {
            console.log(`Error saving setlist item: ${err.target.error.message}`, item);
          };
          saveRequest.onsuccess = () => {
            console.log('Setlist item saved');
          };
        }
        setDownloadButton(setlist);
      }
    };
  };
};

/**
 * Delete setlist item from database
 * @param {Event} e - triggering event
 */
const deleteSetlistItem = (e) => {
  let confirmed = confirm(`Do you want to delete ${e.target.id}?`);
  if (confirmed) {
    let openRequest = indexedDB.open('visDB', 1);
    openRequest.onerror = (err) => {
      console.log(`Error opening database: ${err.message}`);
    };
    openRequest.onsuccess = () => {
      let db = openRequest.result;
      const transaction = db.transaction('setlist', 'readwrite');
      const request = transaction.objectStore('setlist').delete(e.target.id);
      request.onerror = (err) => {
        console.log(`Error deleting item ${e.target.id}: ${err.message}`);
      };
      transaction.oncomplete = () => {
        console.log(`${e.target.id} deleted`);
        slist(setlistContainer);
      };
    };
  }
};

/**
 * Open setlist item for editing in creator window
 * @param {Event} e - triggering event
 */
const editSetlistItem = (e) => {
  window.location.href = `creator.html?edit=true&track=${e.target.id}`;
};

/**
 * Clear database, reset app, return to initialisation page
 */
const resetApp = () => {
  let confirmed = confirm('This will delete all settings and databases. Want to proceed?');
  if (confirmed) {
    let openRequest = indexedDB.deleteDatabase('visDB', 1);
    window.location.href = 'index.html';
  }
};

// create reset button
const reset = document.createElement('a');
reset.classList.add('button');
reset.innerText = 'Reset Application';
document.getElementById('reset').appendChild(reset);
reset.addEventListener('click', resetApp);

// create save to disk button and filename input
const fileSave = document.createElement('a');
fileSave.classList.add('button');
fileSave.innerText = 'Save Setlist To Disk';
document.getElementById('files').appendChild(fileSave);
const saveName = document.createElement('input');
saveName.type = 'text';
saveName.placeholder = 'Name for Save File';
saveName.value = '';
saveName.addEventListener('change', () => setDownloadButton(setlist));
document.getElementById('files').appendChild(saveName);
document.getElementById('files').appendChild(document.createElement('br'));
const setDownloadButton = (setlist) => {
  fileSave.download = saveName.value === '' ? 'savedSetlist.json' : `${saveName.value}.json`;
  fileSave.href = `data:application/octet-stream,${JSON.stringify(setlist)}`;
};

// https://stackoverflow.com/questions/3582671/how-to-open-a-local-disk-file-with-javascript
const readFileFromDisk = (file) => {
  return new Promise((resolve, reject) => {
    let fr = new FileReader();
    fr.onload = () => resolve(fr.result);
    fr.readAsText(file);
  });
};

const loadSetlistFromDisk = async (e) => {
  console.log('loadSetlistFromDisk');
  const loadedSetlistString = await readFileFromDisk(e.target.files[0]);
  const loadedSetlist = await JSON.parse(loadedSetlistString);
  setlist = loadedSetlist;
  createSetlistUI(setlist, setlistContainer);
  saveSetlist(true);
};

// create load file from disk button, to trigger file input element
// https://developer.mozilla.org/en-US/docs/Web/API/File/Using_files_from_web_applications
const fileButton = document.createElement('a')
fileButton.classList.add('button');
fileButton.innerText = 'Load Setlist From Disk';
document.getElementById('files').appendChild(fileButton);
fileButton.addEventListener('click', ()=>{
    if (fileLoad)
        fileLoad.click()
}, false);
const fileLoad = document.createElement('input');
fileLoad.type = 'file';
fileLoad.addEventListener('change', loadSetlistFromDisk, false);
