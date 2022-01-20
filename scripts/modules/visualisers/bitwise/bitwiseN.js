import { Visualiser } from "../Visualiser.js";
import { greyscaleCalc } from "../../util/utils.js";
import getPixelValues from "../../util/getPixelValues.js";
import alphaBlend from "../../common/blendModes/alphaBlend.js";

export const bitwiseN = class extends Visualiser {
  processPixels = (pixIdx, pixVals, kwargs = {}, context) => {
    // console.log(kwargs);
    // setup visualiser parameters with default values
    let { threshold = 100 } = kwargs;
    const { dynThresh = false } = kwargs;
    const { dynThreshMin = 0, dynThreshMax = 255 } = kwargs;
    const { dynThreshSpeed = 0 } = kwargs;
    const { bw = false } = kwargs;
    const { invert = false } = kwargs;
    const { negOpacity = 1 } = kwargs;
    const { lyrOpacity = 1 } = kwargs;
    const { audioInfo } = kwargs;
    const { dyn = 0 } = kwargs;
    let { rand = 0 } = kwargs;
    let { noise = 0 } = kwargs;
    let { r, g, b, a } = pixVals;
    let bgPixVals = getPixelValues(pixIdx, context.prevCnvFrame.data);
    // process pixel
    let visPixVals;
    const grayscale = greyscaleCalc(pixVals);
    let oR = r - r * rand * noise;
    let oG = g - g * rand * noise;
    let oB = b - b * rand * noise;
    let oA = lyrOpacity;
    if (bw) oR = oG = oB = grayscale;
    if (dynThresh) {
      threshold = Math.abs(
        dynThreshMin + (dynThreshMax - dynThreshMin) * dyn[dynThreshSpeed]
      );
    }
    if (
      (invert && grayscale < threshold) ||
      (!invert && grayscale > threshold)
    ) {
      visPixVals = { r: oR, g: oG, b: oB, a: oA };
    } else {
      visPixVals = { r: 0, g: 0, b: 0, a: negOpacity };
    }
    const oPixVals = alphaBlend(bgPixVals, visPixVals);
    context.prevCnvFrame.data[pixIdx + 0] = oPixVals.r;
    context.prevCnvFrame.data[pixIdx + 1] = oPixVals.g;
    context.prevCnvFrame.data[pixIdx + 2] = oPixVals.b;
    context.prevCnvFrame.data[pixIdx + 3] = oPixVals.a;
  };
  params = [
    {
      name: "threshold",
      displayName: "Effect Threshold",
      type: "val",
      range: [0, 255],
      value: 100,
    },
    {
      name: "dynThresh",
      displayName: "Dynamic Threshold",
      type: "toggle",
      value: false,
    },
    {
      name: "dynThreshMin",
      displayName: "Dynamic Threshold Minimum",
      type: "val",
      range: [0, 255],
      value: 0,
    },
    {
      name: "dynThreshMax",
      displayName: "Dynamic Threshold Maximum",
      type: "val",
      range: [0, 255],
      value: 255,
    },
    {
      name: "dynThreshSpeed",
      displayName: "Dynamic Threshold Speed",
      type: "val",
      range: [0, 7],
      value: 0,
    },
    {
      name: "bw",
      displayName: "Black and White",
      type: "toggle",
      value: false,
    },
    {
      name: "invert",
      displayName: "Invert",
      type: "toggle",
      value: false,
    },
    {
      name: "negOpacity",
      displayName: "Negative Space Opacity",
      type: "val",
      range: [0, 1],
      step: 0.1,
      value: 1,
    },
    {
      name: "lyrOpacity",
      displayName: "Layer Opacity",
      type: "val",
      range: [0, 1],
      step: 0.1,
      value: 1,
    },
    {
      name: "noise",
      displayName: "Noise",
      type: "val",
      range: [0, 1],
      step: 0.01,
      value: 0,
    },
  ];
};
