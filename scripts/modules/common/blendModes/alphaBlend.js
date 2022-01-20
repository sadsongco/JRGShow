// https://en.wikipedia.org/wiki/Alpha_compositing
const alphaBlend = (bottomLayerPixVals, upperLayerPixVals) => {
  // considered math.js for vector operations, but it was overkill
  let oR =
    bottomLayerPixVals.r * (1 - upperLayerPixVals.a) +
    upperLayerPixVals.r * upperLayerPixVals.a;
  let oG =
    bottomLayerPixVals.g * (1 - upperLayerPixVals.a) +
    upperLayerPixVals.g * upperLayerPixVals.a;
  let oB =
    bottomLayerPixVals.b * (1 - upperLayerPixVals.a) +
    upperLayerPixVals.b * upperLayerPixVals.a;
  return { r: oR, g: oG, b: oB, a: 255 };
};

export default alphaBlend;
