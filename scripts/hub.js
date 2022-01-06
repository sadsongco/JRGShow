import { getSetlist, sortSetlistByOrder } from './modules/common/getSetlist.js';

let setlist;

window.onload = () => {
    slist('setlist');
}

/**
 * Create sortable list - adapted from https://code-boxx.com/drag-drop-sortable-list-javascript/
 * @param {HTMLElement} target - container for sortable list
 */
const slist = (target) => {
    target = document.getElementById(target);
    while (target.firstChild)
        target.removeChild(target.firstChild);
    target.classList.add('slist');
    let items = [];
    let current = null;
    getSetlist()
    .then((res) => {
        setlist = res;
        if (res.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.classList.add('songNameContainer', 'emptyMessage');
            emptyMessage.innerText = "Setlist items will appear here after you save them using 'Create New Song Visual'";
            target.appendChild(emptyMessage);
            return
        }
        const sortedSetlist = sortSetlistByOrder(setlist);
        for (const setlistItem of sortedSetlist) {
            const item = document.createElement('li');
            item.value = parseInt(setlistItem.position);
            const songNameContainer = document.createElement('div')
            songNameContainer.classList.add('songNameContainer');
            songNameContainer.innerText = setlistItem.name;
            item.appendChild(songNameContainer);
            item.draggable = true;

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
        
            item.addEventListener('dragstart', (e) => {
                current = e.target;
                current.classList.add('grabbed');
                e.target.querySelector('.setlistItemOptions').style.display = 'none';
                for (let targetItem of items) {
                    if (targetItem != current) targetItem.classList.add('hint');
                }
            });
        
            item.addEventListener('dragenter', (e) => {
                if (e.target != current) e.target.classList.add('active');
            })
        
            item.addEventListener('dragleave', (e) => {
                e.target.classList.remove('active');
            });
        
            item.addEventListener('dragend', () => {
                for (let targetItem of items) {
                    targetItem.classList.remove('hint');
                    targetItem.classList.remove('active');
                }
            });
        
            item.addEventListener('dragover', (e) => {
                e.preventDefault();
            });
        
            item.addEventListener('drop', (e) => {
                e.preventDefault();
                current.classList.remove('grabbed');
                current.querySelector('.setlistItemOptions').style.display = 'block';
                if (e.target != current) {
                    let currentpos = 0, droppedpos = 0;
                    for (let i = 0; i < items.length; i ++) {
                        if (current == items[i]) currentpos = i;
                        if (e.target == items[i]) droppedpos = i;
                    }
                    // TODO there's an error here, but non-fatal
                    if (currentpos < droppedpos)
                        e.target.parentNode.insertBefore(current, e.target.nextSibling);
                    else
                        e.target.parentNode.insertBefore(current, e.target);
                    saveSetlist();
                }
            });
            target.appendChild(item);
            items.push(item);
        }
    })
}

/**
 * Save sorted setlist to database
 */
const saveSetlist = () => {
    const setlistItems = document.getElementById('setlist').getElementsByTagName('li');
    for (const [setlistPos, setlistItem] of Object.entries(setlistItems)) {
        console.log(setlistItem.firstChild.innerText)
        for (let item of setlist) {
            if (item.name === setlistItem.firstChild.innerText)
                item.position = parseInt(setlistPos);
        }
    }
    let openRequest = indexedDB.open('visDB', 1);
    openRequest.onerror = (err) => {
        console.log(`Error opening database: ${err.message}`);
    }
    openRequest.onsuccess = () => {
        let db = openRequest.result;
        const transaction = db.transaction('setlist', 'readwrite');
        const setListFromDB = transaction.objectStore('setlist');
        // reset all positions
        let currPos = -1;
        let updateRequest = setListFromDB.openCursor();
        updateRequest.onerror = (err) => {
            console.log(`Error resetting positions: ${err.target.error.message}`);
        }
        updateRequest.onsuccess = () => {
            let cursor = updateRequest.result;
            if (cursor) {
                const updateData = cursor.value;
                updateData.position = currPos;
                currPos --;
                const resetRequest = cursor.update(updateData);
                resetRequest.onerror = (err) => {
                    console.log(`Error resetting positions: ${err.target.error.message}`);
                }
                resetRequest.onsuccess = () => {
                    console.log('Setlist position updated')
                }
                cursor.continue();
            } else {
                for (let item of setlist) {
                    let saveRequest = setListFromDB.put(item);
                    saveRequest.onerror = (err) => {
                        console.log(`Error saving setlist item: ${err.target.error.message}`, item);
                    }
                    saveRequest.onsuccess = () => {
                        console.log('Setlist item saved');
                    }
                }
            }
        }
    }
}

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
        }
        openRequest.onsuccess = () => {
            let db = openRequest.result;
            const transaction = db.transaction('setlist', 'readwrite');
            const request = transaction.objectStore('setlist').delete(e.target.id);
            request.onerror = (err) => {
                console.log(`Error deleting item ${e.target.id}: ${err.message}`);
            }
            transaction.oncomplete = () => {
                console.log(`${e.target.id} deleted`);
                slist('setlist');
            }
            
        }
    }
}

/**
 * Open setlist item for editing in creator window
 * @param {Event} e - triggering event
 */
const editSetlistItem = (e) => {
    window.location.href = `creator.html?edit=true&track=${e.target.id}`;
}

/**
 * Clear database, reset app, return to initialisation page 
 */
const resetApp = () => {
    let confirmed = confirm("This will delete all settings and databases. Want to proceed?");
    if (confirmed) {
        let openRequest = indexedDB.deleteDatabase('visDB', 1);
        window.location.href = "/";
    }
}
const reset = document.createElement('a');
reset.classList.add('button');
reset.innerText = 'Reset Application';
document.getElementById('reset').appendChild(reset);
reset.addEventListener('click', resetApp);
