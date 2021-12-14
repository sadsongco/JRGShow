export const processPixels = function(pixIdx, pixVals, kwargs={}) {
    const { thresh = 125, param1, param2 } = kwargs;
    const [iR, iG, iB] = pixVals;
    const grayscale = (iR * 0.3) + (iG * 0.59) + (iB * 0.11)

    if (grayscale > thresh) {
        pixels[pixIdx+0] = 255;
        pixels[pixIdx+1] = 255;
        pixels[pixIdx+2] = 255;
    } 
    else {
        pixels[pixIdx+0] = 0;
        pixels[pixIdx+1] = 0;
        pixels[pixIdx+2] = 0;
    }
}
