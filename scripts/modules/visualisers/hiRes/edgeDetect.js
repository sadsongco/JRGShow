import { Visualiser } from "/scripts/modules/visualisers/Visualiser.js"
import alphaBlend from "/scripts/modules/util/alphaBlend.js";
import { greyscaleCalc } from "/scripts/modules/util/utils.js";

export class edgeDetect extends Visualiser {
  constructor() {
    super();
    this.convMatrix = [-1, -1, -1, -1, 8, -1, -1, -1, -1];
  }

  processPixels = function (pixIdx, pixVals, { vx, vy, brighten = 0, lyrOpacity = 1, negThresh = 0, procSource = 'Video In', ...kwargs } = {}, context) {
    const pixLeft = (vy * context.cnv.width + vx - 1) * 4;
    const pixRight = (vy * context.cnv.width + vx + 1) * 4;
    const pixUp = ((vy - 1) * context.cnv.width + vx) * 4;
    const pixDown = ((vy + 1) * context.cnv.width + vx) * 4;
    const pixUpLeft = ((vy - 1) * context.cnv.width + vx - 1) * 4;
    const pixUpRight = ((vy - 1) * context.cnv.width + vx + 1) * 4;
    const pixDownLeft = ((vy - 1) * context.cnv.width + vx - 1) * 4;
    const pixDownRight = ((vy - 1) * context.cnv.width + vx + 1) * 4;

    const cnvCol = [context.cnvPixels.data[pixIdx + 0], context.cnvPixels.data[pixIdx + 1], context.cnvPixels.data[pixIdx + 2]];
    const sourcePixels = procSource === 'Prev Module' ? context.cnvPixels.data : context.vidPixels.data;

    let pR = sourcePixels[pixUpLeft + 0] * this.convMatrix[0] + sourcePixels[pixUp + 0] * this.convMatrix[1] + sourcePixels[pixUpRight + 0] * this.convMatrix[2] + sourcePixels[pixLeft + 0] * this.convMatrix[3] + sourcePixels[pixIdx + 0] * this.convMatrix[4] + sourcePixels[pixRight + 0] * this.convMatrix[5] + sourcePixels[pixDownLeft + 0] * this.convMatrix[6] + sourcePixels[pixDown + 0] * this.convMatrix[7] + sourcePixels[pixDownRight + 0] * this.convMatrix[8];
    let pG = sourcePixels[pixUpLeft + 1] * this.convMatrix[0] + sourcePixels[pixUp + 1] * this.convMatrix[1] + sourcePixels[pixUpRight + 1] * this.convMatrix[2] + sourcePixels[pixLeft + 1] * this.convMatrix[3] + sourcePixels[pixIdx + 1] * this.convMatrix[4] + sourcePixels[pixRight + 1] * this.convMatrix[5] + sourcePixels[pixDownLeft + 1] * this.convMatrix[6] + sourcePixels[pixDown + 1] * this.convMatrix[7] + sourcePixels[pixDownRight + 1] * this.convMatrix[8];
    let pB = sourcePixels[pixUpLeft + 2] * this.convMatrix[0] + sourcePixels[pixUp + 2] * this.convMatrix[1] + sourcePixels[pixUpRight + 2] * this.convMatrix[2] + sourcePixels[pixLeft + 2] * this.convMatrix[3] + sourcePixels[pixIdx + 2] * this.convMatrix[4] + sourcePixels[pixRight + 2] * this.convMatrix[5] + sourcePixels[pixDownLeft + 2] * this.convMatrix[6] + sourcePixels[pixDown + 2] * this.convMatrix[7] + sourcePixels[pixDownRight + 2] * this.convMatrix[8];

    const grayscale = greyscaleCalc([pR, pG, pB]);
    if (grayscale < negThresh) lyrOpacity = 0;

    const [oR, oG, oB] = alphaBlend([...cnvCol, 255], [pR << brighten, pG << brighten, pB << brighten, lyrOpacity]);

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
      name: 'negThresh',
      displayName: 'Threshold',
      type: 'val',
      range: [0, 255],
      value: 0,
    },
    {
      name: 'brighten',
      displayName: 'Brighten',
      type: 'val',
      range: [0, 8],
      value: 0,
    },
  ];
}
