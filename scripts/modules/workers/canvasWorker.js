import { importModules } from "../common/importModules.js";
import getPixelValues from "../util/getPixelValues.js";

class ProcessCanvas {
  constructor() {
    this.cnv = null; // will hold this worker's canvas
    this.cnvContext = null; // will hold this worker's canvas context
    this.cnvPixels = []; // will hold pixel array of the canvas for each frame
    // subcanvas parameters passed at instantiation
    this.start = 0; // starting line of subcanvas in main canvas
    this.drawStart = 0; // where to draw the canvas from
    this.height = 0; // height of sub canvas
    this.drawHeight = 0; // how many rows of pixels to draw
    // local copies of global parameters
    this.outputSettings = {};
    // class variables
    this.visualiserModules = {}; // will hold the registered visualiser modules
    this.currentVisChain = []; // will hold the chain of visualiser processors
    this.outputSettings = {}; // will hold the current output settings
  }

  /**
   * Setter for this.currentVisChain
   * @param {Array} currentVisChain - objects of visualiser processors
   */
  setCurrentVisChain = (currentVisChain) => {
    this.currentVisChain = currentVisChain;
  };

  /**
   * Setter for this.outputSettings
   * @param {Object} outputSettings
   */
  setOutputSettings = (outputSettings) => {
    this.outputSettings = outputSettings;
  };

  async setup(data) {
    // register worker subcanvas and details
    this.start = data.start;
    this.drawStart = data.drawStart;
    this.height = data.height;
    this.drawHeight = data.drawHeight;
    this.cnv = data.canvas;
    this.cnvContext = this.cnv.getContext('2d');
    // initialise output settings
    this.outputSettings = { bg_opacity: 255, bg_col: [0, 0, 0] };
    // collect registered visualiser modules
    this.visualiserModules = await importModules();
  }

  draw(data) {
    this.drawBackground();
    // set params, once per frame, included in processFramePre loop
    const visParams = {};
    for (const module of this.currentVisChain) {
      visParams[module.name] = { ...module.params };
      const kwargs = visParams[module.name];
      kwargs.dyn = data.dyn;
      // kwargs.audioInfo = this.audioEngine;
      this.visualiserModules[module.name].processFramePre(data.videoFrame, kwargs, this);
    }
      this.vidPixels = data.videoPixels;
      this.cnvPixels = this.cnvContext.getImageData(0, 0, this.cnv.width, this.cnv.height);
      for (let vy = 0; vy < this.cnv.height; vy++) {
        for (let vx = 0; vx < this.cnv.width; vx++) {
          const pixIdx = (vy * this.cnv.width + vx) * 4;
          let randIdx = pixIdx % data.rand.length;
          let pixVals = getPixelValues(pixIdx, this.vidPixels.data);
          for (const module of this.currentVisChain) {
            // include module parameters in arguments
            const kwargs = visParams[module.name];
            // include common parameters in arguments
            kwargs.vx = vx;
            kwargs.vy = vy;
            kwargs.rand = data.rand[randIdx];
            // kwargs.audioInfo = this.audioEngine;
            this.visualiserModules[module.name].processPixels(pixIdx, pixVals, kwargs, this);
          }
        }
      }
      this.cnvContext.putImageData(this.cnvPixels, 0, 0);
      for (const module of this.currentVisChain) {
        visParams[module.name] = { ...module.params };
        const kwargs = visParams[module.name];
        kwargs.dyn = data.dyn;
        // kwargs.audioInfo = this.audioEngine;
        this.visualiserModules[module.name].processFramePost(this.vidPixels.data, kwargs, this);
      }
      data.videoFrame.close();
    // }
    // this.tmpOutputTest(data);
    requestAnimationFrame(()=>postMessage('frameComplete'));
  }
  
  tmpOutputTest(kwargs) {
    switch (parseInt(kwargs.index) % 4) {
      case 0:
        this.cnvContext.fillStyle = `rgba(255, 0, 0, 0.5)`;
        break;
      case 1:
        this.cnvContext.fillStyle = `rgba(0, 255, 0, 0.5)`;
        break;
      case 2:
        this.cnvContext.fillStyle = `rgba(0, 0, 255, 0.5)`;
        break;
      case 3:
        this.cnvContext.fillStyle = `rgba(255, 255, 0, 0.5)`;
        break;
    }
  
    this.cnvContext.fillRect(0, this.drawStart, this.cnv.width, this.drawHeight);
    // this.cnvContext.fillRect(0, 0, this.cnv.width, this.height);
  }

  drawBackground = async () => {
    // set background
    const { bg_opacity = 255, bg_col = [0, 0, 0] } = this.outputSettings;
    const bgCol = `rgba(${bg_col[0]}, ${bg_col[1]}, ${bg_col[2]}, ${bg_opacity / 255})`;
    // console.log(bgCol)
    this.cnvContext.save();
    this.cnvContext.fillStyle = bgCol;
    this.cnvContext.fillRect(0, this.drawStart, this.cnv.width, this.drawHeight);
    // this.cnvContext.clearRect(0, this.drawStart, this.cnv.width, this.cnv.drawHeight);
    this.cnvContext.restore();
  };
}

const processCanvas = new ProcessCanvas();

onmessage = (e) => {
  switch (e.data.task) {
    case "setup":
      processCanvas.setup(e.data);
      break;
    case "draw":
      processCanvas.draw(e.data.data);
      break;
    // case "setOutputSettings":
    //   processCanvas.setOutputSettings(e.data.data);
    //   break;
    // case "setCurrentVisChain":
    //   processCanvas.setCurrentVisChain(e.data.data);
    //   break;
    default:
      const method = processCanvas[e.data.task];
      if (typeof method === 'function') method(e.data.data);
  }
};

export default ProcessCanvas;