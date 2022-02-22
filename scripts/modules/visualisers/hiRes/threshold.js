import { Visualiser } from '../Visualiser.js';
import { greyscaleCalc } from '../../util/utils.js';

export const threshold = class extends Visualiser {
  processPixels = function (pixIdx, pixVals, kwargs = {}, context) {
    // setup visualiser parameters with default values
    let { threshold = 100 } = kwargs;
    const { dynThresh = false } = kwargs;
    const { dynThreshMin = 0, dynThreshMax = 255 } = kwargs;
    const { dynThreshSpeed = 0 } = kwargs;
    const { bw = false } = kwargs;
    const { invert = false } = kwargs;
    const { negOpacity = 1 } = kwargs;
    const { lyrOpacity = 1 } = kwargs;
    const { audioMod = false } = kwargs;
    const { audioSens = 0 } = kwargs;
    const { audioModSource = 'vol' } = kwargs;
    const { audioInfo = { vol: 255 } } = kwargs;
    const { dyn = 0 } = kwargs;
    let { rand = 0 } = kwargs;
    const { procSource = 'Video In' } = kwargs;
    let iR, iG, iB;
    if (procSource === 'Video In') [iR, iG, iB] = pixVals;
    else {
      iR = context.cnvPixels.data[pixIdx + 0];
      iG = context.cnvPixels.data[pixIdx + 1];
      iB = context.cnvPixels.data[pixIdx + 2];
    }
    // process pixel
    const grayscale = greyscaleCalc([iR, iG, iB]);
    let oR = iR;
    let oG = iG;
    let oB = iB;
    if (bw) oR = oG = oB = grayscale;
    if (dynThresh) {
      threshold = Math.abs(dynThreshMin + (dynThreshMax - dynThreshMin) * dyn[dynThreshSpeed]);
    }
    if (audioMod) {
      threshold = Math.min(threshold + audioSens * (audioInfo[audioModSource] / 255), 255);
    }
    if ((invert && grayscale < threshold) || (!invert && grayscale > threshold)) {
      context.cnvPixels.data[pixIdx + 0] = oR * lyrOpacity + context.cnvPixels.data[pixIdx + 0] * (1 - lyrOpacity);
      context.cnvPixels.data[pixIdx + 1] = oG * lyrOpacity + context.cnvPixels.data[pixIdx + 1] * (1 - lyrOpacity);
      context.cnvPixels.data[pixIdx + 2] = oB * lyrOpacity + context.cnvPixels.data[pixIdx + 2] * (1 - lyrOpacity);
    } else {
      context.cnvPixels.data[pixIdx + 0] = 0 + context.cnvPixels.data[pixIdx + 0] * (1 - negOpacity);
      context.cnvPixels.data[pixIdx + 1] = 0 + context.cnvPixels.data[pixIdx + 1] * (1 - negOpacity);
      context.cnvPixels.data[pixIdx + 2] = 0 + context.cnvPixels.data[pixIdx + 2] * (1 - negOpacity);
    }
  };
  params = [
    {
      name: 'procSource',
      displayName: 'Processing Source',
      type: 'select',
      options: ['Video In', 'Prev Module'],
      value: 'Video In',
      tooltip: 'Using the Prev Module as the source allows you to threshold what is already showing. Using Video In as the source overlays thresholded video onto what is already showing',
    },
    {
      name: 'threshold',
      displayName: 'Effect Threshold',
      type: 'val',
      range: [0, 255],
      value: 100,
    },
    {
      name: 'audioMod',
      displayName: 'Audio Modulation',
      type: 'toggle',
      value: false,
    },
    {
      name: 'audioModSource',
      displayName: 'Audio Modulation Source',
      type: 'select',
      options: ['bass', 'loMid', 'hiMid', 'treble', 'vol'],
      value: 'vol',
    },
    {
      name: 'audioSens',
      displayName: 'Audio Modulation Sensitivity',
      type: 'val',
      range: [0, 255],
      value: 0,
    },
    {
      name: 'dynThresh',
      displayName: 'Dynamic Threshold',
      type: 'toggle',
      value: false,
    },
    {
      name: 'dynThreshMin',
      displayName: 'Dynamic Threshold Minimum',
      type: 'val',
      range: [0, 255],
      value: 0,
    },
    {
      name: 'dynThreshMax',
      displayName: 'Dynamic Threshold Maximum',
      type: 'val',
      range: [0, 255],
      value: 255,
    },
    {
      name: 'dynThreshSpeed',
      displayName: 'Dynamic Threshold Speed',
      type: 'val',
      range: [0, 8],
      value: 0,
    },
    {
      name: 'bw',
      displayName: 'Black and White',
      type: 'toggle',
      value: false,
    },
    {
      name: 'invert',
      displayName: 'Invert',
      type: 'toggle',
      value: false,
    },
    {
      name: 'negOpacity',
      displayName: 'Negative Space Opacity',
      type: 'val',
      range: [0, 1],
      step: 0.1,
      value: 1,
      tooltip: 'Any pixels below the threshold level (or above, when invert is selected) will allow the background to show through when this is set to 0, black when set to 1',
    },
    {
      name: 'lyrOpacity',
      displayName: 'Layer Opacity',
      type: 'val',
      range: [0, 1],
      step: 0.1,
      value: 1,
      tooltip: 'Opacity of the visualiser layer',
    },
  ];
};
