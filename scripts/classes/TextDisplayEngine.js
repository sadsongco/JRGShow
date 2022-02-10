/**
 * @class Class that displays text to a canvas.
 * Solves problems related to web workers and sub canvases
 */
export const TextDisplayEngine = class {
  constructor({ numworkers, width, height }, previewSize = 1) {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = width;
    this.canvas.height = height;
    this.numworkers = numworkers;
    this.subCnvHeight = (this.canvas.height / this.numworkers) << 0;
    this.engineReady = true;
    this.updateText = false;
    this.text = '';
    this.textCol = [255, 255, 255];
    this.lyrOpacity = 1;
    this.textSize = 30;
    this.textHeight = 0;
    this.workersServiced = 0;
    this.previewSize = previewSize;
    this.padL = 0;
    this.padT = 0;
    this.lineSpacing = 0;
  }

  setParams = function ({ text, textCol, lyrOpacity, textSize, padL, padT, lineSpacing }) {
    if (this.text !== text || this.textCol !== textCol || this.lyrOpacity !== lyrOpacity || this.textSize != textSize || this.padL != padL || this.padT != padT || this.lineSpacing != lineSpacing) {
      this.updateText = true;
    }
    this.text = text;
    this.textCol = textCol;
    this.lyrOpacity = lyrOpacity;
    this.textSize = (textSize * this.previewSize) << 0;
    this.ctx.font = `${this.textSize}px 'CourierPrime'`;
    const textMetrics = this.ctx.measureText('M');
    this.textHeight = textMetrics.fontBoundingBoxAscent + textMetrics.fontBoundingBoxDescent;
    this.padL = (padL * this.previewSize) << 0;
    this.padT = (padT * this.previewSize) << 0;
    this.lineSpacing = (lineSpacing * this.previewSize) << 0;
  };

  getFrame = async function ({ worker, resizeWidth, resizeHeight }) {
    if (this.engineReady && this.updateText) {
      this.workersServiced++;
      // this.ctx.fillStyle = 'black';
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      if (this.workersServiced === this.numworkers) {
        this.workersServiced = 0;
        this.updateText = false;
      }
      this.ctx.fillStyle = `rgba(${this.textCol[0]}, ${this.textCol[1]}, ${this.textCol[2]}, ${this.lyrOpacity})`;
      const textLines = this.text.split('\n');
      const numLines = textLines.length;
      for (let i = 0; i < numLines; i++) {
        const currLine = textLines[i];
        const x = this.padL;
        const y = this.padT + this.textHeight + this.textHeight * i + this.lineSpacing * i;
        this.ctx.fillText(currLine, x, y, this.canvas.width - x);
      }
    }
    return await createImageBitmap(this.canvas, 0, worker * this.subCnvHeight, this.canvas.width, this.subCnvHeight, {
      resizeWidth: resizeWidth,
      resizeHeight: resizeHeight,
      resizeQuality: 'low',
    });
  };
};
