// https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro
/**
 *
 * @param {string} html - html string to convert
 * @returns {HTMLElement} - html converted to HTMLElement
 */
const htmlToElement = function (html) {
  const template = document.createElement('template');
  html = html.trim();
  template.innerHTML = html;
  return template.content;
};

/**
 * Converts a decimal number to a binary string
 * https://medium.com/@parkerjmed/practical-bit-manipulation-in-javascript-bfd9ef6d6c30
 * @param {float} x - decimal number to convert to binary
 * @returns {string} - binary string
 */
const d2b = (x) => x.toString(2);

const greyscaleCalc = ([iR, iG, iB]) => {
  // return iR * 0.3 + iG * 0.59 + iB * 0.11;
  /* updated with performant formula from https://stackoverflow.com/questions/596216/formula-to-determine-perceived-brightness-of-rgb-color */
  return ((iR << 1) + iR + (iG << 2) + iB) >> 3;
};

// https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
const rgbToHex = (r, g, b) => {
  const rgb = (r << 16) | (g << 8) | (b << 0);
  return `#${(0x1000000 + rgb).toString(16).slice(1)}`;
};

// https://stackoverflow.com/questions/36697749/html-get-color-in-rgb
const hexToRgb = (hex) => {
  return hex.match(/[A-Fa-f0-9]{2}/g).map((v) => parseInt(v, 16));
};

/**
 * Re-maps a number from one range to another
 * copy of https://p5js.org/reference/#/p5/map
 * @param {Integer|Float} n - incoming value to be converted
 * @param {Integer|Float} start1 - lower bound of the value's current range
 * @param {Integer|Float} stop1 - upper bound of the value's current range
 * @param {Integer|Float} start2 - lower bound of the vallue's target range
 * @param {Integer|Float} stop2 - upper bound of the value's target range
 * @returns {Integer|Float}
 */
const map = (n, start1, stop1, start2, stop2) => {
  return ((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
};

export { d2b, htmlToElement, greyscaleCalc, rgbToHex, hexToRgb, map };
