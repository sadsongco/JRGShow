import resetActiveVis from './resetActiveVis.js'

const prepareVis = function(setItem, activeVis, scriptVis, scriptText, visVars) {
    // clear the canvas
    background(0)
    switch(parseInt(setItem)) {
        case 0:
            resetActiveVis(activeVis)
            activeVis.showAscii = true
            console.log(activeVis)
            break
        case 1:
            resetActiveVis(activeVis)
            activeVis['showVidThru'] = true
            break
        case 2:
            resetActiveVis(activeVis)
            activeVis['showLoRes'] = true
            activeVis['showCircles'] = true
            break
        case 3:
            resetActiveVis(activeVis)
            visVars.scriptTextRun = false
            visVars.bgOpacity = 2
            activeVis['showHalfScript'] = true
            scriptVis.init(scriptText, 80, 560, 28, 22)
            break
        default:
            resetActiveVis(activeVis)
            break
    }

}

export default prepareVis