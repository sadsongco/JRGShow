const setlist = [
    "House of Woodcock",
    "Alma",
    "Three Miniatures From Water",
    "Prospectors Arrive",
    "Future Markets",
    "De-Tuned Quartet",
]

const setlistContainer = document.getElementById('setListContainer')
const visualiserContainer = document.getElementById('vis')
visualiserContainer.addEventListener('click', (e)=>{
    visualiserContainer.style.display = 'none'
})
const visTitle = document.getElementById('visTitle')

for (let setlistNo in setlist) {
    const newEl = document.createElement('div')
    newEl.id = setlistNo
    newEl.classList.add('setlistItem')
    newEl.addEventListener('click', (e)=>launchSetlistItem(e))
    const newContent = document.createTextNode(setlist[setlistNo])
    newEl.appendChild(newContent)
    setlistContainer.appendChild(newEl)
}

const launchSetlistItem = function(e) {
    const newContent = document.createTextNode(setlist[e.target.id])
    visTitle.innerHTML = ''
    visTitle.appendChild(newContent)
    visualiserContainer.style.display = 'block'
}