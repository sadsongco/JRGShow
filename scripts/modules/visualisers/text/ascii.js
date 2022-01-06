import { Visualiser } from '../Visualiser.js'

export const ascii = class extends Visualiser {
    setup = function(context, kwargs = {}) {
        const { asciiCof = 8 } = kwargs;
        this.asciiCof = asciiCof;
        const asciiart_width = Math.floor((width) / this.asciiCof);
        const asciiart_height = Math.floor((height) / this.asciiCof);
        this.gfx = createGraphics(asciiart_width, asciiart_height)
        this.gfx.pixelDensity(1)
        this.myAsciiArt = new AsciiArt(context) 
        this.weightTable = this.myAsciiArt.createWeightTable()
        this.asciiArtWidth = asciiart_width
        this.ascciArtHeight = asciiart_height
        this.xScale = width / this.asciiArtWidth
        this.yScale = height / this.ascciArtHeight
        const fontName = 'monospace'
        const fontSize = (asciiart_width / asciiCof) >> 0;
        textFont(fontName)
        textSize(fontSize)
        textAlign(CENTER, CENTER)
        noStroke()
    }

    processFramePre = function(vidIn, kwargs) {
        const { bw = false } = kwargs;
        const { bwBrightness = 200 } = kwargs;
        const tempMaxWeight = 3 * 255
        const tempRange = this.weightTable.length - 1;
        let tempWeight
        for (let ay = 0; ay < this.ascciArtHeight; ay++) {
            for (let ax = 0; ax < this.asciiArtWidth; ax++) {
                const xpos = Math.floor(ax * this.xScale)
                const ypos = Math.floor(ay * this.yScale)
                const pixIdx = ((ypos * width) + xpos) * 4
                tempWeight = (vidIn.pixels[pixIdx + 0] + vidIn.pixels[pixIdx + 1] + vidIn.pixels[pixIdx + 2])/tempMaxWeight
                tempWeight = Math.floor(tempWeight * tempRange)
                if (bw)
                    fill(bwBrightness);
                else
                    fill(vidIn.pixels[pixIdx + 0] << this.brighten, vidIn.pixels[pixIdx + 1] << this.brighten, vidIn.pixels[pixIdx + 2] << this.brighten)
                if (this.weightTable[tempWeight])
                    text(char(this.weightTable[tempWeight].code), xpos, ypos)
            }
        }
    }

    params = [
        {
            name: "asciiCof",
            displayName: "Resolution (doesn't update in real time)",
            type: "val",
            range: [
                2, 16
            ],
            step: 2,
            value: 8
        },
        {
            name: "bw",
            displayName: "Black and White",
            type: "toggle",
            value: false
        },
        {
            name: "bwBrightness",
            displayName: "B&W Brightness",
            type: "toggle",
            type: "val",
            range: [
                0, 255
            ],
            value: 200
        },
    ]

}