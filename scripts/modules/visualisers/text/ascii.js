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
    this.prevCharsPerRow = 0;
    this.prevNumRows = 0;
    this.prevFontSize = 0;
  }

  setup({ cnv, numWorkers }) {
    /* https://stackoverflow.com/questions/53808106/chrome-offscreencanvas-custom-fonts */
    /* https://developer.mozilla.org/en-US/docs/Web/API/FontFace */
    const CourierPrime = new FontFace('CourierPrime', "local('CourierPrime-Regular'), url(/assets/fonts/CourierPrime-Regular.ttf)");
    const VT323 = new FontFace('VT323', 'url(/assets/fonts/VT323-Regular.ttf)');
    Promise.all([CourierPrime.load(), VT323.load()]).then(() => {
      self.fonts.add(CourierPrime);
      self.fonts.add(VT323);
      this.visReady = true;
    });
    this.overallCnv = cnv;
    this.numWorkers = numWorkers;
  }

  processFramePre = function (vidPix, { lyrOpacity = 1, mono = true, monoCol = [255, 255, 255], selectedFont = 'CourierPrime', ...kwargs } = {}, context) {
    if (!this.visReady) return;
    this.lyrOpacity = lyrOpacity;
    this.mono = mono;
    this.monoCol = monoCol;
    this.selectedFont = selectedFont;
    const { charsPerRow = 40 } = kwargs;
    const { numRows = 3 } = kwargs;
    const { fontSize = 5 } = kwargs;
    if (charsPerRow === this.prevCharsPerRow && numRows === this.prevNumRows && fontSize === this.prevFontSize) return;
    this.charsPerRow = charsPerRow;
    this.numRows = numRows;
    // console.log('numRows: ', this.numRows);
    this.fontSize = fontSize;
    this.colPix = Math.round(context.cnv.width / charsPerRow);
    this.rowPix = Math.round(context.drawHeight / this.numRows);

    this.asciiRows = [];
    this.currRowNum = 0;
  };

  processPixels = function (pixIdx, pixVals, kwargs = {}, context) {
    if (!this.visReady || kwargs.vy < context.drawStart || kwargs.vy > context.drawStart + context.drawHeight) return;
    if (kwargs.vx % this.rowPix != (this.rowPix / 2) << 0 || kwargs.vy % this.colPix != (this.colPix / 2) << 0) return;
    if (kwargs.vy > this.currRowNum) {
      this.currRowNum = kwargs.vy;
      this.asciiRows.push(this.currRow);
      this.currRow = [];
    }
    const grayscale = greyscaleCalc(pixVals);
    let symbolIdx = Math.round(map(grayscale, 0, 255, this.dictLen - 1, 0));
    this.currRow.push({ symbol: this.asciiDict[symbolIdx], col: [...pixVals] });
  };

  processFramePost = function (vidPx, kwargs, context) {
    if (!this.visReady) return;
    this.drawAscii(context);
  };

  drawAscii = function (context) {
    context.cnvContext.font = `${this.fontSize}px "${this.selectedFont}"`;
    const m = this.asciiRows.length;
    for (let y = 0; y < m; y++) {
      const ty = this.rowPix * y + context.drawStart;
      const currRow = [...this.asciiRows[y]];
      const n = currRow.length;
      for (let x = 0; x < n; x++) {
        const tx = this.colPix * x;
        context.cnvContext.fillStyle = this.mono ? `rgba(${this.monoCol[0]}, ${this.monoCol[1]}, ${this.monoCol[2]}, ${this.lyrOpacity})` : `rgba(${currRow[x].col[0]}, ${currRow[x].col[1]}, ${currRow[x].col[2]}, ${this.lyrOpacity})`;
        context.cnvContext.fillText(currRow[x].symbol, tx, ty);
        // context.cnvContext.fillRect(tx, ty, 2, 2);
      }
    }
  };

  params = [
    {
      name: 'charsPerRow',
      displayName: 'Chars per row',
      type: 'val',
      range: [30, 100],
      value: 40,
    },
    {
      name: 'numRows',
      displayName: 'Rows per canvas',
      type: 'val',
      range: [3, 30],
      value: 5,
    },
    {
      name: 'fontSize',
      displayName: 'Font Size',
      type: 'val',
      range: [2, 20],
      value: 5,
    },
    {
      name: 'mono',
      displayName: 'Mono',
      type: 'toggle',
      value: false,
    },
    {
      name: 'monoCol',
      displayName: 'Mono Colour',
      type: 'colour',
      value: '#ffffff',
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
