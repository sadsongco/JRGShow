const bitwise2 = function(pixIdx, iR, iG, iB, thresh, pixels) {
    pixels[pixIdx + 0] = (iR & thresh) << 1
    pixels[pixIdx + 1] = (iG & thresh) << 1
    pixels[pixIdx + 2] = (iB & thresh) << 1
}
export default bitwise2