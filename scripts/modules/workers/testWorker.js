import getPixelValues from '../util/getPixelValues.js';
import { importModules } from '../common/importModules.js';

// /**
//  * Retrieve red, green and blue values for current pixel
//  * @param {integer} pixIdx - index of current pixel in pixel array
//  * @param {array} pixArr - array of pixel values
//  * @returns {array} - [integer, integer, integer] values for red, green and blue for current pixel
//  */
//  const getPixelValues = function(pixIdx, pixArr) {
//     const iR = pixArr[pixIdx + 0]
//     const iG = pixArr[pixIdx + 1]
//     const iB = pixArr[pixIdx + 2]
//     return [iR, iG, iB]
// }

const visualiserModules = await importModules();


onmessage = (e) => {
    processPixels(e.data);
}

const processPixels = async (context) => {
    // console.log(context.vidPixels)
    // if (!context.vidPixels) throw new Error(context);
    for (let vy = 0; vy < context.vidPixels.height; vy++) {
        for (let vx = 0; vx < context.vidPixels.width; vx++) {
            const pixIdx = ((vy * context.vidPixels.width) + vx) * 4;
            let randIdx = pixIdx % context.rand.length;
            let pixVals = getPixelValues(pixIdx, context.vidPixels.data);
            // context.cnvPixels.data[pixIdx + 0] = pixVals[0];
            // context.cnvPixels.data[pixIdx + 1] = pixVals[1];
            // context.cnvPixels.data[pixIdx + 2] = pixVals[2];
            context.cnvPixels.data[pixIdx + 3] = 255;
            for (const module of context.currentVisChain) {
                // include module parameters in arguments
                const kwargs = context.visParams[module.name];
                // include common parameters in arguments
                kwargs.vx = vx;
                kwargs.vy = vy;
                kwargs.rand = context.rand[randIdx];
    //             kwargs.audioInfo = context.audioEngine;
                visualiserModules[module.name].processPixels(pixIdx, pixVals, kwargs, context.cnvPixels);
            }
        }
    }
    postMessage(context.cnvPixels);
}