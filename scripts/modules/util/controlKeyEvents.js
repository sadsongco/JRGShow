const channel = new BroadcastChannel('vis-comms')

const keyEvent = function(e, currVisState, currSetState, currSetId, scriptTextRun) {
    if (e.key == 'f') channel.postMessage('fullscreen')
    if (e.key == 'Enter') {
        e.preventDefault()
        switch(currSetState) {
            case 0:
                channel.postMessage({
                    setItemFadeIn: true,
                    setItem: currSetId
                })
                currSetState ++
                break
            case 1:
                channel.postMessage({
                    setItemFadeOut: true,
                    setItem: currSetId
                })
                currSetState = 0
                break
        }
    }
    if (e.key == 'ArrowRight') {
        e.preventDefault()
        switch(currVisState) {
            case 0:
                channel.postMessage({
                    visFadeIn: true,
                    setItem: currSetId
                })
                currVisState ++
                break
            case 1:
                channel.postMessage({
                    visFadeOut: true,
                    setItem: currSetId
                })
                currVisState = 0
                break
        }
    }
    if (e.key == 'ArrowLeft') {
        e.preventDefault()
        scriptTextRun = !scriptTextRun
        console.log(scriptTextRun)
        channel.postMessage({
            toggleScriptText: scriptTextRun
        })
    }
    return [currSetState, currVisState, scriptTextRun]
}

export default keyEvent