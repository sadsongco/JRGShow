import { Visualiser } from '../Visualiser.js';
import { greyscaleCalc } from '../../util/utils.js';
import { map } from '../../util/utils.js';

export const ascii = class extends Visualiser {
  constructor() {
    super();
    this.asciiDict = ['#', '@', 'M', 'W', '8', 'X', 'D', 'C', 'O', '|', '1', '-', '_', ',', ' '];
    this.dictLen = this.asciiDict.length;
    this.currRowNum = 0;
    this.currRow = '';
    this.visReady = false;
  }

  setup() {
    /* https://stackoverflow.com/questions/53808106/chrome-offscreencanvas-custom-fonts */
    /* https://developer.mozilla.org/en-US/docs/Web/API/FontFace */
    const CourierPrime = new FontFace('CourierPrime', "local('CourierPrime-Regular'), url(/assets/fonts/CourierPrime-Regular.ttf)");
    const VT323 = new FontFace('VT323', 'url(/assets/fonts/VT323-Regular.ttf)');
    Promise.all([CourierPrime.load(), VT323.load()]).then(() => {
      self.fonts.add(CourierPrime);
      self.fonts.add(VT323);
      this.visReady = true;
    });
  }
  processFramePre = function (vidPix, kwargs, context) {
    if (!this.visReady) return;
    const { lyrOpacity = 1 } = kwargs;
    let { selectedFont = 'CourierPrime' } = kwargs;
    this.selectedFont = selectedFont;
    let { charsPerRow = 40 } = kwargs;
    this.charsPerRow = charsPerRow;
    const { bw = true } = kwargs;
    this.bw = bw;
    this.charsPerCol = 10;
    this.lyrOpacity = lyrOpacity;
    this.colPix = (context.cnv.width / charsPerRow) << 0;
    this.rowPix = (context.cnv.height / this.charsPerCol) << 0;
    this.asciiRows = [];
    this.symbolCols = [];
    this.symbolRowCols = [];
    this.currRowNum = 0;
  };
  processPixels = function (pixIdx, pixVals, kwargs = {}, context) {
    if (!this.visReady) return;
    if (kwargs.vx % this.rowPix != 0 || kwargs.vy % this.colPix != 0) return;
    if (kwargs.vy > this.currRowNum) {
      this.currRowNum = kwargs.vy;
      this.asciiRows.push(this.currRow);
      this.currRow = '';
      this.symbolCols.push(this.symbolRowCols);
      this.symbolRowCols = [];
    }
    const cnvCol = [context.cnvPixels.data[pixIdx + 0], context.cnvPixels.data[pixIdx + 1], context.cnvPixels.data[pixIdx + 2]];
    const grayscale = greyscaleCalc(pixVals);
    this.symbolRowCols.push(pixVals);
    let symbolIdx = Math.round(map(grayscale, 0, 255, 0, this.dictLen - 1));
    this.currRow += this.asciiDict[symbolIdx];
    // console.log(this.currRow);
    // const outCols = alphaBlend([...cnvCol, 1], [...pixVals, this.lyrOpacity]);
    // context.cnvPixels.data[pixIdx + 0] = grayscale;
    // context.cnvPixels.data[pixIdx + 1] = grayscale;
    // context.cnvPixels.data[pixIdx + 2] = grayscale;
  };
  processFramePost = function (vidPx, kwargs, context) {
    if (!this.visReady) return;
    if (this.bw) {
      this.drawAsciiBW(context);
      return;
    }
    this.drawAsciiCol(context);
  };
  drawAsciiBW = function (context) {
    context.cnvContext.font = `${this.rowPix * 1.65}px "${this.selectedFont}"`;
    // console.log(`${this.rowPix * 1.65}px ${this.selectedFont}`);
    const numRows = this.asciiRows.length;
    for (let i = 0; i < numRows; i++) {
      const ty = this.rowPix * i;
      context.cnvContext.fillStyle = `rgba(255, 255, 255, ${this.lyrOpacity})`;
      context.cnvContext.fillText(this.asciiRows[i], 0, ty);
    }
  };
  drawAsciiCol = function (context) {
    const numRows = this.asciiRows.length;
    for (let i = 0; i < numRows; i++) {
      const ty = this.rowPix * i;
      const currRow = [...this.asciiRows[i]];
      const currRowCols = this.symbolCols[i];
      for (let x = 0; x < this.charsPerRow; x++) {
        const tx = this.colPix * x;
        const [r, g, b] = currRowCols[x];
        context.cnvContext.fillStyle = `rgba(${r}, ${g}, ${b}, ${this.lyrOpacity})`;
        context.cnvContext.font = `${this.rowPix}px "${this.selectedFont}", monospace`;
        context.cnvContext.fillText(currRow[x], tx, ty);
      }
    }
  };
  params = [
    {
      name: 'charsPerRow',
      displayName: 'Num chars per row.',
      type: 'val',
      range: [30, 100],
      value: 40,
    },
    {
      name: 'bw',
      displayName: 'Black and White',
      type: 'toggle',
      value: false,
    },
    {
      name: 'selectedFont',
      displayName: 'ASCII font',
      type: 'select',
      options: ['CourierPrime', 'VT323'],
      value: 'vol',
    },
    {
      name: 'lyrOpacity',
      displayName: 'Layer Opacity',
      type: 'val',
      range: [0, 1],
      step: 0.1,
      value: 1,
    },
  ];
};

