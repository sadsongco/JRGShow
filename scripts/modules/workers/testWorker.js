import getPixelValues from '../util/getPixelValues.js';
// import { importModules } from '../common/importModules.js';

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

// const visualiserModules = await importModules();


onmessage = (e) => {
  // console.log(e.data.prevCnvFrame)
    postMessage({ result: processPixels(e.data), index: e.data.index })
}

// const processPixels = async (context.videoFrame) => {
//     // console.log(context.videoFrame.vidFrame)
//     // if (!context.videoFrame.vidFrame) throw new Error(context.videoFrame);
//     for (let vy = 0; vy < context.videoFrame.vidFrame.height; vy++) {
//         for (let vx = 0; vx < context.videoFrame.vidFrame.width; vx++) {
//             const pixIdx = ((vy * context.videoFrame.vidFrame.width) + vx) * 4;
//             let randIdx = pixIdx % context.videoFrame.rand.length;
//             let pixVals = getPixelValues(pixIdx, context.videoFrame.vidFrame.data);
//             // context.videoFrame.cnvFrame.data[pixIdx + 0] = pixVals[0];
//             // context.videoFrame.cnvFrame.data[pixIdx + 1] = pixVals[1];
//             // context.videoFrame.cnvFrame.data[pixIdx + 2] = pixVals[2];
//             context.videoFrame.cnvFrame.data[pixIdx + 3] = 255;
//             for (const module of context.videoFrame.currentVisChain) {
//                 // include module parameters in arguments
//                 const kwargs = context.videoFrame.visParams[module.name];
//                 // include common parameters in arguments
//                 kwargs.vx = vx;
//                 kwargs.vy = vy;
//                 kwargs.rand = context.videoFrame.rand[randIdx];
//     //             kwargs.audioInfo = context.videoFrame.audioEngine;
//                 visualiserModules[module.name].processPixels(pixIdx, pixVals, kwargs, context.videoFrame);
//             }
//         }
//     }
//     postMessage(context.videoFrame.cnvFrame);
// }

let sqPos = {x: 20, y: 30};
let move = {x: 1, y: -1};

const processPixels = (context) => {
  // console.log(context.videoFrame.vidFrame.data);
    for (let vy = 0; vy < context.videoFrame.height; vy++) {
        for (let vx = 0; vx < context.videoFrame.width; vx++) {
          const lyrOpacity = 1;
          const pixIdx = ((vy * context.videoFrame.width) + vx) * 4;
          const videoPixVals = getPixelValues(pixIdx, context.videoFrame.data)
          let [ iR, iG, iB, iO ] = videoPixVals;
          // clear background according to output
          let oR, oG, oB, oO;
          const bgPixVals = getPixelValues(pixIdx, context.prevCnvFrame.data);
          let [ obR, obG, obB, obO ] = getBackgroundValues(bgPixVals, context.outputSettings);

          if ((vx > sqPos.x && vx < sqPos.x+20) && (vy > sqPos.y && vy < sqPos.y + 20)) {
            oR = iR;
            oG = iG;
            oB = iB;
            oO = iO;
            context.prevCnvFrame.data[pixIdx + 0] = (oR * (oO / 255)) + (obR * obO / 255 );
            context.prevCnvFrame.data[pixIdx + 1] = (oG * (oO / 255)) + (obG * obO / 255 );
            context.prevCnvFrame.data[pixIdx + 2] = (oB * (oB / 255)) + (obB * obO / 255 );
            context.prevCnvFrame.data[pixIdx + 3] = 255;
          } 
          // else {
          //   oR = iR;
          //   oG = iG;
          //   oB = oB;
          //   oO = 0;
          // }

        }
      }
      sqPos.x += move.x; sqPos.y += move.y;
      if (sqPos.x > context.videoFrame.width - 20 || sqPos.x < 20) move.x *= -1;
      if (sqPos.y > context.videoFrame.height - 20 || sqPos.y < 20) move.y *= -1;
    return context.prevCnvFrame;
    // postMessage(context.videoFrame.cnvFrame);
}

const getBackgroundValues = (bgPixVals, outputSettings) => {
  // let { bg_opacity = 255, bg_col = [0, 0, 0] } = outputSettings;
  let bg_opacity = 50, bg_col = [255, 100, 0];
  // bg_opacity = bg_opacity / 255;
  let [ obR, obG, obB ] = bgPixVals;
  // console.log(1-bg_opacity);
  // let obR = ((bR * (1 - (bg_opacity))) + (bg_col[0] * bg_opacity)) >> 0;
  // let obG = ((bG * (1 - (bg_opacity))) + (bg_col[1] * bg_opacity)) >> 0;
  // let obB = ((bB * (1 - (bg_opacity))) + (bg_col[2] * bg_opacity)) >> 0;
  // obR = 255, obG = 100, obB = 0;
  return [...bg_col, bg_opacity];
}