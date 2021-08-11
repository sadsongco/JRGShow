const prepareVis = function(setItem, activeVis, scriptVis, scriptText, visVars, asciiVis) {
    // clear the canvas
    console.log('prepareVis')
    switch(parseInt(setItem)) {
        case 0:
            background(0)
            visVars.bgOpacity = 255
            activeVis.showAscii = true
            break

        case 1:
            visVars.bgOpacity = 255
            activeVis['showVidThru'] = true
            break

        case 2:
            visVars.bgOpacity = 5
            activeVis['showLoRes'] = true
            activeVis['showCircles'] = true
            activeVis['showVignette'] = true
            break

        case 3:
            background(0)
            visVars.scriptTextRun = false
            visVars.bgOpacity = 5
            activeVis['showHalfScript'] = true
            scriptVis.init(scriptText, 80, 590, 28, 22)
            break

        case 4:
            background(0, 0, 0, 0)
            visVars.bgOpacity = 0.5
            activeVis['showRandomPreBoxes'] = true
            activeVis['showGradReveal'] = true
            break

        case 5:
            visVars.bgOpacity = 59
            activeVis.showAscii = true
            asciiVis.setBright(1)
            break
            
        default:
            break
    }

}

export default prepareVis