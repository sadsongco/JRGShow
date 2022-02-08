const scriptTextFull = function() {
    // parameters to be set in init
    let scriptLines
    let marginL
    let marginT
    let colWidth
    let lineHeight
    // object tracking parameters
    let currScriptLine = 0
    let currScriptCol = 0
    let stillTexting = true

    this.init = function(scriptText, left=30, top=410, width=16, squidge=7) {
        scriptLines = scriptText.length
        marginL = left
        marginT = top
        colWidth = width
        lineHeight = squidge
        }

    this.draw = function(scriptText, scriptSize=25) {
        if (!stillTexting)
            return
        push()
            fill('#CCCCCC')
            textSize(scriptSize)
            text(
                scriptText[currScriptLine][currScriptCol],
                marginL + (currScriptCol * colWidth),
                marginT + (currScriptLine * lineHeight)
                )
        pop()
        currScriptCol++
        if (currScriptCol >= scriptText[currScriptLine].length) {
            currScriptCol = 0
            currScriptLine++
        }
        if (currScriptLine >= scriptLines)
            stillTexting = false
    }
}

export default scriptTextFull