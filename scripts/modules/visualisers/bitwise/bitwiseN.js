export const processPixels = function(pixIdx, pixVals, kwargs={}) {
    const { threshold = 100 } = kwargs;
    const { bw = false } = kwargs;
    const { invert = false } = kwargs;
    let [iR, iG, iB] = pixVals;
    const grayscale = (iR * 0.3) + (iG * 0.59) + (iB * 0.11)
    if (bw)
        iR = iG = iB = grayscale;
    
    if ((invert && grayscale < threshold) || (!invert && grayscale > threshold)) {
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

export const params = [
    {
        name: "threshold",
        type: "val",
        range: [
            0, 255
        ],
        value: 100
    },
    {
        name: "bw",
        type: "toggle",
        value: false
    },
    {
        name: "invert",
        type: "toggle",
        value: false
    }
];