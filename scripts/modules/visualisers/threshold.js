const threshold = function(pixIdx, iR, iG, iB, thresh, pixels) {
    const grayscale = (iR * 0.3) + (iG * 0.59) + (iB * 0.11)
    if (grayscale > thresh) {
        pixels[pixIdx + 0] = iR << 1
        pixels[pixIdx + 1] = iG << 1
        pixels[pixIdx + 2] = iB << 1
        pixels[pixIdx + 3] = 255
    } else {
        pixels[pixIdx + 0] = iR >> 2
        pixels[pixIdx + 1] = iG >> 2
        pixels[pixIdx + 2] = iB >> 2
        pixels[pixIdx + 3] = 255        
    }
    return [pixels[pixIdx + 0], pixels[pixIdx + 1], pixels[pixIdx + 2]]
}

export default threshold