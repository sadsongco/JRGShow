import { Visualiser } from '../Visualiser.js';

export const bitwise1 = class extends Visualiser {
  processPixels = function (pixIdx, pixVals, kwargs = {}, context) {
    const { threshold = 10 } = kwargs;
    const { lyrOpacity = 1 } = kwargs;
    const { rShift = 0, gShift = 0, bShift = 0 } = kwargs;
    const { ander = 0b00110001 } = kwargs;
    const [iR, iG, iB] = pixVals;
    let [oR, oG, oB] = pixVals;
    if (iR > threshold * 0.3 && iR > iG && iR > iB) {
      oR = (iR << rShift) & ander;
    }
    if (iG > threshold * 0.59 && iG * 1.1 > iR && iG * 1.1 > iB) {
      oG = (iG << gShift) & ander;
    }
    if (iB > threshold * 0.11 && iB > iR && iB > iG) {
      oB = (iB << bShift) & ander;
    }
    context.cnvPixels.data[pixIdx + 0] = oR * lyrOpacity + context.cnvPixels.data[pixIdx + 0] * (1 - lyrOpacity);
    context.cnvPixels.data[pixIdx + 1] = oG * lyrOpacity + context.cnvPixels.data[pixIdx + 1] * (1 - lyrOpacity);
    context.cnvPixels.data[pixIdx + 2] = oB * lyrOpacity + context.cnvPixels.data[pixIdx + 2] * (1 - lyrOpacity);
  };
  params = [
    {
      name: 'threshold',
      displayName: 'Threshold',
      type: 'val',
      range: [0, 255],
      value: 100,
    },
    {
      name: 'ander',
      displayName: 'Ander',
      type: 'val',
      range: [0, 255],
      value: 255,
    },
    {
      name: 'rShift',
      displayName: 'Red Shift',
      type: 'val',
      range: [0, 7],
      value: 0,
    },
    {
      name: 'gShift',
      displayName: 'Green Shift',
      type: 'val',
      range: [0, 7],
      value: 0,
    },
    {
      name: 'bShift',
      displayName: 'Blue Shift',
      type: 'val',
      range: [0, 7],
      value: 0,
    },
    {
      name: 'lyrOpacity',
      displayName: 'Layer Opacity',
      type: 'val',
      range: [0, 1],
      step: 0.1,
      value: 1,
    },
  ];
};
