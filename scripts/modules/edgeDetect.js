const edgeDetect = function(vx, vy, pixIdx, vidPixels, pixels) {
    // const dim = 3
    // const centre = Math.floor(dim/2)
    const convMatrix = [
        -1, -1, -1,
        -1,  8, -1,
        -1, -1, -1
    ]

    const pixLeft =     ((vy * width) + vx - 1) * 4
    const pixRight =    ((vy * width) + vx + 1) * 4
    const pixUp =       (((vy - 1) * width) + vx) * 4
    const pixDown =     (((vy + 1) * width) + vx) * 4
    const pixUpLeft =   (((vy - 1) * width) + vx - 1) * 4
    const pixUpRight =  (((vy - 1) * width) + vx + 1) * 4
    const pixDownLeft = (((vy - 1) * width) + vx - 1) * 4
    const pixDownRight =(((vy - 1) * width) + vx + 1) * 4

    pixels[pixIdx + 0] = 
        (vidPixels[pixUpLeft + 0] * convMatrix[0]) + (vidPixels[pixUp + 0] * convMatrix[1]) +(vidPixels[pixUpRight + 0] * convMatrix[2]) +
        (vidPixels[pixLeft + 0] * convMatrix[3]) + (vidPixels[pixIdx + 0] * convMatrix[4]) + (vidPixels[pixRight + 0] * convMatrix[5]) +
        (vidPixels[pixDownLeft + 0] * convMatrix[6]) + (vidPixels[pixDown + 0] * convMatrix[7]) +(vidPixels[pixDownRight + 0] * convMatrix[8])

    pixels[pixIdx + 1] = 
        (vidPixels[pixUpLeft + 1] * convMatrix[0]) + (vidPixels[pixUp + 1] * convMatrix[1]) +(vidPixels[pixUpRight + 1] * convMatrix[2]) +
        (vidPixels[pixLeft + 1] * convMatrix[3]) + (vidPixels[pixIdx + 1] * convMatrix[4]) + (vidPixels[pixRight + 1] * convMatrix[5]) +
        (vidPixels[pixDownLeft + 1] * convMatrix[6]) + (vidPixels[pixDown + 1] * convMatrix[7]) +(vidPixels[pixDownRight + 1] * convMatrix[8])

    pixels[pixIdx + 2] = 
        (vidPixels[pixUpLeft + 2] * convMatrix[0]) + (vidPixels[pixUp + 2] * convMatrix[1]) +(vidPixels[pixUpRight + 2] * convMatrix[2]) +
        (vidPixels[pixLeft + 2] * convMatrix[3]) + (vidPixels[pixIdx + 2] * convMatrix[4]) + (vidPixels[pixRight + 2] * convMatrix[5]) +
        (vidPixels[pixDownLeft + 2] * convMatrix[6]) + (vidPixels[pixDown + 2] * convMatrix[7]) +(vidPixels[pixDownRight + 2] * convMatrix[8])

}

export default edgeDetect;