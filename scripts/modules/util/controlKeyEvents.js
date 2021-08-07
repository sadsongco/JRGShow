const channel = new BroadcastChannel('vis-comms')

const keyEvent = function(e, currVisState, currSetState, currSetId) {
    if (e.key == 'f') channel.postMessage('fullscreen')
    if (e.key == 'Enter') {
        e.preventDefault()
        switch(currSetState) {
            case 0:
                channel.postMessage({ setItemFadeIn: currSetId })
                currSetState ++
                break
            case 1:
                channel.postMessage({ setItemFadeOut: currSetId })
                currSetState = 0
                break
        }
    }
    if (e.key == 'ArrowRight') {
        e.preventDefault()
        switch(currVisState) {
            case 0:
                channel.postMessage({ visFadeIn: currSetId })
                currVisState ++
                break
            case 1:
                channel.postMessage({ visFadeOut: currSetId })
                currVisState = 0
                break
        }
    }
    return [currSetState, currVisState]
}

export default keyEvent