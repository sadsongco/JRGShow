/**
 * Retrieve red, green and blue values for current pixel
 * @param {integer} pixIdx - index of current pixel in pixel array
 * @param {array} pixArr - array of pixel values
 * @returns {array} - [integer, integer, integer] values for red, green and blue for current pixel
 */
const getPixelValues = function(pixIdx, pixArr) {
    if (random(0, 1) > 0.9999999)
        console.log(pixels[pixIdx])
    const iR = pixArr[pixIdx + 0]
    const iG = pixArr[pixIdx + 1]
    const iB = pixArr[pixIdx + 2]
    return [iR, iG, iB]
}

export default getPixelValues
