const prepareVis = function(setItem, activeVis, scriptVis, scriptText, visVars, asciiVis) {
    // clear the canvas
    // console.log(setItem.id)
    switch(parseInt(setItem.id)) {
        case 0:
            // Intro
            break

        case 1:
            // House Of Woodcock
            visVars.bgOpacity = 180
            visVars.bw = true
            activeVis.showPixThru = true
            activeVis.showVignette = true
            break

        case 2:
            // Alma
            visVars.bgOpacity = 7
            activeVis.showScore = true
            break

        case 3:   
            // Three Minatures From Water         
            visVars.bgOpacity = 5
            activeVis.showLoRes = true
            activeVis.showCircles = true
            activeVis.showVignette = true
            break

        case 4:
            // Prospectors Arrive
            visVars.bgOpacity = 200
            activeVis.showThreshold = true
            break

        case 5:
            // Future Markets
            visVars.bgOpacity = 200
            activeVis.showSpec = true
            break
            
        case 6:
            // 88
            visVars.bgOpacity = 255
            visVars.bw = true
            activeVis.showBitwiseBrighten = true
            break
        
        case 7:
            // Sweetness Of Freddie
            visVars.bgOpacity = 20
            activeVis.showVidThruPoster = true
            break

        case 8:
            // Prospectors Quartet
            visVars.run = false
            visVars.bgOpacity = 5
            activeVis.showHalfScript = true
            scriptVis.init(scriptText, 80, 590, 28, 22)
            break
            break
        
        case 9:
            // Detuned Quartet
            activeVis.showDetuned = true
            break;

        case 10:
            // For The Hungry Boy
            visVars.bgOpacity = 255
            activeVis.showPixThru = true
            // activeVis.showVignette = true
            break

        case 11:
            // Sandalwood
            visVars.bgOpacity = 255
            activeVis.showLoRes = true
            activeVis.showBoxes = true
            break

        case 12:
            // Phantom Thread Duet
            activeVis.showEdge = true
            break
        
        case 13:
            // Vocalise
            visVars.bgOpacity = 255
            activeVis.showAscii = true
            break
        

        case 14:
            // Electric Counterpoint I
            visVars.bgOpacity = 30
            activeVis.showLoRes = true
            activeVis.showLines = true
            activeVis.showVignette = true
            break

        case 15:
            // Electric Counterpoint II
            visVars.bgOpacity = 0.5
            activeVis.showPreRandomBoxes = true
            activeVis.showGradReveal = true
            break
        
        case 16:
            // Electric Counterpoint III
            visVars.bgOpacity = 255
            activeVis.showBitwiseBrighten = true
            break
        case 17:
            // outro
            break
        case 18:
            // de-tuned into
            break
        case 19:
            // de-tuned outro

            break
        case 20:
            // Shostakovich
            visVars.bgOpacity = 40
            activeVis.showBitwise1 = true
            activeVis.showVignette = true
            break
        case 21:
            // Berio duet
            break
        default:
            break
    }

}

export default prepareVis