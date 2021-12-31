import { d2b } from "./utils.js";

/**
 * Generate time-based values for dynamic modulation
 * @returns {array} - sinusoidal values at different wavelengths in range 0 - 1
 */
export const dynamicGenerator = () => {
    let modCof = 20
    return [
        (sin(frameCount/(modCof / 0.25)) + 1) / 2,
        (sin(frameCount/(modCof / 0.5)) + 1) / 2,
        (sin(frameCount/(modCof / 1)) + 1) / 2,
        (sin(frameCount/(modCof / 2)) + 1) / 2,
        (sin(frameCount/(modCof / 3)) + 1) / 2, 
        (sin(frameCount/(modCof / 4)) + 1) / 2, 
        (sin(frameCount/(modCof / 5)) + 1) / 2, 
        (sin(frameCount/(modCof / 7)) + 1) / 2,
    ];
}

/**
 * Generate a pseudo-random binary string
 * @returns {string} - binary string of variable length
 */
export const pseudoRandomGenerator = () => {
    return  d2b(Math.trunc(Math.random()*2147483647*2*2)+1);
}

// https://gist.github.com/plugnburn/6364166
/**
 * Computationally cheap pseudo random number generator
 * @returns {integer}
 */
const shiftRandom = function(l,f,s,r) {
    for(r=s="",l*=8;l--;)l&7?s=s<<1|(f=f>>1^(f&1&&0x80000057))&1:(r+=String.fromCharCode(s),s=0);
    return r
}

const lfsr = (bitLength) => {
    let state = (1 << 127) | 1;
    let output = '';
    for (let i = 0; i < bitLength; i ++) {
        output += (state & 1)
        let newbie = (state ^ (state >> 1) ^ (state >> 2) ^ (state >> 7)) & 1;
        state = state >> 1 | (newbie << 127);
    }
    return output;
}