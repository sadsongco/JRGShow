import { d2b } from "./utils.js";

/**
 * Generate time-based values for dynamic modulation
 * @returns {array} - sinusoidal values at different wavelengths in range 0 - 1
 */
const dynamicGenerator = (timestamp) => {
  let modCof = 400;
  return [
      (Math.sin(timestamp / (modCof / 0.25)) + 1) / 2,
      (Math.sin(timestamp / (modCof / 0.5))  + 1) / 2,
      (Math.sin(timestamp / (modCof / 1))    + 1) / 2,
      (Math.sin(timestamp / (modCof / 2))    + 1) / 2,
      (Math.sin(timestamp / (modCof / 3))    + 1) / 2,
      (Math.sin(timestamp / (modCof / 4))    + 1) / 2,
      (Math.sin(timestamp / (modCof / 5))    + 1) / 2,
      (Math.sin(timestamp / (modCof / 7))    + 1) / 2,
      (Math.sin(timestamp / (modCof /10))    + 1) / 2,
    ];
};

/**
 * Generate a pseudo-random binary string
 * TODO update https://stackoverflow.com/questions/38702724/math-floor-vs-math-trunc-javascript
 * @returns {string} - binary string of variable length
 */
const pseudoRandomGenerator = () => {
    return  d2b(Math.trunc(Math.random()*2147483647*2*2)+1);
}

export { dynamicGenerator, pseudoRandomGenerator }