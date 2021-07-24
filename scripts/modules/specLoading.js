const specLoading = function(pixIdx, iR, iG, iB, idxCoff, thresh, pixels) {
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