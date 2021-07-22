function Script() {
    const scriptLines = textExample.length
    console.log('HI')
    let currScriptLine = 0
    let currScriptCol = 0
    const marginL = 10
    const marginT = 410
    const colWidth = 16
    const lineHeight = 7
    let stillTexting = true

    this.draw = function() {
        if (!stillTexting) return
        push()
            fill('#CCCCCC')
            textFont(scriptFont)
            textSize(25)
            text(
                textExample[currScriptLine][currScriptCol],
                marginL + (currScriptCol * colWidth),
                marginT + (currScriptLine * lineHeight)
                )
        pop()
        currScriptCol++
        if (currScriptCol >= textExample[currScriptLine].length) {
            currScriptCol = 0
            currScriptLine++
        }
        if (currScriptLine >= scriptLines) {
            console.log('NO MORE SCRIPT LINES')
            stillTexting = false
        }
    }
}