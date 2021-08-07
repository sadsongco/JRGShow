const vignette = function(pixIdx, vigMask, pixels) {
    pixels[pixIdx + 3] *= vigMask[pixIdx/4]
}   
export default vignette