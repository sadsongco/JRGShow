// drag and drop list adapted from https://code-boxx.com/drag-drop-sortable-list-javascript/
let setlist;

// https://stackoverflow.com/questions/1069666/sorting-object-property-by-values
/**
 * Orders setlist array according to position property of track object
 * @param {array} setlist - array of track objects
 * @returns {array} - sorted array
 */
const sortSetlistByOrder = (setlist) => {
    return [...setlist].sort((a, b) => a.position - b.position);
}

window.onload = () => {
    slist('setlist');
}

const slist = (target) => {
    target = document.getElementById(target);
    target.classList.add('slist');
    let items = [];
    let current = null;
    let openRequest = indexedDB.open('visDB', 1);
    openRequest.onerror = (err) => {
        console.log(`Error opening database: ${err.message}`);
    }
    openRequest.onsuccess = () => {
        let db = openRequest.result;
        const transaction = db.transaction('setlist');
        const setListFromDB = transaction.objectStore('setlist');
        const setRequest = setListFromDB.getAll();
        setRequest.onerror = (err) => {
            console.log(`Error retrieving setlist: ${err}`);
        }
        setRequest.onsuccess = () => {
            setlist = setRequest.result;
            const sortedSetlist = sortSetlistByOrder(setRequest.result);
            for (const setlistItem of sortedSetlist) {
                const item = document.createElement('li');
                item.value = setlistItem.position;
                item.innerText = setlistItem.name;
                item.draggable = true;
            
                item.addEventListener('dragstart', (e) => {
                    current = e.target;
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
                    if (e.target != current) {
                        let currentpos = 0, droppedpos = 0;
                        for (let i = 0; i < items.length; i ++) {
                            if (current == items[i]) currentpos = i;
                            if (e.target == items[i]) droppedpos = i;
                        }
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
        }
    }
}

const saveSetlist = () => {
    const setlistItems = document.getElementById('setlist').getElementsByTagName('li');
    for (const [setlistPos, setlistItem] of Object.entries(setlistItems)) {
        for (let item of setlist) {
            if (item.name === setlistItem.innerText)
                item.position = setlistPos;
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

// add reset button to page
const resetApp = () => {
    let confirmed = confirm("This will delete all settings and databases. Want to proceed?");
    if (confirmed) {
        let openRequest = indexedDB.deleteDatabase('visDB', 1);
        window.location.href = "/";
    }
    return;
}
const reset = document.createElement('button');
reset.innerText = 'Reset Application';
document.getElementById('reset').appendChild(reset);
reset.addEventListener('click', resetApp);
