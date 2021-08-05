const specLoading = function(pixIdx, iR, iG, iB, maxIdx, thresh, pixels) {
    const idxCoff = (1 - ((maxIdx - pixIdx) / maxIdx)) * 255
    if (iR > 196)
        pixels[pixIdx + 0] = iR * idxCoff / 255
    if (iG > 220)
        pixels[pixIdx + 1] = iG * idxCoff / 255
    if (iB > 190)
        pixels[pixIdx + 2] = iB * idxCoff / 255
}
export default specLoading