/**
 * Generates an opacity mask pixel array for use as a vignette
 * @param {integer} width - width of canvas
 * @param {integer} height - height of canvas
 * @returns {array} width x height pixel array with opacity vignette
 */
const vignetteMask = async function(width, height) {
    console.log('Vignette Mask')
    const vigMask = []
    for (let y = 0; y < height; y ++) {
        for (let x = 0; x < width; x ++) {
            const vigXIntensity = (sin(map(x, 0, width, 0, PI)));
            const vigYIntensity = (sin(map(y, 0, height, 0, PI)));
            vigMask.push((vigXIntensity * vigYIntensity * 255) >> 0)
        }
    }
    console.log(vigMask);
    return await Promise.resolve(vigMask);
}
export default vignetteMask