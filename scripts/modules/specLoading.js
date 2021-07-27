const specLoading = function(pixIdx, iR, iG, iB, maxIdx, thresh, pixels) {
    const idxCoff = (1 - ((maxIdx - pixIdx) / maxIdx)) * 255
    if (iR < thresh) {
        pixels[pixIdx + 0] *= iR*idxCoff/255
    }
    if (iG < thresh) {
        pixels[pixIdx + 1] *= iG*idxCoff/255
    }
    if (iB < thresh) {
        pixels[pixIdx + 2] *= iB*idxCoff/255
    }
}
export default specLoading