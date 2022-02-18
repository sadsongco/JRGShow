import { Visualiser } from '/scripts/modules/visualisers/Visualiser.js';
import { greyscaleCalc } from '/scripts/modules/util/utils.js';
import Vector from '/scripts/classes/Vector.js';

export class motion extends Visualiser {
  constructor() {
    super();
    this.prevFrame = false;
    this.motion = false;
    this.motionTracker = [];
    this.pixelArraySize = null;
  }

  setPixelArraySize = function (value) {
    this.pixelArraySize = value;
    this.motionTracker = new Array(this.pixelArraySize);
  };

  processPixels = function (pixIdx, pixVals, kwargs = {}, context) {
    if (!this.prevFrame) return;
    if (!this.motionTracker[pixIdx / 4]) this.motionTracker[pixIdx / 4] = 0;
    const { resolution = 1 } = kwargs;
    if (pixIdx % resolution !== 0) return;
    let [iR, iG, iB] = pixVals;
    const { motionThresh = 20 } = kwargs;
    const { motionSmooth = 0.71 } = kwargs;
    const { lyrOpacity = 1 } = kwargs;
    const { bw = false } = kwargs;
    const { motionColToggle = false } = kwargs;
    const { motion_col = [255, 255, 255] } = kwargs;
    const [r, g, b] = motion_col;
    let oR = 0;
    let oG = 0;
    let oB = 0;
    const greyscale = greyscaleCalc(pixVals);
    const currVec = new Vector(iR, iG, iB);
    const prevVec = new Vector(this.prevFrame[pixIdx + 0], this.prevFrame[pixIdx + 1], this.prevFrame[pixIdx + 2]);
    const motionVec = currVec.distSq(prevVec);
    // const currMotion = motionVec > this.motionTracker[pixIdx / 4] ? motionVec : this.motionTracker[pixIdx / 4] + this.motionSmooth * (this.motionTracker[pixIdx / 4] - motionVec);
    const currMotion = motionVec > this.motionTracker[pixIdx / 4] ? motionVec : this.motionTracker[pixIdx / 4] - motionSmooth * (this.motionTracker[pixIdx / 4] - motionVec);
    this.motion = currMotion > motionThresh * motionThresh;
    this.motionTracker[pixIdx / 4] = currMotion;
    if (!this.motion) return;
    oR = iR;
    oG = iG;
    oB = iB;
    if (bw) oR = oG = oB = greyscale;
    if (motionColToggle) {
      oR = r;
      oG = g;
      oB = b;
    }
    // loop over resolution area and draw pixels
    for (let rx = 0; rx <= resolution; rx++) {
      for (let ry = 0; ry <= resolution; ry++) {
        let localPixIdx = ((ry + kwargs.vy) * context.cnv.width + +kwargs.vx) * 4;
        context.cnvPixels.data[localPixIdx + 0] = oR * lyrOpacity + context.cnvPixels.data[pixIdx + 0] * (1 - lyrOpacity);
        context.cnvPixels.data[localPixIdx + 1] = oG * lyrOpacity + context.cnvPixels.data[pixIdx + 1] * (1 - lyrOpacity);
        context.cnvPixels.data[localPixIdx + 2] = oB * lyrOpacity + context.cnvPixels.data[pixIdx + 2] * (1 - lyrOpacity);
      }
    }
  };

  processFramePost = function (vidPixels, kwargs = {}, context) {
    this.prevFrame = [...vidPixels];
  };

  params = [
    {
      name: 'motionThresh',
      displayName: 'Motion Threshold',
      type: 'val',
      range: [0, 255],
      value: 20,
    },
    {
      name: 'motionSmooth',
      displayName: 'Motion Smoothing',
      type: 'val',
      range: [0, 1],
      value: 0.71,
      step: 0.005,
      tooltip: 'Smaller number = more smoothing of the motion detection',
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
      name: 'resolution',
      displayName: 'Resolution',
      type: 'val',
      range: [1, 24],
      step: 1,
      value: 1,
    },

    {
      name: 'bw',
      displayName: 'Black and White',
      type: 'toggle',
      value: false,
    },
    {
      name: 'motionColToggle',
      displayName: 'Motion Colour',
      type: 'toggle',
      value: false,
    },
    {
      name: 'motion_col',
      displayName: 'Motion Colour picker',
      type: 'colour',
      value: '#ffffff',
    },
  ];
}
