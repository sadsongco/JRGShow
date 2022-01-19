/**
 * Retrieve red, green and blue values for current pixel
 * @param {integer} pixIdx - index of current pixel in pixel array
 * @param {array} pixArr - array of pixel values
 * @returns {array} - [integer, integer, integer] values for red, green and blue for current pixel
 */
const getPixelValues = function(pixIdx, pixArr) {
    const iR = pixArr[pixIdx + 0]
    const iG = pixArr[pixIdx + 1]
    const iB = pixArr[pixIdx + 2]
    const iO = pixArr[pixIdx + 3]
    return [iR, iG, iB, iO]
}

export default getPixelValues
