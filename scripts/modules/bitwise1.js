const bitwise1 = function(pixIdx, iR, iG, iB, thresh, pixels) {
    const ander = 0b00110001
    
    if (iR > thresh * 1.6 && iR > iG && iR > iB) {
        (pixels[pixIdx + 0] = pixels[pixIdx + 0] << 2) & ander
        pixels[pixIdx + 3] = 255
    }
    if (iG > thresh * 1.1 && iG*1.1 > iR && iG*1.1 > iB) {
        (pixels[pixIdx + 1] = pixels[pixIdx + 1] << 3) & ander
        pixels[pixIdx + 3] = 255
    }
    if (iB > thresh && iB > iR && iB > iG) {
        (pixels[pixIdx + 2] = pixels[pixIdx + 2] << 4) & ander
        pixels[pixIdx + 3] = 255
    }
}

export default bitwise1