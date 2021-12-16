// drag and drop list adapted from https://code-boxx.com/drag-drop-sortable-list-javascript/

const tmpSetlist = {
    'Song 1': {
        'chain': [],
        'position': 1
    },
    'Song 2': {
        'chain': [],
        'position': 2
    },
    'Song 3': {
        'chain': [],
        'position': 3
    },
    'Song 4': {
        'chain': [],
        'position': 0
    },
}

const setlistToArr = (setlist) => {
    const titles = Object.keys(setlist);
    const params = Object.values(setlist);
    for(let paramIdx in params)
        params[paramIdx].title = titles[paramIdx];
    return params;
}

// https://stackoverflow.com/questions/1069666/sorting-object-property-by-values
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
    const sortedSetlist = sortSetlistByOrder(setlistToArr(tmpSetlist));

    for (const setlistItem of sortedSetlist) {
        const item = document.createElement('li');
        item.value = setlistItem.position;
        item.innerText = setlistItem.title;
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
            console.log('current:', current)
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

const saveSetlist = () => {
    console.log(tmpSetlist['Song 1'].position);
    const setlistItems = document.getElementById('setlist').getElementsByTagName('li');
    console.log(setlistItems);
    for (const [setlistPos, setlistItem] of Object.entries(setlistItems)) {
        console.log(tmpSetlist[setlistItem.innerText].position)
        tmpSetlist[setlistItem.innerText].position = setlistPos;
    }
    console.log(tmpSetlist);
}