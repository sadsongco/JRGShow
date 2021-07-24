const pixThru = function(pixIdx, iR, iG, iB, pixels) {
    pixels[pixIdx + 0] = iR
    pixels[pixIdx + 1] = iG
    pixels[pixIdx + 2] = iB
}
export default pixThru