import { Visualiser } from "../Visualiser.js";

export const bitwiseN = class extends Visualiser {
    processPixels = function(pixIdx, pixVals, kwargs={}, context) {
        // setup visualiser parameters with default values
        let { threshold = 100 } = kwargs;
        const { dynThresh = false } = kwargs;
        const { dynThreshMin = 0, dynThreshMax = 255 } = kwargs;
        const { dynThreshSpeed = 0 } = kwargs;
        const { bw = false } = kwargs;
        const { invert = false } = kwargs;
        const { negOpacity = 1 } = kwargs;
        const { lyrOpacity = 1 } = kwargs;
        const { dyn = 0 } = kwargs;
        let { rand = 0 } = kwargs;
        let { noise = 0 } = kwargs;
        let [iR, iG, iB] = pixVals;
        // process pixel
        const grayscale = (iR * 0.3) + (iG * 0.59) + (iB * 0.11)
        let oR = iR - (iR * rand * noise);
        let oG = iG - (iG * rand * noise);
        let oB = iB - (iB * rand * noise); 
        if (bw)
        oR = oG = oB = grayscale;
        if (dynThresh) {
            threshold = Math.abs(dynThreshMin + ((dynThreshMax - dynThreshMin) * dyn[dynThreshSpeed]));
        }
        if ((invert && grayscale < threshold) || (!invert && grayscale > threshold)) {
            context.cnvPixels.data[pixIdx+0] = (oR * lyrOpacity) + (context.cnvPixels.data[pixIdx+0] * (1 - lyrOpacity));
            context.cnvPixels.data[pixIdx+1] = (oG * lyrOpacity) + (context.cnvPixels.data[pixIdx+1] * (1 - lyrOpacity));
            context.cnvPixels.data[pixIdx+2] = (oB * lyrOpacity) + (context.cnvPixels.data[pixIdx+2] * (1 - lyrOpacity));
        } 
        else {
            context.cnvPixels.data[pixIdx+0] = 0 + (context.cnvPixels.data[pixIdx+0] * (1 - negOpacity));;
            context.cnvPixels.data[pixIdx+1] = 0 + (context.cnvPixels.data[pixIdx+1] * (1 - negOpacity));;
            context.cnvPixels.data[pixIdx+2] = 0 + (context.cnvPixels.data[pixIdx+2] * (1 - negOpacity));;
        }
    }
    params = [
        {
            name: "threshold",
            displayName: "Effect Threshold",
            type: "val",
            range: [
                0, 255
            ],
            value: 100
        },
        {
            name: "dynThresh",
            displayName: "Dynamic Threshold",
            type: "toggle",
            value: false
        },
        {
            name: "dynThreshMin",
            displayName: "Dynamic Threshold Minimum",
            type: "val",
            range: [
                0, 255
            ],
            value: 0
        },
        {
            name: "dynThreshMax",
            displayName: "Dynamic Threshold Maximum",
            type: "val",
            range: [
                0, 255
            ],
            value: 255
        },
        {
            name: "dynThreshSpeed",
            displayName: "Dynamic Threshold Speed",
            type: "val",
            range: [
                0, 7
            ],
            value: 0
        },
        {
            name: "bw",
            displayName: "Black and White",
            type: "toggle",
            value: false
        },
        {
            name: "invert",
            displayName: "Invert",
            type: "toggle",
            value: false
        },
        {
            name: "negOpacity",
            displayName: "Negative Space Opacity",
            type: "val",
            range: [
                0, 1
            ],
            step: 0.1,
            value: 1
        },
        {
            name: "lyrOpacity",
            displayName: "Layer Opacity",
            type: "val",
            range: [
                0, 1
            ],
            step: 0.1,
            value: 1
        },
        {
            name: "noise",
            displayName: "Noise",
            type: "val",
            range: [
                0, 1
            ],
            step: 0.01,
            value: 0
        },
    ];
}