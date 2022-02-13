import { importModules } from '../modules/common/importModules.js';
import { setupVisualiserCanvas } from '../modules/common/setupVisualisers.js';
import { dynamicGenerator, pseudoRandomGenerator } from '../modules/util/generators.js';
import { AudioEngine } from './AudioEngine.js';
import { ExtMediaEngine } from './ExtMediaEngine.js';
import vignetteMask from '../modules/util/vignetteMask.js';
import { TextDisplayEngine } from './TextDisplayEngine.js';

/**
 * @class Class that sets up and processes the HTML5 canvas, processing visuals according to the
 * user generated chain of visualisers and their parameters
 */
export const VisOutputEngine = class {
  /**
   * Initialise class properties
   */
  constructor({ debug = false }) {
    // visualiser settings
    this.currentVisChain = []; // will hold the chain of visualiser processors
    this.vidPos = {}; // for scaling video input
    this.vignetteMask = []; // will hold pixel opacity mask for vignette - global because calculated on whole canvas
    this.previewSize = 1; // relative size of output canvas to desired output size
    // this.extMediaEngine = null; // class instance for managing external media
    this.engines = []; // to hold external class engines for special cases that can't be processed within workers
    this.enginesReady = true; // to stop render when engines are initialising

    // processing
    this.audioAnalysis = []; // will hold frequency and volume analysis for each frame

    // worker settings
    this.numWorkers = 4; // number of Web Workers to spawn
    this.workers = []; // will hold the Web Workers
    this.subcnvs = []; // will hold partial canvases for transferring to workers
    this.subcnvOverlap = 4; // overlap subcanvases for convolution effects
    this.subcnvParams = []; // hold the settings locally for each subcanvas
    this.cnvParams = {}; // equivalent settings for the canvas when rendering in main thread
    this.workerPath = '/scripts/modules/workers/canvasWorker.js';

    // debugging
    this.frameCount = 0; // keep track of the number of frames rendered
    this.frameRate = 1; // framerate of visualiser
    this.debug = debug; // show debug info
    this.frametimes = []; // array of timestamps when frames were drawn
    this.fr = document.getElementById('fr'); // DOM element for displaying framerate
    this.info = document.getElementById('info'); // DOM element for displaying debug info
    if (!this.debug) {
      this.fr.style.visibility = 'hidden';
      this.info.style.visibility = 'hidden';
    }
  }

  /**
   * Setter for this.currentVisChain
   * @param {Array} currentVisChain - objects of visualiser processors
   */
  setCurrentVisChain = (currentVisChain) => {
    // console.log(currentVisChain);
    // const workerVisChain = [...currentVisChain.filter((vis) => vis != undefined)];
    // if (workerVisChain.length > 0) this.doDraw = true;
    // else this.doDraw = false;
    const messageBody = { task: 'setCurrentVisChain', data: currentVisChain };
    this.currentVisChain = currentVisChain;
    for (let i = 0; i < this.numWorkers; i++) {
      this.workers[i].postMessage(messageBody);
    }
  };

  setParameters = (idx, params) => {
    this.currentVisChain[idx].params = params;
    const messageBody = { task: 'setParameters', data: { idx: idx, params: params } };
    for (let i = 0; i < this.numWorkers; i++) {
      this.workers[i].postMessage(messageBody);
    }
  };

  /**
   * Setter for outputSettings
   * @param {Object} outputSettings
   */
  setOutputSettings = (outputSettings) => {
    for (const worker of this.workers) worker.postMessage({ task: 'setOutputSettings', data: outputSettings });
  };

  /**
   * Loads all registered visualiser modules as an Object of Classes
   * @returns {Object}
   */
  loadVisModules = async () => {
    // exposes for the use of creator.js that needs visualiser modules to know their parameters
    return await importModules();
  };

  /**
   * Sets the debug status of the visualiser and updates DOM accordingly
   * @param {Boolean} debug
   */
  setDebug = (debug) => {
    if (debug) {
      this.fr.style.visibility = 'visible';
      this.info.style.visibility = 'visible';
    } else {
      this.fr.style.visibility = 'hidden';
      this.info.style.visibility = 'hidden';
    }
    this.debug = debug;
  };

  /**
   * Add a visualiser to the visualiser chain
   * @param {Object} vis - the visualiser to be added to the visualiser chain
   * @param {Integer} idx - the index in the chain where the visualiser should be added
   */
  addVis = (vis, idx) => {
    this.currentVisChain[idx] = vis;
    this.workers.map((worker) => worker.postMessage({ task: 'setCurrentVisChain', data: this.currentVisChain }));
    switch (vis.name) {
      case 'videoFile':
        // make sure garbage collector cleans up any previous engine instances
        this.engines[idx] = null;
        this.engines[idx] = new ExtMediaEngine(this.numWorkers, this.cnv.width, idx);
        this.enginesReady = false;
        break;
    }
  };

  /**
   * Remove a visuliser from the visualiser chain
   * @param {Integer} idx - the index in the visualiser chain of the visualiser to be removed
   */
  removeVis = (idx) => {
    this.currentVisChain[idx] = null;
    this.engines[idx] = null;
    this.workers.map((worker) => worker.postMessage({ task: 'setCurrentVisChain', data: this.currentVisChain }));
  };

  /**
   * Create and initialiser web workers for drawing the canvas
   * @returns {Promise}
   */
  setupWorkers = async () => {
    // setup workers and subcanvases
    const cnvTarget = document.getElementById('canvasContainer');
    let subCnvStart = 0;
    let subCnvHeight = 0;
    let subCnvDrawStart = 0;
    let subCnvDrawHeight = 0;
    let workerJobs = [];
    for (let i = 0; i < this.numWorkers; i++) {
      // setup workers
      this.workers.push(new Worker(this.workerPath, { type: 'module' }));
      subCnvHeight = (this.cnv.height / this.numWorkers + this.subcnvOverlap) << 0;
      subCnvDrawHeight = subCnvHeight - this.subcnvOverlap + 1;
      if (i !== 0) subCnvHeight += this.subcnvOverlap;
      if (subCnvStart + subCnvHeight > this.cnv.height) subCnvHeight = this.cnv.height - subCnvStart - 1;
      // create DOM canvas
      const subCnv = document.createElement('canvas');
      subCnv.width = this.cnv.width;
      subCnv.height = subCnvHeight;
      const arrayIdxStart = subCnvStart * this.cnv.width;
      const arrayIdxEnd = subCnvStart * this.cnv.width + subCnvHeight * this.cnv.width;
      const subVignette = this.vignetteMask.slice(arrayIdxStart, arrayIdxEnd);
      cnvTarget.appendChild(subCnv);
      subCnv.style.position = 'absolute';
      subCnv.style.left = 0;
      subCnv.style.top = `${subCnvStart}px`;

      // transfer canvas control to worker
      this.subcnvs.push(subCnv.transferControlToOffscreen());
      this.subcnvParams.push({
        start: subCnvStart,
        drawStart: subCnvDrawStart,
        height: subCnvHeight,
        drawHeight: subCnvDrawHeight,
      });
      workerJobs.push(
        this.invokeWorker(
          this.workers[i],
          {
            task: 'setup',
            canvas: this.subcnvs[i],
            start: subCnvStart,
            drawStart: subCnvDrawStart,
            height: subCnvHeight,
            drawHeight: subCnvDrawHeight,
            vignetteMask: subVignette,
            previewSize: this.previewSize,
            numWorkers: this.numWorkers,
          },
          [this.subcnvs[i]]
        )
      );
      // next sub canvas
      subCnvStart = subCnvStart + subCnvHeight - this.subcnvOverlap * 2;
      subCnvDrawStart = this.subcnvOverlap;
    }
    await Promise.all(workerJobs);
    return true;
  };

  /**
   * Sets up the HTML5 canvas, video input and audio input
   */
  setupCanvas = async () => {
    let audioSource;
    [this.cnv, this.vidCnv, this.vidIn, audioSource, this.previewSize] = await setupVisualiserCanvas();
    this.vidPos.scale = Math.min(this.cnv.width / this.vidIn.videoWidth, this.cnv.height / this.vidIn.videoHeight);

    // set up canvas and video contexts
    this.cnvContext = this.cnv.getContext('2d');
    this.vidContext = this.vidCnv.getContext('2d');
    // instantiate hacky global engines for working on the main thread with access to the DOM
    this.textDisplayEngine = new TextDisplayEngine({ numWorkers: this.numWorkers, width: this.cnv.width, height: this.cnv.height });

    // setup audio context and engine
    this.audioContext = new AudioContext();
    this.audioEngine = new AudioEngine(this.audioContext, audioSource);
    await this.audioEngine.init();

    // initialise class scope properties
    this.vignetteMask = await vignetteMask(this.cnv.width, this.cnv.height);

    // setup workers and main thread settings
    await this.setupWorkers();
    this.cnvParams = {
      start: 0,
      drawStart: 0,
      height: this.cnv.height,
      drawHeight: this.cnv.height,
    };

    // initialise output settings and target DOM elements

    this.visContainer = document.getElementById('outerContainer');
    this.visReady = true;
  };

  /**
   * Calls the draw method of a worker, resolves a promise when message recieved from worker
   * @param {Worker} worker - web worker to be invoked
   * @param {Object} context - passed data
   * @param {Array} transfers - array of objects to be transferred to worker scope
   * @returns {Promise}
   */
  invokeWorker = (worker, context, transfers = []) => {
    return new Promise((resolve) => {
      worker.postMessage(context, transfers);
      worker.onmessage = (e) => {
        if (e.data.frameComplete || e.data.setupComplete) resolve(true);
        if (Object.keys(e.data).includes('videoFile')) {
          const URLinput = document.getElementById('videoFile-mediaURL');
          if (e.data.videoFile === false) {
            URLinput.classList.add('invalidURL');
            this.engines[e.data.chainIdx].videoSrc = '';
            console.log(`visOutputEngine calling validURL ${e.data.chainIdx} with false`);
            this.engines[e.data.chainIdx].validURL = false;
            this.enginesReady = false;
            return;
          } else {
            if (this.engines[e.data.chainIdx].videoSrc !== e.data.videoFile) {
              this.engines[e.data.chainIdx].videoSrc = e.data.videoFile;
              console.log(`visOutputEngine calling validURL ${e.data.chainIdx} with true`);
              this.engines[e.data.chainIdx].validURL = true;
              URLinput.classList.remove('invalidURL');
              return;
            }
          }
        }
      };
    });
  };

  getExtFrames = async ({ worker, resizeWidth, resizeHeight }) => {
    let extFrames = [];
    this.engines.map((engine, idx) => {
      if (engine?.videoReady)
        extFrames[idx] = engine.getFrame({
          worker: worker,
          resizeWidth: resizeWidth,
          resizeHeight: resizeHeight,
        });
      else extFrames[idx] = false;
    });
    return await Promise.all(extFrames);
  };

  /**
   * Draw loop - called every frame
   */
  drawCanvas = async () => {
    const drawFrame = async (timestamp) => {
      // console.log(this.engines);
      let enginesReady = true;
      for (let engine of this.engines) {
        if (engine && !engine?.videoReady) enginesReady = false;
      }
      this.enginesReady = enginesReady;
      if (this.visReady) {
        const dyn = dynamicGenerator(this.frameCount);
        const rand = pseudoRandomGenerator();
        this.audioAnalysis = this.audioEngine.getAudioAnalysis();
        this.vidContext.drawImage(this.vidIn, 0, 0, this.cnv.width, this.cnv.height);
        let workerJobs = [];
        for (let i = 0; i < this.numWorkers; i++) {
          const subcnvParams = this.subcnvParams[i];
          const videoPixels = this.vidContext.getImageData(0, subcnvParams.start, this.cnv.width, subcnvParams.height);
          const videoFrame = await createImageBitmap(this.vidIn, 0, (subcnvParams.start + subcnvParams.drawStart) / this.vidPos.scale, this.vidIn.videoWidth, subcnvParams.drawHeight / this.vidPos.scale, {
            resizeWidth: this.cnv.width,
            resizeHeight: subcnvParams.drawHeight,
            resizeQuality: 'low',
          });
          let extVideoFrames;
          if (this.enginesReady)
            extVideoFrames = await this.getExtFrames({
              worker: i,
              resizeWidth: this.cnv.width,
              resizeHeight: subcnvParams.drawHeight,
            });
          workerJobs.push(
            this.invokeWorker(
              this.workers[i],
              {
                task: 'draw',
                data: {
                  index: (this.frameCount + i) % 4,
                  videoFrame: videoFrame,
                  extVideoFrames: extVideoFrames,
                  videoPixels: videoPixels,
                  dyn: dyn,
                  rand: rand,
                  audioInfo: this.audioAnalysis,
                },
              },
              [videoFrame]
            )
          );
        }
        await Promise.all(workerJobs);
      }
      if (this.debug) {
        while (this.frametimes.length > 0 && this.frametimes[0] <= timestamp - 1000) this.frametimes.shift();
        this.frametimes.push(timestamp);
        this.frameRate = this.frametimes.length;
        this.fr.innerText = this.frameRate;
        this.info.innerText = `workers: ${this.numWorkers}
        canvas dimensions ${this.cnv.width} x ${this.cnv.height}
        vis chain length ${this.currentVisChain.length}
        visReady = ${this.visReady}
        enginesReady = ${this.enginesReady}`;
      }
      this.frameCount++;
      // framerate throttle when debugging
      // setTimeout(() => {
      //   requestAnimationFrame(drawFrame);
      // }, 1000 / 1);
      requestAnimationFrame(drawFrame);
    };
    requestAnimationFrame(drawFrame);
  };

  /**
   * Launches fullscreen for visualiser
   */
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

  /**
   * Exits fullscreen for visualiser
   */
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
