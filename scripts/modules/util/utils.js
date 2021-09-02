// https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro
export const htmlToElement = function(html) {
    /**
     * create DOM element from HTML string
     * @param   {String}    html    html string to convert
     * @returns {HTMLElement}       html converted to HTMLElement
     */

    const template = document.createElement('template')
    html = html.trim()
    template.innerHTML = html
    return template.content
}