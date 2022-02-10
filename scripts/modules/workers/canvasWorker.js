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
    this.numWorkers = 0; // total number of workers in use by the app, to calculate canvas sizes

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
    currentVisChain.map((vis, idx) => {
      if (vis) this.instantiateVis(vis, idx);
    });
    this.visChainLength = this.currentVisChain.length;
  };

  addVis = ({ vis, idx }) => {
    this.instantiateVis(vis, idx);
  };

  instantiateVis = (vis, idx) => {
    this.currentVisChain[idx] = new this.visualiserModules[vis.name][vis.name]();
    this.currentVisChain[idx].params = vis.params;

    if (this.currentVisChain[idx].setup) {
      this.currentVisChain[idx].setup({
        cnv: { width: this.cnv.width, height: this.cnv.height },
        numWorkers: this.numWorkers,
        previewSize: this.previewSize,
      });
      if (this.currentVisChain[idx].setPixelArraySize) this.currentVisChain[idx].setPixelArraySize(this.cnv.width * this.cnv.height);
      if (this.currentVisChain[idx].setVignetteMask) this.currentVisChain[idx].setVignetteMask(this.vignetteMask);
    }
  };
  /**
   * Update parameters of visualiser in the chain
   * @param {Object} params - index of visualiser in chain to update, parameters
   */
  setParameters = ({ idx, params }) => {
    this.currentVisChain[idx].params = params;
  };

  updateVisData = ({ idx, data }) => {
    this.currentVisChain[idx].updateData(idx, data);
  };

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
    this.vignetteMask = data.vignetteMask;
    this.numWorkers = data.numWorkers;
    // initialise output settings
    this.outputSettings = { bg_opacity: 255, bg_col: [0, 0, 0] };
    // collect registered visualiser modules
    this.visualiserModules = await importModules();
    postMessage({ setupComplete: true });
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
    });
    // set params, once per frame, included in processFramePre loop
    const visParams = [];
    for (let i of filledVisModules) {
      const currVis = this.currentVisChain[i];
      visParams[i] = { ...currVis.params };
      const kwargs = visParams[i];
      kwargs.idx = i;
      kwargs.dyn = data.dyn;
      kwargs.audioInfo = data.audioInfo;
      if (data.extVideoFrames) {
        kwargs.extVideoFrame = data.extVideoFrames[i];
      }
      currVis.processFramePre(data.videoFrame, kwargs, this);
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
          const currVis = this.currentVisChain[i];
          // include module parameters in arguments
          const kwargs = {};
          Object.assign(kwargs, currVis.params);
          // include common parameters in arguments
          kwargs.vx = vx;
          kwargs.vy = vy;
          kwargs.rand = data.rand[randIdx];
          kwargs.dyn = data.dyn;
          kwargs.audioInfo = data.audioInfo;
          currVis.processPixels(pixIdx, pixVals, kwargs, this);
        }
      }
    }
    this.cnvContext.putImageData(this.cnvPixels, 0, 0);
    for (let i of filledVisModules) {
      const currVis = this.currentVisChain[i];
      visParams[i] = { ...currVis.params };
      const kwargs = visParams[i];
      kwargs.dyn = data.dyn;
      // kwargs.audioInfo = this.audioEngine;
      currVis.processFramePost(this.vidPixels.data, kwargs, this);
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
