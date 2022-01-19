import { setupVisualiserCanvas } from "./setupVisualisers.js";
import { AudioEngine } from "./audioEngine.js";
import { importModules } from "./importModules.js";
import { dynamicGenerator, pseudoRandomGenerator } from "../util/generators.js";
import getPixelValues from "../util/getPixelValues.js";


/**
 * @class Class that sets up and processes the HTML5 canvas, processing visuals according to the
 * user generated chain of visualisers and their parameters
 */
export const VisOutputEngine = class {
  constructor() {
    this.frameCount = 0;
    this.workers = [];
    this.workerContext = {};
  }
  
  /**
   * Setter for this.currentVisChain
   * @param {Array} currentVisChain - objects of visualiser processors
   */
  setCurrentVisChain = (currentVisChain) => {
    this.currentVisChain = currentVisChain;
    this.workerContext.currentVisChain = currentVisChain;
  };
  
  /**
   * Setter for this.outputSettings
   * @param {Object} outputSettings
   */
  setOutputSettings = (outputSettings) => {
    this.outputSettings = outputSettings;
  };
  
  /**
   * Loads all registered visualiser modules as an Object of Classes
   * @returns {Object}
   */
  loadVisModules = async () => {
    this.visualiserModules = await importModules();
    return this.visualiserModules;
  };
  
  /**
   * Sets up the HTML5 canvas, video input and audio input
   */
  setupCanvas = async () => {
    let audioSource;
    [this.cnv, this.vidCnv, this.vidIn, audioSource] = await setupVisualiserCanvas();
    // set up canvas and video contexts
    this.cnvContext = this.cnv.getContext("2d");
    this.vidContext = this.vidCnv.getContext("2d");
    
    // initialise output settings and target DOM elements
    this.outputSettings = { bg_opacity: 255, bg_col: [0, 0, 0] };
    this.fr = document.getElementById("fr");
    this.visContainer = document.getElementById("outerContainer");
    
    // initialise web workers
    this.len = this.cnv.width * this.cnv.height * 4;
    this.workersCount = 4;
    this.segmentLength = this.len / this.workersCount;
    this.blockSize = this.cnv.height / this.workersCount << 0;
    console.log(this.blockSize)
    for (let i = 0; i < this.workersCount; i++) {
      this.workers.push(new Worker('/scripts/modules/workers/testWorker.js', { type: 'module'}));
    }
  };
  
  invokeWorker = (worker, context) => {
    return new Promise((resolve) => {
      worker.postMessage(context);
      worker.onmessage = (e) => {
        resolve(this.onWorkEnded(e));
      };
    });
  };

  onWorkEnded = (e) => {
    const canvasData = e.data.result;
    const index = e.data.index;
    this.cnvContext.putImageData(canvasData, 0, this.blockSize * index);

    this.finished++;
    if (this.finished === this.workersCount) {
      // console.log('frame finished');
      // console.log(canvasData);
    }
  }

  setPrevCnvFrames = (sourceContext) => {
    const prevCnvFrames = [];
    for (let i in this.workers) {
      prevCnvFrames.push(sourceContext.getImageData(0, this.blockSize * i, this.cnv.width, this.blockSize));
    }
    return prevCnvFrames;
  }


  
  /**
   * Draw loop - called every frame
   */
  drawCanvas = async () => {
    const drawFrame = async (prevCnvFrames, timestamp) => {
      this.vidContext.drawImage(this.vidIn, 0, 0, this.cnv.width, this.cnv.height);
      // this.vidFrame = this.vidContext.getImageData(0, 0, this.cnv.width, this.cnv.height);
      if (!prevCnvFrames) prevCnvFrames = this.setPrevCnvFrames(this.cnvContext);
      // clear canvas according to output settings
      // this.drawBackground();
  
      // this.workerContext.vidFrame = this.vidContext.getImageData(0, 0, this.cnv.width, this.cnv.height);
      // this.workerContext.cnvFrame = this.cnvContext.getImageData(0, 0, this.cnv.width, this.cnv.height);
      // this.workerContext.visParams = visParams;
      // this.cnvContext.putImageData(this.vidFrame, 0, 100);
  
      // prepare workers
      this.finished = 0;
      // this.cnvContext.drawImage(this.vidIn, 0, 0, this.cnv.width, this.cnv.height);
      let workerJobs = [];
      for (let i in this.workers) {
        const videoFrame = this.vidContext.getImageData(0, this.blockSize * i, this.cnv.width, this.blockSize);
        workerJobs.push(this.invokeWorker(this.workers[i], {
          videoFrame: videoFrame,
          prevCnvFrame: prevCnvFrames[i],
          outputSettings: this.outputSettings,
          index: i, length: this.segmentLength}));
        // this.workers[i].postMessage({ data: canvasData, index: i, length: this.segmentLength});
      }
      await Promise.all(workerJobs);
      const currCnvFrames = this.setPrevCnvFrames(this.cnvContext);
      requestAnimationFrame(()=>drawFrame(currCnvFrames, +new Date()));
      // this.frameCount ++;
      // if (this.frameCount > 60) return;
  
      
    };
		requestAnimationFrame(()=>drawFrame(false, +new Date()));
	};

  drawBackground = () => {
    // set background
    const { bg_opacity = 255, bg_col = [0, 0, 0] } = this.outputSettings;
    const bgCol = `rgba(${bg_col[0]}, ${bg_col[1]}, ${bg_col[2]}, ${bg_opacity / 255})`;
    // const bgCol = 'rgba(0, 0, 0, 1)';
    this.cnvContext.save();
    this.cnvContext.fillStyle = bgCol;
    this.cnvContext.fillRect(0, 0, this.cnv.width, this.cnv.height);
    // this.cnvContext.clearRect(0, 0, this.cnv.width, this.cnv.height);
    this.cnvContext.restore();
    return true
  };

  launchFullscreen() {
    const enabled =
      document.fullscreenEnabled ||
      document.webkitFullscreenEnabled ||
      document.mozFullScreenEnabled ||
      document.msFullscreenEnabled;
    if (!enabled) {
      throw new Error("Fullscreen not enabled in this browser.");
    }
    if (this.visContainer.requestFullscreen) {
      this.visContainer.requestFullscreen();
    } else if (this.visContainer.mozRequestFullScreen) {
      this.visContainer.mozRequestFullScreen();
    } else if (this.visContainer.webkitRequestFullscreen) {
      this.visContainer.webkitRequestFullscreen();
    } else if (this.visContainer.msRequestFullscreen) {
      this.visContainer.msRequestFullscreen();
    }
  }

  exitFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  }
};
