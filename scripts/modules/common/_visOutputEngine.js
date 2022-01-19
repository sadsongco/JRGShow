import { setupVisualiserCanvas } from "./setupVisualisers.js";
import { AudioEngine } from "./audioEngine.js";
import { importModules } from "./importModules.js";
import { dynamicGenerator, pseudoRandomGenerator } from "../util/generators.js";
import getPixelValues from "../util/getPixelValues.js";

const invokeWorker = (worker, context) => {
  return new Promise((resolve) => {
    worker.postMessage(context);
    worker.onmessage = (e) => {
      resolve(e.data);
    };
  });
};

/**
 * @class Class that sets up and processes the HTML5 canvas, processing visuals according to the
 * user generated chain of visualisers and their parameters
 */
export const VisOutputEngine = class {
  constructor() {
    this.visContainer = null; // DOM element containing canvas
    this.cnv = null; // will hold the HTML5 canvas
    this.cnvFrame = []; // will hold the pixel array for the canvas
    this.cnvContext = []; // will hold the graphics context for the canvas
    this.vidIn = null; // will hold the video input object
    this.vidCnv = null; // will hold the HTML5 canvas for reading the video input
    this.vidFrame = []; // will hold the pixel array for video input
    this.vidContext = []; // will hold the graphics context for the video input
    this.audioEngine = null;
    this.audioContext = null; // will hold the class audio context
    this.visualiserModules = {}; // will hold the registered visualiser modules
    this.currentVisChain = []; // will hold the chain of visualiser processors
    this.outputSettings = {}; // will hold the current output settings
    this.frameCount = 0; // keep track of the number of frames rendered
    this.prevFramePixels = false; // will hold the pixel array of previous frame
    this.frameRate = 1; // framerate of visualiser
    this.debug = true; // show debug info
    this.fr = null; // DOM this.cnv for displaying framerate
    this.frametimes = []; // array of timestamps when frames were drawn
    this.workerContext = {}; // object with necessary context to pass to pixel workers
    const numWorkers = 1;
    this.pixelWorkers = [];
    for (let w = 0; w < numWorkers; w++) {
      this.pixelWorkers.push(
        new Worker("/scripts/modules/workers/testWorker.js", { type: "module" })
      );
    }
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
    [this.cnv, this.vidCnv, this.vidIn, audioSource] =
      await setupVisualiserCanvas();
    // this.workerContext.cnv = {};
    // this.workerContext.cnv.width = this.cnv.width;
    // this.workerContext.cnv.height = this.cnv.height;
    // set up canvas and video contexts
    this.cnvContext = this.cnv.getContext("2d");
    this.vidContext = this.vidCnv.getContext("2d");

    // setup audio context and engine
    this.audioContext = new AudioContext();
    this.audioEngine = new AudioEngine(this.audioContext, audioSource);
    await this.audioEngine.init();
    // initialise output settings and target DOM elements
    this.outputSettings = { bg_opacity: 255, bg_col: [0, 0, 0] };
    this.fr = document.getElementById("fr");
    this.visContainer = document.getElementById("outerContainer");
  };

  /**
   * Draw loop - called every frame
   */
	drawCanvas = async () => {
		// console.log('enter drawCanvas');
		const drawFrame = async (timestamp) => {
			// console.log('Enter drawFrame')
			// await this.drawBackground();
      // this.cnvContext.clearRect(0, 0, this.cnv.width, this.cnv.height);
			// get dynamic and modulation variables
			const dyn = dynamicGenerator(this.frameCount);
			const rand = pseudoRandomGenerator();
			this.workerContext.dyn = dyn;
			this.workerContext.rand = rand;
			// this.audioEngine.getAudioAnalysis();
			// this.audioEngine.draw(this.cnvContext, this.cnv);
			// set params, once per frame, included in processFramePre loop
			const visParams = {};
			for (const module of this.currentVisChain) {
				visParams[module.name] = { ...module.params };
				// const kwargs = visParams[module.name];
				// kwargs.dyn = dyn;
				// kwargs.audioInfo = this.audioEngine;
				// this.visualiserModules[module.name].processFramePre(
				// 	this.vidIn,
				// 	kwargs,
				// 	this
				// );
			}
      // if (this.currentVisChain.length > 0) {
        this.currentVisChain.map(visObj => {
        // if (this.frameCount % 40 === 0) console.log(this.currentVisChain)
        this.vidContext.drawImage(this.vidIn, 0, 0, this.cnv.width, this.cnv.height);
        this.workerContext.vidFrame = this.vidContext.getImageData(0, 0, this.cnv.width, this.cnv.height);
        this.workerContext.cnvFrame = this.cnvContext.getImageData(0, 0, this.cnv.width, this.cnv.height);
				this.workerContext.visParams = visParams;
        // for (let vy = 0; vy < this.workerContext.vidFrame.height; vy++) {
          //   for (let vx = 0; vx < this.workerContext.vidFrame.width; vx++) {
            //     const pixIdx = ((vy * this.workerContext.vidFrame.width) + vx) * 4;
            //     const pixVals = getPixelValues(pixIdx, this.workerContext.vidFrame.data)
            //     this.visualiserModules['bitwiseN'].processPixels(pixIdx, pixVals, {}, this.workerContext)
            //     // this.workerContext.cnvFrame.data[pixIdx+0] = iR >> 2;
            //     // this.workerContext.cnvFrame.data[pixIdx+1] = iG;
            //     // this.workerContext.cnvFrame.data[pixIdx+2] = iB;
            //   }
            // }
            // await this.processPixels();
            this.drawBackground()
            .then((res) => invokeWorker(this.pixelWorkers[0], this.workerContext))
            .then((data)=>{
              console.log(data.data);
              this.cnvContext.putImageData(data, 0, 0)
            })
        // this.workerContext.cnvFrame = await invokeWorker(this.pixelWorkers[0], this.workerContext);
        // this.cnvContext.putImageData(this.workerContext.cnvFrame, 0, 0);
        if (!this.pixelInitialFrame) this.pixelInitialFrame = this.frameCount;
        if (this.frameCount - this.pixelInitialFrame > 10) return;
      })

			
			// if (this.currentVisChain.length > 0) {
			// 	this.vidContext.drawImage(this.vidIn, 0, 0, this.cnv.width, this.cnv.height);
			// 	this.workerContext.vidFrame = this.vidContext.getImageData(0, 0, this.cnv.width, this.cnv.height);
			// 	this.workerContext.cnvFrame = this.cnvContext.getImageData(0, 0, this.cnv.width, this.cnv.height);
			// 	this.workerContext.visParams = visParams;
			// 	const pixelWorkers = [];
			// 	for (const worker of this.pixelWorkers) {
			// 		pixelWorkers.push(invokeWorker(worker, this.workerContext));
			// 	}
			// 	const returnVals = await Promise.all(pixelWorkers);
			// 	this.cnvContext.putImageData(...returnVals, 0, 0);
			// 	for (const module of this.currentVisChain) {
			// 		visParams[module.name] = { ...module.params };
			// 		const kwargs = visParams[module.name];
			// 		kwargs.dyn = dyn;
			// 		kwargs.audioInfo = this.audioEngine;
			// 		this.visualiserModules[module.name].processFramePost(
			// 			this.workerContext,
			// 			kwargs,
			// 		);
			// 	}
      //   this.workerContext.prevFrame = this.workerContext.vidFrame;
			// 	// return;
			// }

			// this.cnvContext.drawImage(this.vidIn, 0, 0, this.cnv.width, this.cnv.height);
			++this.frameCount;
			if (this.debug) {
				while (this.frametimes.length > 0 && this.frametimes[0] <= timestamp - 1000)
					this.frametimes.shift();
				this.frametimes.push(timestamp);
				this.frameRate = this.frametimes.length;
				this.fr.innerText = this.frameRate;
			}
			// if (this.frameCount > 200) return;
			// console.log('exit draw frame');
			requestAnimationFrame(drawFrame);
		};
		requestAnimationFrame(drawFrame);
	};

  drawBackground = async () => {
    // set background
    const { bg_opacity = 255, bg_col = [0, 0, 0] } = this.outputSettings;
    const bgCol = `rgba(${bg_col[0]}, ${bg_col[1]}, ${bg_col[2]}, ${bg_opacity / 255})`;
    // const bgCol = 'rgba(0, 0, 0, 1)';
    this.cnvContext.save();
    // this.cnvContext.fillStyle = bgCol;
    // this.cnvContext.fillRect(0, 0, this.cnv.width, this.cnv.height);
    this.cnvContext.clearRect(0, 0, this.cnv.width, this.cnv.height);
    this.cnvContext.restore();
    return true
  };

  processPixels = async () => {
    for (let vy = 0; vy < this.workerContext.vidFrame.height; vy++) {
      for (let vx = 0; vx < this.workerContext.vidFrame.width; vx++) {
        const pixIdx = ((vy * this.workerContext.vidFrame.width) + vx) * 4;
        const pixVals = getPixelValues(pixIdx, this.workerContext.vidFrame.data)
        let [ iR, iG, iB ] = pixVals;
        const kwargs = this.workerContext.visParams['bitwiseN'];
        // include common parameters in arguments
        kwargs.vx = vx;
        kwargs.vy = vy;
        // this.visualiserModules['bitwiseN'].processPixels(pixIdx, pixVals, kwargs, this.workerContext)
        this.workerContext.cnvFrame.data[pixIdx+0] = iR >> 2;
        this.workerContext.cnvFrame.data[pixIdx+1] = iG;
        this.workerContext.cnvFrame.data[pixIdx+2] = iB;
        this.workerContext.cnvFrame.data[pixIdx+3] = 255;
      }
    }
    return Promise.resolve(true);   
  }

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
