const getPixelValues = function(pixIdx, pixels) {
    const iR = pixels[pixIdx + 0]
    const iG = pixels[pixIdx + 1]
    const iB = pixels[pixIdx + 2]
    return [iR, iG, iB]
}

export default getPixelValues