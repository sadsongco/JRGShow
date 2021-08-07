const bitwiseBrighten = function(pixIdx, iR, iG, iB, brighten=1, pixels) {
    pixels[pixIdx + 0] = iR << brighten
    pixels[pixIdx + 1] = iG << brighten
    pixels[pixIdx + 2] = iB << brighten

    return [pixels[pixIdx + 0], pixels[pixIdx + 1], pixels[pixIdx + 2]]
}
export default bitwiseBrighten