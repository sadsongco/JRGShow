import { Visualiser } from '../../../_prototype/modules/visualisers/Visualiser.js';
import alphaBlend from '../../util/alphaBlend.js';

export const vignette = class extends Visualiser {
  setVignetteMask = function (vignetteMask) {
    this.vignetteMask = vignetteMask;
  };

  processPixels = function (pixIdx, pixVals, kwargs = {}, context) {
    const { lyrOpacity = 1 } = kwargs;
    const { vigCol = [0, 0, 0] } = kwargs;
    const cnvCol = [context.cnvPixels.data[pixIdx + 0], context.cnvPixels.data[pixIdx + 1], context.cnvPixels.data[pixIdx + 2]];
    const [oR, oG, oB] = alphaBlend([...vigCol, 1], [...cnvCol, this.vignetteMask[pixIdx / 4] / 255]);
    if (kwargs.vy < context.drawStart || kwargs.vy > context.drawStart + context.drawHeight) return;
    context.cnvPixels.data[pixIdx + 0] = oR * lyrOpacity + context.cnvPixels.data[pixIdx + 0] * (1 - lyrOpacity);
    context.cnvPixels.data[pixIdx + 1] = oG * lyrOpacity + context.cnvPixels.data[pixIdx + 1] * (1 - lyrOpacity);
    context.cnvPixels.data[pixIdx + 2] = oB * lyrOpacity + context.cnvPixels.data[pixIdx + 2] * (1 - lyrOpacity);
  };

  params = [
    {
      name: 'vigCol',
      displayName: 'Vignette Colour',
      type: 'colour',
      value: '#000000',
    },
    {
      name: 'lyrOpacity',
      displayName: 'Layer Opacity',
      type: 'val',
      range: [0, 1],
      step: 0.05,
      value: 1,
    },
  ];
};
