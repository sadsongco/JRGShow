import { Visualiser } from "/scripts/modules/visualisers/Visualiser.js"
import alphaBlend from "/scripts/modules/util/alphaBlend.js";
import { greyscaleCalc } from "/scripts/modules/util/utils.js";

export class edgeDetect extends Visualiser {
  constructor() {
    super();
    this.convMatrix = [-1, -1, -1, -1, 8, -1, -1, -1, -1];
  }

  processPixels = function (pixIdx, pixVals, { vx, vy, brighten = 0, lyrOpacity = 1, negThresh = 0, ...kwargs } = {}, context) {
    const pixLeft = (vy * context.cnv.width + vx - 1) * 4;
    const pixRight = (vy * context.cnv.width + vx + 1) * 4;
    const pixUp = ((vy - 1) * context.cnv.width + vx) * 4;
    const pixDown = ((vy + 1) * context.cnv.width + vx) * 4;
    const pixUpLeft = ((vy - 1) * context.cnv.width + vx - 1) * 4;
    const pixUpRight = ((vy - 1) * context.cnv.width + vx + 1) * 4;
    const pixDownLeft = ((vy - 1) * context.cnv.width + vx - 1) * 4;
    const pixDownRight = ((vy - 1) * context.cnv.width + vx + 1) * 4;

    const cnvCol = [context.cnvPixels.data[pixIdx + 0], context.cnvPixels.data[pixIdx + 1], context.cnvPixels.data[pixIdx + 2]];

    let pR = context.vidPixels.data[pixUpLeft + 0] * this.convMatrix[0] + context.vidPixels.data[pixUp + 0] * this.convMatrix[1] + context.vidPixels.data[pixUpRight + 0] * this.convMatrix[2] + context.vidPixels.data[pixLeft + 0] * this.convMatrix[3] + context.vidPixels.data[pixIdx + 0] * this.convMatrix[4] + context.vidPixels.data[pixRight + 0] * this.convMatrix[5] + context.vidPixels.data[pixDownLeft + 0] * this.convMatrix[6] + context.vidPixels.data[pixDown + 0] * this.convMatrix[7] + context.vidPixels.data[pixDownRight + 0] * this.convMatrix[8];
    let pG = context.vidPixels.data[pixUpLeft + 1] * this.convMatrix[0] + context.vidPixels.data[pixUp + 1] * this.convMatrix[1] + context.vidPixels.data[pixUpRight + 1] * this.convMatrix[2] + context.vidPixels.data[pixLeft + 1] * this.convMatrix[3] + context.vidPixels.data[pixIdx + 1] * this.convMatrix[4] + context.vidPixels.data[pixRight + 1] * this.convMatrix[5] + context.vidPixels.data[pixDownLeft + 1] * this.convMatrix[6] + context.vidPixels.data[pixDown + 1] * this.convMatrix[7] + context.vidPixels.data[pixDownRight + 1] * this.convMatrix[8];
    let pB = context.vidPixels.data[pixUpLeft + 2] * this.convMatrix[0] + context.vidPixels.data[pixUp + 2] * this.convMatrix[1] + context.vidPixels.data[pixUpRight + 2] * this.convMatrix[2] + context.vidPixels.data[pixLeft + 2] * this.convMatrix[3] + context.vidPixels.data[pixIdx + 2] * this.convMatrix[4] + context.vidPixels.data[pixRight + 2] * this.convMatrix[5] + context.vidPixels.data[pixDownLeft + 2] * this.convMatrix[6] + context.vidPixels.data[pixDown + 2] * this.convMatrix[7] + context.vidPixels.data[pixDownRight + 2] * this.convMatrix[8];

    const grayscale = greyscaleCalc([pR, pG, pB]);
    if (grayscale < negThresh)
        lyrOpacity = 0;

    const [oR, oG, oB] = alphaBlend([...cnvCol, 255], [pR << brighten, pG << brighten, pB << brighten, lyrOpacity]);

    context.cnvPixels.data[pixIdx + 0] = oR;
    context.cnvPixels.data[pixIdx + 1] = oG;
    context.cnvPixels.data[pixIdx + 2] = oB;
  };

  params = [
    {
        name: 'lyrOpacity',
        displayName: 'Layer Opacity',
        type: 'val',
        range: [0, 1],
        step: 0.1,
        value: 1,
      },    {
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
