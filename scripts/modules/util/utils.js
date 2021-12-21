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

export default htmlToElement