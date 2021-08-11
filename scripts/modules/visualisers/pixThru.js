const pixThru = function(pixIdx, iR, iG, iB, pixels) {
    pixels[pixIdx + 0] = iR
    pixels[pixIdx + 1] = iG
    pixels[pixIdx + 2] = iB
    pixels[pixIdx + 3] = 255
}
export default pixThru