const pixThru = function(pixIdx, iR, iG, iB, bw=false, pixels) {
    if (bw)
        iR = iG = iB =(0.28125*iR + 0.578125*iG + 0.109375*iB)
    pixels[pixIdx + 0] = iR
    pixels[pixIdx + 1] = iG
    pixels[pixIdx + 2] = iB
    pixels[pixIdx + 3] = 255
}
export default pixThru