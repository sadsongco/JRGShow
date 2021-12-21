const channel = new BroadcastChannel('vis-comms')

// TODO change State variables to boolean - easier to track and understand
/**
 * Process key events, post messages on shared BroadcastChannel to control visualiser output
 * @param {Event} e - triggering event
 * @param {integer} currVisState - whether visualiser is currently visible
 * @param {integer} currSetState - whether a setlist item has been selected
 * @param {integer} currSourceState - whether a source has been selected
 * @param {integer} currFeatState - whether the featuring text is visible
 * @param {integer} currSetId - id of currently selected setlist item
 * @param {boolean} run - is visualiser currently running
 * @returns {array} [integer, integer, integer, integer, boolean] - updated input parameters
 */
const keyEvent = function(e, currVisState, currSetState, currSourceState, currFeatState, currSetId, run) {
    if (e.key == 't') { // toggle title
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
    if (e.key == 's') { // toggle source
        e.preventDefault()
        switch(currSourceState) {
            case 0:
                channel.postMessage({
                    setSourceFadeIn: true,
                    setItem: currSetId
                })
                currSourceState ++
                break
            case 1:
                channel.postMessage({
                    setSourceFadeOut: true,
                    setItem: currSetId
                })
                currSourceState = 0
                break
        }
    }
    if (e.key == 'c') { // toggle source
        e.preventDefault()
        switch(currFeatState) {
            case 0:
                channel.postMessage({
                    setFeatFadeIn: true,
                    setItem: currSetId
                })
                currFeatState ++
                break
                case 1:
                    channel.postMessage({
                        setFeatFadeOut: true,
                        setItem: currSetId
                    })
                    currFeatState = 0
                    break
                }
            }
        if (e.key == 'p' || e.key == 'o' || e.key == 'i' || e.key == 'u') {
            e.preventDefault()
            let scoreTrig = false
            switch(e.key) {
                case 'p':
                    scoreTrig = 'pno'
                    break
                case 'o':
                    scoreTrig = 'vlns'
                    break
                case 'i':
                    scoreTrig = 'cll'
                    break
                case 'u':
                    scoreTrig = 'full'
                    break
                default:
                    return
            }
            channel.postMessage({
                scoreTrig: scoreTrig
            })
        }
        if (e.key == 'y') {
            e.preventDefault()
            channel.postMessage({
                yellowTrig: true
            })
        }
        if (e.key == 'a' && currSetId == 9) {
            e.preventDefault()
            channel.postMessage({
                busyFade: true
            })
        }
        if (e.key == 'ArrowRight') { // toggle vis
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
    if (e.key == 'ArrowLeft') { // start animation running
        e.preventDefault()
        run = !run
        channel.postMessage({
            toggleScriptText: run
        })
    }
    return [currSetState, currSourceState, currFeatState, currVisState, run]
}

export default keyEvent