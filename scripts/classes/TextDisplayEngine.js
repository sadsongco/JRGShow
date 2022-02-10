/**
 * @class Class that displays text to a canvas.
 * Solves problems related to web workers and sub canvases
 */
export const TextDisplayEngine = class {
  constructor({ numworkers, width, height }) {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = width;
    this.canvas.height = height;
    this.numworkers = numworkers;
    this.subCnvHeight = (this.canvas.height / this.numworkers) << 0;
    this.engineReady = true;
    this.updateText = false;
    this.text = '';
    this.workersServiced = 0;
  }

  setText = function(text) {
    if (this.text !== text) {
      this.text = text;
      this.updateText = true;
    }
  }

  get debugCanvas() {
    return this.canvas;
  }

  getFrame = async function({ worker, resizeWidth, resizeHeight }) {
    if (this.engineReady && this.updateText) {
      this.workersServiced ++;
      this.ctx.fillStyle = 'black';
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      if (this.workersServiced === this.numworkers){
        this.workersServiced = 0;
        this.updateText = false;
      }
      this.ctx.font = '50px serif';
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillText(this.text, 10, 180);
    }
    return await createImageBitmap(this.canvas, 0, worker * this.subCnvHeight, this.canvas.width, this.subCnvHeight, {
      resizeWidth: resizeWidth,
      resizeHeight: resizeHeight,
      resizeQuality: 'low',
    });
  }
};
