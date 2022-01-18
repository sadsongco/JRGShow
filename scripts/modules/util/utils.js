// https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro
/**
 * 
 * @param {string} html - html string to convert
 * @returns {HTMLElement} - html converted to HTMLElement
 */
const htmlToElement = function(html) {
    const template = document.createElement('template')
    html = html.trim()
    template.innerHTML = html
    return template.content
}

/**
 * Converts a decimal number to a binary string
 * https://medium.com/@parkerjmed/practical-bit-manipulation-in-javascript-bfd9ef6d6c30
 * @param {float} x - decimal number to convert to binary
 * @returns {string} - binary string
 */
const d2b = x => x.toString(2);

const greyscaleCalc = ([iR, iG, iB]) => {
    return (iR * 0.3) + (iG * 0.59) + (iB * 0.11)
}

// https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
const rgbToHex = (r, g, b) => {
    const rgb = (r<<16) | (g<<8) | (b<<0);
    return `#${(0x1000000 + rgb).toString(16).slice(1)}`;
}

// https://stackoverflow.com/questions/36697749/html-get-color-in-rgb
const hexToRgb = (hex) => {
    return hex.match(/[A-Fa-f0-9]{2}/g).map(v=>parseInt(v, 16));
}

export { d2b, htmlToElement, greyscaleCalc, rgbToHex, hexToRgb };