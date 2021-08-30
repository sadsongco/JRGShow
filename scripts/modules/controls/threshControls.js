const channel = new BroadcastChannel('vis-comms')
console.log('threshControls')
export const threshBase = document.getElementById('threshBase')
threshBase.addEventListener('input', (e)=>{
    channel.postMessage({ threshBase: e.target.value })
    threshBaseVal.innerText = e.target.value
}, false)
export const threshBaseVal = document.getElementById('threshBaseVal')
threshBaseVal.innerText = 100

export const threshDynVal = document.getElementById('threshDynVal')
export const threshDyn = document.getElementById('threshDyn')
threshDyn.addEventListener('change', (e)=>{
    channel.postMessage({ threshDyn: e.target.checked })
    if (e.target.checked === true)
        threshDynVal.innerText = 'ON'
    else
        threshDynVal.innerText = 'OFF'
}, false)

// export const threshDynMin = document.getElementById('threshDynMin')
// threshDynMin.addEventListener('input', (e)=>{
//     channel.postMessage({ threshDynMin: e.target.value })
//     threshDynMinVal.innerText = e.target.value
// }, false)
// export const threshDynMinVal = document.getElementById('threshDynMinVal')
// threshDynMinVal.innerText = 50

// export const threshDinMax = document.getElementById('threshDynMax')
// threshDinMax.addEventListener('input', (e)=>{
//     channel.postMessage({ threshDynMax: e.target.value })
//     threshDinMaxVal.innerText = e.target.value
// }, false)
// export const threshDinMaxVal = document.getElementById('threshDynMaxVal')
// threshDinMaxVal.innerText = 190

export default null