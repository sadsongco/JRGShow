import { importModules } from '../common/importModules.js';
import getPixelValues from '../util/getPixelValues.js';

/**
 * @class Class for drawing to a canvas each frame
 * after processing via visualiser modules
 */
class ProcessCanvas {
  constructor() {
    // canvas and pixel properties
    this.cnv = null; // will hold this worker's canvas
    this.cnvContext = null; // will hold this worker's canvas context
    this.cnvPixels = []; // will hold pixel array of the canvas for each frame
    this.previewSize = 1; // size of the output canvas relative to target output resolution

    // subcanvas parameters passed at instantiation
    this.start = 0; // starting line of subcanvas in main canvas
    this.drawStart = 0; // where to draw the canvas from
    this.height = 0; // height of sub canvas
    this.drawHeight = 0; // how many rows of pixels to draw

    // local copies of global parameters
    this.outputSettings = {};
    this.vignetteMask = [];

    // visualiser properties
    this.visualiserModules = {}; // will hold the registered visualiser modules
    this.currentVisChain = []; // will hold the chain of visualiser processors
    this.visChainLength = 0; // stored as an int for speed
    this.outputSettings = {}; // will hold the current output settings
  }

  /**
   * Setter for this.currentVisChain
   * @param {Array} currentVisChain - objects of visualiser processors
   */
  setCurrentVisChain = (currentVisChain) => {
    this.currentVisChain = currentVisChain;
    this.visChainLength = this.currentVisChain.length;
  };

  /**
   * Update parameters of visualiser in the chain
   * @param {Object} params - index of visualiser in chain to update, parameters
   */
  setParameters = ({idx, params}) => {
    this.currentVisChain[idx].params = params;
  }

  /**
   * Setter for this.outputSettings
   * @param {Object} outputSettings
   */
  setOutputSettings = (outputSettings) => {
    this.outputSettings = outputSettings;
  };

  /**
   * Setup the canvas processor
   * @param {Object} data - supplied arguments
   */
  async setup(data) {
    // register worker subcanvas and details
    this.start = data.start;
    this.drawStart = data.drawStart;
    this.height = data.height;
    this.drawHeight = data.drawHeight;
    this.cnv = data.canvas;
    this.cnvContext = this.cnv.getContext('2d');
    this.previewSize = data.previewSize || 1;
    // initialise output settings
    this.outputSettings = { bg_opacity: 255, bg_col: [0, 0, 0] };
    // collect registered visualiser modules
    this.visualiserModules = await importModules();
    Object.values(this.visualiserModules).map((module) => {
      if (module.setup)
        module.setup({
          cnv: { width: this.cnv.width, height: this.cnv.height },
          numWorkers: data.numWorkers,
          previewSize: this.previewSize,
        });
      if (module.setPixelArraySize) module.setPixelArraySize(this.cnv.width * this.cnv.height);
      if (module.setVignetteMask) module.setVignetteMask(data.vignetteMask);
    });
    postMessage({setupComplete: true});
  }

  /**
   * Draw each frame
   * @param {Object} data - supplied arguments
   */
  draw(data) {
    this.drawBackground();
    const filledVisModules = [];
    this.currentVisChain.map((visModule, idx) => {
      if (visModule) filledVisModules.push(idx);
    })
    // set params, once per frame, included in processFramePre loop
    const visParams = [];
    for (let i of filledVisModules) {
      const module = this.currentVisChain[i];
      visParams[i] = { ...module.params };
      const kwargs = visParams[i];
      kwargs.idx = i;
      kwargs.dyn = data.dyn;
      kwargs.audioInfo = data.audioInfo;
      if (data.extVideoFrames) {
        // console.log(data.extVideoFrames);
        kwargs.extVideoFrame = data.extVideoFrames[i];
      }
      this.visualiserModules[module.name].processFramePre(data.videoFrame, kwargs, this);
    }
    this.vidPixels = data.videoPixels;
    this.cnvPixels = this.cnvContext.getImageData(0, 0, this.cnv.width, this.cnv.height);
    for (let vy = 0; vy < this.cnv.height; vy++) {
      for (let vx = 0; vx < this.cnv.width; vx++) {
        const pixIdx = (vy * this.cnv.width + vx) * 4;
        let randIdx = pixIdx % data.rand.length;
        let pixVals = getPixelValues(pixIdx, this.vidPixels.data);
        this.cnvPixVals = getPixelValues(pixIdx, this.cnvPixels.data);
        for (let i of filledVisModules) {
          const module = this.currentVisChain[i];
          // include module parameters in arguments
          const kwargs = visParams[i];
          // include common parameters in arguments
          kwargs.vx = vx;
          kwargs.vy = vy;
          kwargs.rand = data.rand[randIdx];
          kwargs.dyn = data.dyn;
          kwargs.audioInfo = data.audioInfo;
          this.visualiserModules[module.name].processPixels(pixIdx, pixVals, kwargs, this);
        }
      }
    }
    this.cnvContext.putImageData(this.cnvPixels, 0, 0);
    for (let i of filledVisModules) {
      const module = this.currentVisChain[i];
      visParams[i] = { ...module.params };
      const kwargs = visParams[i];
      kwargs.dyn = data.dyn;
      // kwargs.audioInfo = this.audioEngine;
      this.visualiserModules[module.name].processFramePost(this.vidPixels.data, kwargs, this);
    }
    this.cnvContext.clearRect(0, 0, this.cnv.width, this.drawStart);
    data.videoFrame.close();
    requestAnimationFrame(() => postMessage({ frameComplete: true }));
  }

  /**
   * Draws the background for the current frame
   */
  drawBackground = async () => {
    // set background
    const { bg_opacity = 255, bg_col = [0, 0, 0] } = this.outputSettings;
    const bgCol = `rgba(${bg_col[0]}, ${bg_col[1]}, ${bg_col[2]}, ${bg_opacity / 255})`;
    // console.log(bgCol)
    this.cnvContext.save();
    this.cnvContext.fillStyle = bgCol;
    this.cnvContext.fillRect(0, this.drawStart, this.cnv.width, this.drawHeight);
    this.cnvContext.restore();
  };
}

const processCanvas = new ProcessCanvas();

onmessage = (e) => {
  switch (e.data.task) {
    case 'setup':
      processCanvas.setup(e.data);
      break;
    case 'draw':
      processCanvas.draw(e.data.data);
      break;
    default:
      const method = processCanvas[e.data.task];
      if (typeof method === 'function') method(e.data.data);
  }
};

export default ProcessCanvas; // used when testing with no workers
