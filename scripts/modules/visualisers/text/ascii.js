// constructor for ascii video loops
const ascii = function () {
    let myAsciiArt, gfx, context
    let weightTable, asciiArtWidth, ascciArtHeight, xScale, yScale
    let fontName, fontSize


    this.init = function(_context, asciiart_width, asciiart_height, _brighten=0) {
        this.brighten = _brighten
        gfx = createGraphics(asciiart_width, asciiart_height)
        gfx.pixelDensity(1)
        context = _context
        myAsciiArt = new AsciiArt(context) 
        weightTable = myAsciiArt.createWeightTable()
        asciiArtWidth = asciiart_width
        ascciArtHeight = asciiart_height
        xScale = width / asciiArtWidth
        yScale = height / ascciArtHeight
        fontName = 'monospace'
        fontSize = 18
        textFont(fontName)
        textSize(fontSize)
        textAlign(CENTER, CENTER)
        noStroke()
    }

    this.draw = function(vidIn, bw=false) {

        const tempMaxWeight = 3 * 255
        const tempRange = weightTable.length - 1;
        let tempWeight
        for (let ay = 0; ay < ascciArtHeight; ay++) {
            for (let ax = 0; ax < asciiArtWidth; ax++) {
                const aIdx = ay * width + ax
                const xpos = Math.floor(ax * xScale)
                const ypos = Math.floor(ay * yScale)
                const pixIdx = ((ypos * width) + xpos) * 4
                tempWeight = (vidIn.pixels[pixIdx + 0] + vidIn.pixels[pixIdx + 1] + vidIn.pixels[pixIdx + 2])/tempMaxWeight
                tempWeight = Math.floor(tempWeight * tempRange)
                if (bw)
                    fill(200)
                else
                    fill(vidIn.pixels[pixIdx + 0] << this.brighten, vidIn.pixels[pixIdx + 1] << this.brighten, vidIn.pixels[pixIdx + 2] << this.brighten)
                if (weightTable[tempWeight])
                    text(char(weightTable[tempWeight].code), xpos, ypos)
            }
        }
    }

    this.setBright = function(level) {
        this.brighten = level
        console.log(this.brighten)
    }
}

export default ascii;