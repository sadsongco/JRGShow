const bitwiseBrighten = function(pixIdx, iR, iG, iB, brighten=1, bw=false, pixels) {
    if (bw)
        iR = iG = iB =(0.28125*iR + 0.578125*iG + 0.109375*iB)
    pixels[pixIdx + 0] = iR << brighten
    pixels[pixIdx + 1] = iG << brighten
    pixels[pixIdx + 2] = iB << brighten
    pixels[pixIdx + 3] = 255

    return [pixels[pixIdx + 0], pixels[pixIdx + 1], pixels[pixIdx + 2]]
}
export default bitwiseBrighten