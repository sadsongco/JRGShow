/**
 * 
 * @param {activeVis} activeVis - deactive all visualisers
 */
const resetActiveVis = function(activeVis) {
    for (let vis in activeVis)
        activeVis[vis] = false
}

export default resetActiveVis