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

export { d2b, htmlToElement };