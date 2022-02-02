// https://en.wikipedia.org/wiki/Alpha_compositing
const alphaBlend = (bottomLayerPixVals, upperLayerPixVals) => {
  // considered math.js for vector operations, but it was overkill
  let oR = bottomLayerPixVals[0] * (1 - upperLayerPixVals[3]) + upperLayerPixVals[0] * upperLayerPixVals[3];
  let oG = bottomLayerPixVals[1] * (1 - upperLayerPixVals[3]) + upperLayerPixVals[1] * upperLayerPixVals[3];
  let oB = bottomLayerPixVals[2] * (1 - upperLayerPixVals[3]) + upperLayerPixVals[2] * upperLayerPixVals[3];
  return { r: oR, g: oG, b: oB, a: 255 };
};

export default alphaBlend;
