export const processPixels = function(pixIdx, pixVals, kwargs={}) {
    const { thresh = 125 } = kwargs;
    const [iR, iG, iB] = pixVals;
    const grayscale = (iR * 0.3) + (iG * 0.59) + (iB * 0.11)

    if (grayscale > thresh) {
        pixels[pixIdx+0] = iR;
        pixels[pixIdx+1] = iG;
        pixels[pixIdx+2] = iB;
    } 
    else {
        pixels[pixIdx+3] = 0;
        // pixels[pixIdx+1] = 0;
        // pixels[pixIdx+2] = 0;
    }
}
