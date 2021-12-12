export const processVis = function(pixIdx, pixVals, kwargs={}) {
    const { param0, param1, param2 } = kwargs;
    const thresh = param0 || 100;
    const [iR, iG, iB] = pixVals;
    const grayscale = (iR * 0.3) + (iG * 0.59) + (iB * 0.11)
        pixels[pixIdx+0] = grayscale;
        pixels[pixIdx+1] = grayscale;
        pixels[pixIdx+2] = grayscale;

    // if (grayscale > thresh) {
    //     pixels[pixIdx+0] = 255;
    //     pixels[pixIdx+1] = 255;
    //     pixels[pixIdx+2] = 255;
    // } else {
    //     pixels[pixIdx+0] = 0;
    //     pixels[pixIdx+1] = 0;
    //     pixels[pixIdx+2] = 0;
    // }
}