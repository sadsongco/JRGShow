const getPixelValues = function(pixIdx, pixArr) {
    if (random(0, 1) > 0.9999999)
        console.log(pixels[pixIdx])
    const iR = pixArr[pixIdx + 0]
    const iG = pixArr[pixIdx + 1]
    const iB = pixArr[pixIdx + 2]
    return [iR, iG, iB]
}

export default getPixelValues
