import { d2b } from "./utils.js";

/**
 * Generate time-based values for dynamic modulation
 * @returns {array} - sinusoidal values at different wavelengths in range 0 - 1
 */
const dynamicGenerator = (frameCount) => {
    let modCof = 20
    return [
        (Math.sin(frameCount/(modCof / 0.25)) + 1) / 2,
        (Math.sin(frameCount/(modCof / 0.5)) + 1) / 2,
        (Math.sin(frameCount/(modCof / 1)) + 1) / 2,
        (Math.sin(frameCount/(modCof / 2)) + 1) / 2,
        (Math.sin(frameCount/(modCof / 3)) + 1) / 2, 
        (Math.sin(frameCount/(modCof / 4)) + 1) / 2, 
        (Math.sin(frameCount/(modCof / 5)) + 1) / 2, 
        (Math.sin(frameCount/(modCof / 7)) + 1) / 2,
    ];
}

/**
 * Generate a pseudo-random binary string
 * TODO update https://stackoverflow.com/questions/38702724/math-floor-vs-math-trunc-javascript
 * @returns {string} - binary string of variable length
 */
const pseudoRandomGenerator = () => {
    return  d2b(Math.trunc(Math.random()*2147483647*2*2)+1);
}

export { dynamicGenerator, pseudoRandomGenerator }