const bitwise1 = function(pixIdx, iR, iG, iB, threshold, pixels) {
    const ander = 0b00110001
    
    if (iR > threshold * 1.6 && iR > iG && iR > iB) {
        (pixels[pixIdx + 0] = iR << 2)
        pixels[pixIdx + 3] = 255
    }
    if (iG > threshold * 1.1 && iG*1.1 > iR && iG*1.1 > iB) {
        (pixels[pixIdx + 1] = iG << 3)
        pixels[pixIdx + 3] = 255
    }
    if (iB > threshold && iB > iR && iB > iG) {
        (pixels[pixIdx + 2] = iB << 4)
        pixels[pixIdx + 3] = 255
    }
}

export default bitwise1

export const processPixels = function(pixIdx, pixVals, kwargs={}) {
    const { threshold = 10 } = kwargs;
    const { ander =  0b00110001} = kwargs;
    const [iR, iG, iB] = pixVals;

    if (iR > threshold * 1.6 && iR > iG && iR > iB) {
        (pixels[pixIdx + 0] = (iR << 2) & ander)
        pixels[pixIdx + 3] = 255
    }
    if (iG > threshold * 1.1 && iG*1.1 > iR && iG*1.1 > iB) {
        (pixels[pixIdx + 1] = (iG << 3))
        pixels[pixIdx + 3] = 255
    }
    if (iB > threshold && iB > iR && iB > iG) {
        (pixels[pixIdx + 2] = iB << 4)
        pixels[pixIdx + 3] = 255
    }
}

/**
 * An array of parameters for this visualiser
 */
export const params = [
    {
        name: 'threshold',
        type: 'val',
        range: [
            0, 255
        ],
        value: 100
    }
]