import { importModules } from "./importModules.js";
import { setupVisualiserCanvas } from "./setupVisualisers.js";
import ProcessCanvas from "../workers/canvasWorker.js";

/**
 * @class Class that sets up and processes the HTML5 canvas, processing visuals according to the
 * user generated chain of visualisers and their parameters
 */
export const VisOutputEngine = class {
  constructor() {
    // visualiser settings
    this.currentVisChain = []; // will hold the chain of visualiser processors
    this.outputSettings = {}; // will hold the current output settings
    this.vidPos = {}; // for scaling video input
    this.fps = 10; // target fps for the visualiser

    // processing
    this.processCanvas = null; // will hold an instance of the ProcessCanvas class for the main thread

    // worker settings
    this.numWorkers = 2; // number of Web Workers to spawn
    this.workers = []; // will hold the Web Workers
    this.subcnvs = []; // will hold partial canvases for transferring to workers
    this.subcnvOverlap = 0; // overlap subcanvases for convolution effects
    this.subcnvParams = []; // hold the settings locally for each subcanvas
    this.cnvParams = {}; // equivalent settings for the canvas when rendering in main thread
    this.workerPath = '/scripts/modules/workers/canvasWorker.js';

    // debugging
    this.frameCount = 0; // keep track of the number of frames rendered
    this.frameRate = 1; // framerate of visualiser
    this.debug = true; // show debug info
    this.fr = null; // DOM this.cnv for displaying framerate
    this.frametimes = []; // array of timestamps when frames were drawn    
  }

  /**
   * Setter for this.currentVisChain
   * @param {Array} currentVisChain - objects of visualiser processors
   */
  setCurrentVisChain = (currentVisChain) => {
    this.currentVisChain = currentVisChain;
    if (this.processCanvas)
      this.processCanvas.setCurrentVisChain(currentVisChain);
    for (let i = 0; i < this.numWorkers; i++) {
      this.workers[i].postMessage({ task: 'setCurrentVisChain', data: currentVisChain });
    }
  };

  /**
   * Setter for this.outputSettings
   * @param {Object} outputSettings
   */
  setOutputSettings = (outputSettings) => {
    this.outputSettings = outputSettings;
    if (this.processCanvas)
      this.processCanvas.setOutputSettings(outputSettings);
    for (const worker of this.workers) worker.postMessage({ task: 'setOutputSettings', data: outputSettings });
  };

  /**
   * Loads all registered visualiser modules as an Object of Classes
   * @returns {Object}
   */
  loadVisModules = async () => {
    this.visualiserModules = await importModules();
    return this.visualiserModules;
  };

  setupWorkers = async () => {
    // setup workers and subcanvases
    const cnvTarget = document.getElementById('canvasContainer');
    let subCnvStart = 0;
    let subCnvHeight = 0;
    let subCnvDrawStart = 0;
    let subCnvDrawHeight = 0;
    for (let i = 0; i < this.numWorkers; i++) {
      // setup workers
      this.workers.push(new Worker(this.workerPath, { type: 'module' }));
      subCnvHeight = (this.cnv.height / this.numWorkers + this.subcnvOverlap) << 0;
      subCnvDrawHeight = subCnvHeight - this.subcnvOverlap + 1;
      if (i !== 0) subCnvHeight += this.subcnvOverlap;
      if (subCnvStart + subCnvHeight > this.cnv.height) subCnvHeight = this.cnv.height - subCnvStart;
      // create DOM canvas
      const subCnv = document.createElement('canvas');
      subCnv.width = this.cnv.width;
      subCnv.height = subCnvHeight;
      cnvTarget.appendChild(subCnv);
      subCnv.style.position = 'absolute';
      subCnv.style.left = 0;
      subCnv.style.top = `${subCnvStart}px`;
      // subCnv.style.backgroundColor = "rgba(255, 255, 255, 0.5)";
      // subCnv.style.borderTop = "1px solid white";
      // transfer canvas control to worker
      this.subcnvs.push(subCnv.transferControlToOffscreen());
      this.subcnvParams.push({
        start: subCnvStart,
        drawStart: subCnvDrawStart,
        height: subCnvHeight,
        drawHeight: subCnvDrawHeight,
      });
      this.workers[i].postMessage(
        {
          task: 'setup',
          canvas: this.subcnvs[i],
          start: subCnvStart,
          drawStart: subCnvDrawStart,
          height: subCnvHeight,
          drawHeight: subCnvDrawHeight,
        },
        [this.subcnvs[i]]
      );
      // next sub canvas
      subCnvStart = 1 + subCnvStart + subCnvHeight - this.subcnvOverlap * 2;
      subCnvDrawStart = this.subcnvOverlap;
    }
  };

  /**
   * Sets up the HTML5 canvas, video input and audio input
   */
  setupCanvas = async () => {
    let audioSource;
    [this.cnv, this.vidCnv, this.vidIn, audioSource] = await setupVisualiserCanvas();
    this.vidPos.scale = Math.min(this.cnv.width / this.vidIn.videoWidth, this.cnv.height / this.vidIn.videoHeight);
    this.vidPos.xInset = ((this.cnv.width - this.vidIn.videoWidth * this.vidPos.scale) / 2) << 0;
    this.vidPos.yInset = ((this.cnv.height - this.vidIn.videoHeight * this.vidPos.scale) / 2) << 0;

    // set up canvas and video contexts
    this.cnvContext = this.cnv.getContext('2d');
    this.vidContext = this.vidCnv.getContext('2d');

    // setup workers and main thread settings
    await this.setupWorkers();
    this.cnvParams = {
      start: 0,
      drawStart: 0,
      height: this.cnv.height,
      drawHeight: this.cnv.height,
    };

    // setup main thread processor
    this.processCanvas = new ProcessCanvas();
    let processCanvasData = {
      start: 0,
      drawStart: 0,
      height: this.cnv.height,
      drawHeight: this.cnv.height,
      canvas: this.cnv,
    };
    this.processCanvas.setup(processCanvasData);

    // initialise output settings and target DOM elements
    this.outputSettings = { bg_opacity: 255, bg_col: [0, 0, 0] };
    this.fr = document.getElementById('fr');
    this.visContainer = document.getElementById('outerContainer');
    this.visReady = true;
  };

  /**
   * Draw loop - called every frame
   */
  drawCanvas = async () => {
    const drawFrame = async (timestamp) => {
      if (this.visReady && this.currentVisChain.length > 0) {
        this.vidContext.drawImage(this.vidIn, 0, 0, this.cnv.width, this.cnv.height);
        if (this.numWorkers === 0) {
          const subcnvParams = this.cnvParams;
          const videoPixels = this.vidContext.getImageData(0, subcnvParams.start, this.cnv.width, subcnvParams.height);
          const videoFrame = await createImageBitmap(this.vidIn, 0, (subcnvParams.start + subcnvParams.drawStart) / this.vidPos.scale, this.cnv.width / this.vidPos.scale, subcnvParams.drawHeight / this.vidPos.scale);
          let kwargs = {
            index: this.frameCount % 4,
            videoFrame: videoFrame,
            videoPixels: videoPixels,
          };
          this.processCanvas.draw(kwargs);
        } else {
          for (let i = 0; i < this.numWorkers; i++) {
            const subcnvParams = this.subcnvParams[i];
            const videoPixels = this.vidContext.getImageData(0, subcnvParams.start, this.cnv.width, subcnvParams.height);
            const videoFrame = await createImageBitmap(this.vidIn, 0, (subcnvParams.start + subcnvParams.drawStart) / this.vidPos.scale, this.cnv.width / this.vidPos.scale, subcnvParams.drawHeight / this.vidPos.scale);
            this.workers[i].postMessage(
              {
                task: 'draw',
                data: {
                  index: (this.frameCount + i) % 4,
                  videoFrame: videoFrame,
                  videoPixels: videoPixels,
                },
              },
              [videoFrame]
            );
          }
        }
      }
      // crude throttling for debugging https://stackoverflow.com/questions/19764018/controlling-fps-with-requestanimationframe
      // setTimeout(() => {
      //   this.frameCount++;
      //   if (this.debug) {
      //     while (this.frametimes.length > 0 && this.frametimes[0] <= timestamp - 1000) this.frametimes.shift();
      //     this.frametimes.push(timestamp);
      //     this.frameRate = this.frametimes.length;
      //     this.fr.innerText = this.frameRate;
      //   }
      //   requestAnimationFrame(drawFrame);
      // }, 1000 / this.fps);
      if (this.debug) {
        while (this.frametimes.length > 0 && this.frametimes[0] <= timestamp - 1000) this.frametimes.shift();
        this.frametimes.push(timestamp);
        this.frameRate = this.frametimes.length;
        this.fr.innerText = this.frameRate;
      }
      requestAnimationFrame(drawFrame);
    };
    requestAnimationFrame(drawFrame);
  };
    
  launchFullscreen() {
    const enabled = document.fullscreenEnabled || document.webkitFullscreenEnabled || document.mozFullScreenEnabled || document.msFullscreenEnabled;
    if (!enabled) {
      throw new Error('Fullscreen not enabled in this browser.');
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

