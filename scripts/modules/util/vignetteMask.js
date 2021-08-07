const vignetteMask = function(width, height) {
    const vigMask = []
    for (let y = 0; y < height; y ++) {
        for (let x = 0; x < width; x ++) {
            const vigXIntensity = sin(map(x, 0, width, 0, PI))
            const vigYIntensity = sin(map(y, 0, height, 0, PI))
            vigMask.push(vigXIntensity * vigYIntensity)
        }
    }
    return vigMask
}
export default vignetteMask