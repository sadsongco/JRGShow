import { Visualiser } from '../../visualisers/Visualiser.js';
import alphaBlend from '../../util/alphaBlend.js';

export const vignette = class extends Visualiser {
  setVignetteMask = function (vignetteMask) {
    this.vignetteMask = vignetteMask;
  };

  processFramePre = function (vidPix, kwargs = {}, context) {
    const { lyrOpacity = 1 } = kwargs;
    const { vigCol = [0, 0, 0] } = kwargs;
    this.lyrOpacity = lyrOpacity;
    this.vigCol = vigCol;
  };

  processPixels = function (pixIdx, pixVals, kwargs = {}, context) {
    const cnvCol = [context.cnvPixels.data[pixIdx + 0], context.cnvPixels.data[pixIdx + 1], context.cnvPixels.data[pixIdx + 2]];
    const [oR, oG, oB] = alphaBlend([...this.vigCol, 1], [...cnvCol, this.vignetteMask[pixIdx / 4] / 255]);
    if (kwargs.vy < context.drawStart || kwargs.vy > context.drawStart + context.drawHeight) return;
    context.cnvPixels.data[pixIdx + 0] = oR * this.lyrOpacity + context.cnvPixels.data[pixIdx + 0] * (1 - this.lyrOpacity);
    context.cnvPixels.data[pixIdx + 1] = oG * this.lyrOpacity + context.cnvPixels.data[pixIdx + 1] * (1 - this.lyrOpacity);
    context.cnvPixels.data[pixIdx + 2] = oB * this.lyrOpacity + context.cnvPixels.data[pixIdx + 2] * (1 - this.lyrOpacity);
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
