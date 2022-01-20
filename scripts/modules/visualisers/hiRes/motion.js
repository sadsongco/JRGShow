import { Visualiser } from "../../../_prototype/modules/visualisers/Visualiser.js";
import { greyscaleCalc } from "../../util/utils.js";
import getPixelValues from "../../util/getPixelValues.js";
import alphaBlend from "../../common/blendModes/alphaBlend.js";
import Vector from "../../../classes/Vector.js";

export class motion extends Visualiser {
  processPixels = function (pixIdx, pixVals, kwargs = {}, context) {
    // if (!context.prevVideoFrame) return;
    // set visualiser parameters
    const { resolution = 1 } = kwargs;
    if (kwargs.vx % resolution !== 0 || kwargs.vy % resolution !== 0) return;
    let { r, g, b, a } = pixVals;
    const { motionThresh = 20 } = kwargs;
    const { lyrOpacity = 1 } = kwargs;
    const { negOpacity = 1 } = kwargs;
    const { bw = false } = kwargs;
    const { motionColToggle = false } = kwargs;
    const { motion_col = [255, 255, 255] } = kwargs;
    const [mR, mG, mB] = motion_col;

    // get background of pixel
    let bgPixVals = getPixelValues(pixIdx, context.prevCnvFrame.data);

    let visPixVals;
    const greyscale = greyscaleCalc(pixVals);
    const currVec = new Vector(r, g, b);
    const prevVec = new Vector(context.prevVideoFrame.data[pixIdx + 0], context.prevVideoFrame.data[pixIdx + 1], context.prevVideoFrame.data[pixIdx + 2]);
    const motion = currVec.distSq(prevVec) > motionThresh * motionThresh;
    if (!motion) return;
    let oR = r;
    let oG = g;
    let oB = b;
    if (bw) oR = oG = oB = greyscale;
    if (motionColToggle) {
      visPixVals = { r: mR, g: mG, b: mB, a: lyrOpacity };
    } else {
      visPixVals = { r: oR, g: oG, b: oB, a: a };
    }
    // console.log(motion);
    const oPixVals = alphaBlend(bgPixVals, visPixVals);
    context.prevCnvFrame.data[pixIdx + 0] = oPixVals.r;
    context.prevCnvFrame.data[pixIdx + 1] = oPixVals.g;
    context.prevCnvFrame.data[pixIdx + 2] = oPixVals.b;
    context.prevCnvFrame.data[pixIdx + 3] = oPixVals.a;
    // // loop over resolution area and draw pixels
    // for (let rx = 0; rx <= resolution; rx++) {
    //   for (let ry = 0; ry <= resolution; ry++) {
    //     let localPixIdx = ((ry + kwargs.vy) * context.cnvFrame.width + +kwargs.vx) * 4;
    //     context.cnvFrame.data[localPixIdx + 0] = oR * lyrOpacity + context.cnvFrame.data[pixIdx + 0] * (1 - lyrOpacity);
    //     context.cnvFrame.data[localPixIdx + 1] = oG * lyrOpacity + context.cnvFrame.data[pixIdx + 1] * (1 - lyrOpacity);
    //     context.cnvFrame.data[localPixIdx + 2] = oB * lyrOpacity + context.cnvFrame.data[pixIdx + 2] * (1 - lyrOpacity);
    //   }
    // }

    // for (let i = 0; i < resolution; i ++) {
    //     const resStep = i * resolution;
    // //     context.pixels[pixIdx + (i*4) + 0] = oR
    // //     context.pixels[pixIdx + (i*4) + 1] = oG
    // //     context.pixels[pixIdx + (i*4) + 2] = oB
    // // }
    // }
  };

  params = [
    {
      name: "motionThresh",
      displayName: "Motion Threshold",
      type: "val",
      range: [0, 255],
      value: 20,
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
      name: "resolution",
      displayName: "Resolution",
      type: "val",
      range: [1, 24],
      step: 1,
      value: 1,
    },

    {
      name: "bw",
      displayName: "Black and White",
      type: "toggle",
      value: false,
    },
    {
      name: "motionColToggle",
      displayName: "Motion Colour",
      type: "toggle",
      value: false,
    },
    {
      name: "motion_col",
      displayName: "Motion Colour picker",
      type: "colour",
      value: "#ffffff",
    },
  ];
}
