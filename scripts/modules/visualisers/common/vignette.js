import { Visualiser } from '../../../_prototype/modules/visualisers/Visualiser.js';

export const vignette = class extends Visualiser {
  setVignetteMask = function (vignetteMask) {
    this.vignetteMask = vignetteMask;
  };

  processPixels = function (pixIdx, pixVals, kwargs = {}, context) {
    const { lyrOpacity = 1 } = kwargs;
    const { vigCol = [0, 0, 0] } = kwargs;
    const [oR, oG, oB] = vigCol;
    if (kwargs.vy < context.drawStart || kwargs.vy > context.drawStart + context.drawHeight) return;
    context.cnvPixels.data[pixIdx + 0] = oR * lyrOpacity * this.vignetteMask[pixIdx / 4] + context.cnvPixels.data[pixIdx + 0] * (1 - lyrOpacity) * this.vignette[pixIdx / 4];
    context.cnvPixels.data[pixIdx + 1] = oG * lyrOpacity * this.vignetteMask[pixIdx / 4] + context.cnvPixels.data[pixIdx + 1] * (1 - lyrOpacity) * this.vignette[pixIdx / 4];
    context.cnvPixels.data[pixIdx + 2] = oB * lyrOpacity * this.vignetteMask[pixIdx / 4] + context.cnvPixels.data[pixIdx + 2] * (1 - lyrOpacity) * this.vignette[pixIdx / 4];
  };

  params = [
    {
      name: 'vigCol',
      displayName: 'Vignette Colour',
      type: 'colour',
      value: '#000000',
    },
  ];
};
