import { Visualiser } from '../Visualiser.js';
import { greyscaleCalc } from '../../util/utils.js';
import alphaBlend from '/scripts/modules/util/alphaBlend.js';

export const bitwiseBrighten = class extends Visualiser {
  processPixels = function (pixIdx, pixVals, kwargs, context) {
    const { lyrOpacity = 1 } = kwargs;
    const { procSource = 'Video In' } = kwargs;
    const { brighten = 0 } = kwargs;
    const { bw = false } = kwargs;
    const cnvCol = [context.cnvPixels.data[pixIdx + 0], context.cnvPixels.data[pixIdx + 1], context.cnvPixels.data[pixIdx + 2]];
    let iR, iG, iB;
    if (procSource === 'Video In') [iR, iG, iB] = pixVals;
    else {
      iR = context.cnvPixels.data[pixIdx + 0];
      iG = context.cnvPixels.data[pixIdx + 1];
      iB = context.cnvPixels.data[pixIdx + 2];
    }
    if (bw) {
      iR = iG = iB = greyscaleCalc(pixVals);
    }
    const [oR, oG, oB] = alphaBlend([...cnvCol, 255], [iR << brighten, iG << brighten, iB << brighten, lyrOpacity]);

    context.cnvPixels.data[pixIdx + 0] = oR;
    context.cnvPixels.data[pixIdx + 1] = oG;
    context.cnvPixels.data[pixIdx + 2] = oB;
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
      name: 'lyrOpacity',
      displayName: 'Layer Opacity',
      type: 'val',
      range: [0, 1],
      step: 0.1,
      value: 1,
    },
    {
      name: 'brighten',
      displayName: 'Brighten',
      type: 'val',
      range: [0, 8],
      value: 0,
    },
  ];
};

// const bitwiseBrighten = function (pixIdx, iR, iG, iB, brighten = 1, bw = false, pixels) {
//   if (bw) iR = iG = iB = 0.28125 * iR + 0.578125 * iG + 0.109375 * iB;
//   pixels[pixIdx + 0] = iR << brighten;
//   pixels[pixIdx + 1] = iG << brighten;
//   pixels[pixIdx + 2] = iB << brighten;
//   pixels[pixIdx + 3] = 255;

//   return [pixels[pixIdx + 0], pixels[pixIdx + 1], pixels[pixIdx + 2]];
// };
// export default bitwiseBrighten;
