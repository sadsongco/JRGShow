import { map } from './utils.js';

/**
 * Generates an opacity mask pixel array for use as a vignette
 * @param {integer} width - width of canvas
 * @param {integer} height - height of canvas
 * @returns {Promise<Array>} width x height pixel array with opacity vignette
 */
const vignetteMask = async function (width, height) {
  const vigMask = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const vigXIntensity = Math.sin(map(x, 0, width, 0, Math.PI));
      const vigYIntensity = Math.sin(map(y, 0, height, 0, Math.PI));
      vigMask.push((vigXIntensity * vigYIntensity * 255) >> 0);
    }
  }
  return await Promise.resolve(vigMask);
};
export default vignetteMask;