// export const ascii = class extends Visualiser {
//     setup = function(context, kwargs = {}) {
//         const { asciiCof = 8 } = kwargs;
//         this.asciiCof = asciiCof;
//         const asciiart_width = Math.floor((width) / this.asciiCof);
//         const asciiart_height = Math.floor((height) / this.asciiCof);
//         this.gfx = createGraphics(asciiart_width, asciiart_height)
//         this.gfx.pixelDensity(1)
//         this.myAsciiArt = new AsciiArt(context)
//         this.weightTable = this.myAsciiArt.createWeightTable()
//         this.asciiArtWidth = asciiart_width
//         this.ascciArtHeight = asciiart_height
//         this.xScale = width / this.asciiArtWidth
//         this.yScale = height / this.ascciArtHeight
//         const fontName = 'monospace'
//         const fontSize = (asciiart_width / asciiCof) >> 0;
//         textFont(fontName)
//         textSize(fontSize)
//         textAlign(CENTER, CENTER)
//         noStroke()
//     }

//     processFramePre = function(vidIn, kwargs) {
//         const { bw = false } = kwargs;
//         const { bwBrightness = 200 } = kwargs;
//         const tempMaxWeight = 3 * 255
//         const tempRange = this.weightTable.length - 1;
//         let tempWeight
//         for (let ay = 0; ay < this.ascciArtHeight; ay++) {
//             for (let ax = 0; ax < this.asciiArtWidth; ax++) {
//                 const xpos = Math.floor(ax * this.xScale)
//                 const ypos = Math.floor(ay * this.yScale)
//                 const pixIdx = ((ypos * width) + xpos) * 4
//                 tempWeight = (vidIn.pixels[pixIdx + 0] + vidIn.pixels[pixIdx + 1] + vidIn.pixels[pixIdx + 2])/tempMaxWeight
//                 tempWeight = Math.floor(tempWeight * tempRange)
//                 if (bw)
//                     fill(bwBrightness);
//                 else
//                     fill(vidIn.pixels[pixIdx + 0] << this.brighten, vidIn.pixels[pixIdx + 1] << this.brighten, vidIn.pixels[pixIdx + 2] << this.brighten)
//                 if (this.weightTable[tempWeight])
//                     text(char(this.weightTable[tempWeight].code), xpos, ypos)
//             }
//         }
//     }

//     params = [
//         {
//             name: "asciiCof",
//             displayName: "Resolution (doesn't update in real time)",
//             type: "val",
//             range: [
//                 2, 16
//             ],
//             step: 2,
//             value: 8
//         },
//         {
//             name: "bw",
//             displayName: "Black and White",
//             type: "toggle",
//             value: false
//         },
//         {
//             name: "bwBrightness",
//             displayName: "B&W Brightness",
//             type: "toggle",
//             type: "val",
//             range: [
//                 0, 255
//             ],
//             value: 200
//         },
//     ]

// }
