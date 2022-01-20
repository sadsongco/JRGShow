import getPixelValues from "../util/getPixelValues.js";
import { importModules } from "../common/importModules.js";
import alphaBlend from "../common/blendModes/alphaBlend.js";

let visualiserModules, loadComplete;
importModules().then((res) => {
  visualiserModules = res;
  loadComplete = true;
});

onmessage = (e) => {
  postMessage({ result: processPixels(e.data), index: e.data.index, timestamp: e.data.timestamp });
};

const processPixels = (context) => {
  if (loadComplete) {
    for (let vy = 0; vy < context.videoFrame.height; vy++) {
      for (let vx = 0; vx < context.videoFrame.width; vx++) {
        const pixIdx = (vy * context.videoFrame.width + vx) * 4;

        // set background
        // prev frame pixel vals - no opacity needed
        let pPixVals = getPixelValues(pixIdx, context.prevCnvFrame.data);
        // background pixel vals
        let { bg_opacity = 1, bg_col = [0, 0, 0] } = context.outputSettings;
        let bgPixVals = {
          r: bg_col[0],
          g: bg_col[1],
          b: bg_col[2],
          a: bg_opacity,
        };
        // alpha blend previous frame and background
        let oPixVals = alphaBlend(pPixVals, bgPixVals);
        context.prevCnvFrame.data[pixIdx + 0] = oPixVals.r;
        context.prevCnvFrame.data[pixIdx + 1] = oPixVals.g;
        context.prevCnvFrame.data[pixIdx + 2] = oPixVals.b;
        context.prevCnvFrame.data[pixIdx + 3] = oPixVals.a;

        // calculate visualiser pixel vals
        // get unprocessed video input pixel values
        const vidPixVals = getPixelValues(pixIdx, context.videoFrame.data);
        // video always returns 0 opacity, fix
        vidPixVals.a = 1;

        // process pixels with visualisers
        let kwargs = {};
        if (context.visChain.length === 0) return context.prevCnvFrame;
        for (const module of context.visChain) {
          // include module parameters in arguments
          kwargs = context.visParams[module.name];
          // include common parameters in arguments
          kwargs.vx = vx;
          kwargs.vy = vy;
          // kwargs.rand = context.videoFrame.rand[randIdx];
          //             kwargs.audioInfo = context.videoFrame.audioEngine;
          // console.log(module.name);
          visualiserModules[module.name].processPixels(pixIdx, vidPixVals, kwargs, context);
        }
      }
    }
  }
  return context.prevCnvFrame;
};
