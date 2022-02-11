/**
 * @class Class that displays text to a canvas.
 * Solves problems related to web workers and sub canvases
 */
export const TextDisplayEngine = class {
  constructor({ numworkers, width, height, runAnimation }, previewSize = 1) {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = width;
    this.canvas.height = height;
    this.numworkers = numworkers;
    this.subCnvHeight = (this.canvas.height / this.numworkers) << 0;
    this.engineReady = false;
    this.updateText = false;
    this.text = '';
    this.textToType = '';
    this.textCol = [255, 255, 255];
    this.lyrOpacity = 1;
    this.textSize = 30;
    this.textHeight = 0;
    this.workersServiced = 0;
    this.previewSize = previewSize;
    this.padL = 0;
    this.padT = 0;
    this.lineSpacing = 0;
    this.runAnimation = runAnimation;
  }

  setParams = function ({ text, textCol, lyrOpacity, textSize, padL, padT, lineSpacing, typing = true, typingSpeed = 1, typingSpacing = 5, selectedFont = 'CourierPrime', ...params }) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.updateText = true;
    this.text = text;
    this.textToType = text;
    this.typingCol = 0;
    this.typingRow = 0;
    this.textCol = textCol;
    // this.selectedFont = selectedFont;
    this.textSize = (textSize * this.previewSize) << 0;
    this.lyrOpacity = lyrOpacity;
    this.ctx.font = `${this.textSize}px "${selectedFont}"`;
    const textMetrics = this.ctx.measureText('M');
    this.textHeight = textMetrics.fontBoundingBoxAscent + textMetrics.fontBoundingBoxDescent;
    this.padL = (padL * this.previewSize) << 0;
    this.padT = (padT * this.previewSize) << 0;
    this.lineSpacing = (lineSpacing * this.previewSize) << 0;
    this.drawLineSpacing = this.lineSpacing;
    this.typing = typing;
    this.typingX = this.padL;
    this.typingY = this.padT + this.textHeight;
    this.typingSpacing = typingSpacing;
    this.typingSpeed = typingSpeed;
    this.frameCount = 0;
    this.prevFrame = 0;
    const { audioMod = false } = params;
    this.audioMod = audioMod;
    const { audioSens = 0 } = params;
    this.audioSens = audioSens;
    const { audioModSource = 'vol' } = params;
    this.audioModSource = audioModSource;
  };

  setFrameCount = function (frameCount) {
    this.frameCount = frameCount;
  };

  setRunAnimation = function (runAnimation) {
    this.runAnimation = runAnimation;
  };

  setAudioInfo = function (audioInfo) {
    this.audioInfo = audioInfo;
    this.engineReady = true;
  };

  getFrame = async function ({ worker, resizeWidth, resizeHeight }) {
    return await createImageBitmap(this.canvas, 0, worker * this.subCnvHeight, this.canvas.width, this.subCnvHeight, {
      resizeWidth: resizeWidth,
      resizeHeight: resizeHeight,
      resizeQuality: 'low',
    });
  };

  draw = function () {
    if (this.engineReady && (this.updateText || this.audioMod)) {
      this.workersServiced++;
      // this.ctx.fillStyle = 'black';
      if (this.workersServiced === this.numworkers) {
        this.workersServiced = 0;
        this.updateText = false;
      }
      if (this.audioMod) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawLineSpacing = this.lineSpacing + this.audioSens * (this.audioInfo[this.audioModSource] / 255);
      }
      if (this.typing) {
        this.typeText();
      } else {
        this.showText();
      }
    }
  };

  showText = function () {
    this.ctx.fillStyle = `rgba(${this.textCol[0]}, ${this.textCol[1]}, ${this.textCol[2]}, ${this.lyrOpacity})`;
    const textLines = this.text.split('\n');
    const numLines = textLines.length;
    for (let i = 0; i < numLines; i++) {
      const currLine = textLines[i];
      const x = this.padL;
      const y = this.padT + this.textHeight + this.textHeight * i + this.drawLineSpacing * i;
      this.ctx.fillText(currLine, x, y, this.canvas.width - x);
    }
  };

  typeText = async function () {
    if (this.textToType.length > 0) this.updateText = true;
    if (this.frameCount % this.typingSpeed !== 0 || !this.runAnimation) {
      return;
    }
    this.ctx.fillStyle = `rgba(${this.textCol[0]}, ${this.textCol[1]}, ${this.textCol[2]}, ${this.lyrOpacity})`;
    let currChar = this.textToType.charAt(0);
    if (currChar === '\n') {
      this.typingY += this.textHeight + this.drawLineSpacing;
      this.typingX = this.padL;
      this.textToType = this.textToType.slice(1);
      currChar = this.textToType.charAt(0);
      return;
    }
    if (currChar === '\\') {
      this.textToType = this.textToType.slice(1);
      currChar = this.textToType.charAt(0);
      if (currChar === 'p') {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.typingX = this.padL;
        this.typingY = this.padT + this.textHeight;
        this.textToType = this.textToType.slice(1);
        currChar = this.textToType.charAt(0);
        if (currChar === '\n') {
          this.textToType = this.textToType.slice(1);
          currChar = this.textToType.charAt(0);
        }
        return;
      }
    }
    const charMetrics = await this.ctx.measureText(currChar);
    this.ctx.fillText(this.textToType.charAt(0), this.typingX, this.typingY);
    this.typingX += (charMetrics.width + this.typingSpacing) << 0;
    this.textToType = this.textToType.slice(1);
    if (this.textToType.length > 0) {
      this.updateText = true;
    }
    this.prevFrame = this.frameCount;
  };
};
