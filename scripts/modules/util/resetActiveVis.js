const resetActiveVis = function(activeVis) {
    for (let vis in activeVis)
        activeVis[vis] = false
    console.log(activeVis)
}

export default resetActiveVis