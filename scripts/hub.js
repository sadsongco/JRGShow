// https://code-boxx.com/drag-drop-sortable-list-javascript/

window.onload = () => {
    slist('setlist');
}

const slist = (target) => {
    target = document.getElementById(target);
    target.classList.add('slist');

    let items = target.getElementsByTagName("li"), current = null;
    for (let item of items) {
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
    }
}

const saveSetlist = () => {
    const setlistItems = document.getElementById('setlist').children;
    for (let setlistItem of setlistItems)
        console.log(setlistItem.value)
}