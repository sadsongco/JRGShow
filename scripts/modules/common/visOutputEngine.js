import { setupVisualiserCanvas }                    from "./setupVisualisers.js"
import { importModules }                            from "./importModules.js";
import { dynamicGenerator, pseudoRandomGenerator }  from "../util/generators.js";
import getPixelValues                               from "../util/getPixelValues.js"

/**
 * @class Class that sets up and processes the HTML5 canvas, processing visuals according to the
 * user generated chain of visualisers and their parameters
 */
export const VisOutputEngine = class {
    constructor() {
        this.cnv                = null; // will hold the HTML5 canvas
        this.cnvPixels          = [];   // will hold the pixel array for the canvas
        this.cnvContext         = [];   // will hold the graphics context for the canvas
        this.vidIn              = null; // will hold the video input object
        this.vidCnv             = null; // will hold the HTML5 canvas for reading the video input
        this.vidPixels          = [];   // will hold the pixel array for video input
        this.vidContext         = [];   // will hold the graphics context for the video input
        this.audioIn            = null; // will hold the audio input object
        this.visualiserModules  = {};   // will hold the registered visualiser modules
        this.currentVisChain    = [];   // will hold the chain of visualiser processors
        this.outputSettings     = {};   // will hold the current output settings
        this.frameCount         = 0;    // keep track of the number of frames rendered
        this.prevFramePixels    = [];   // will hold the pixel array of previous frame
        // this.lastFrameTime      = 0;    // keeping track of the last draw time to calculate framerate
        this.frameRate          = 1;    // framerate of visualiser
        this.debug              = true; // show debug info
        this.fr                 = null; // DOM this.cnv for displaying framerate
        this.frametimes         = [];
        this.visContainer       = null;
    }

    /**
     * Setter for this.currentVisChain
     * @param {Array} currentVisChain - objects of visualiser processors
     */
    setCurrentVisChain = (currentVisChain) => {
        this.currentVisChain = currentVisChain;
    }

    /**
     * Setter for this.outputSettings
     * @param {Object} outputSettings
     */
    setOutputSettings = (outputSettings) => {
        this.outputSettings = outputSettings;
    }

    /**
     * Loads all registered visualiser modules as an Object of Classes
     * @returns {Object}
     */
    loadVisModules = async () => {
        this.visualiserModules = await importModules();
        return this.visualiserModules;
    }

    /**
     * Sets up the HTML5 canvas, video input and audio input
     */
    setupCanvas = async () => {
        [this.cnv, this.vidCnv, this.vidIn, this.audioIn] = await setupVisualiserCanvas();
        this.cnvContext = this.cnv.getContext('2d');
        this.vidContext = this.vidCnv.getContext('2d');
        this.outputSettings = { bg_opacity: 255, bg_r: 0, bg_g: 0, bg_b: 0 };
        this.fr = document.getElementById('fr');
        this.visContainer = document.getElementById('outerContainer');
    }

    /**
     * Draw loop - called every frame
     */
    drawCanvas = async () => {
        const drawFrame = async (timestamp) => {
            await this.drawBackground();
            // get dynamic variables
            const dyn = dynamicGenerator(this.frameCount);
            const rand = pseudoRandomGenerator();
            // set params, once per frame, included in processFramePre loop
            const visParams = {}
            for (const module of this.currentVisChain) {
                visParams[module.name] = {...module.params};
                const kwargs = visParams[module.name];
                kwargs.dyn = dyn;
                // kwargs.fft = fft;
                this.visualiserModules[module.name].processFramePre(this.vidIn, kwargs);
            }
            if (this.currentVisChain.length > 0) {
                this.vidContext.drawImage(this.vidIn, 0, 0, this.cnv.width, this.cnv.height);
                this.vidPixels = this.vidContext.getImageData(0, 0, this.cnv.width, this.cnv.height);
                this.cnvPixels = this.cnvContext.getImageData(0, 0, this.cnv.width, this.cnv.height);
                // vidIn.loadPixels();
                for (let vy = 0; vy < this.cnv.height; vy++) {
                    for (let vx = 0; vx < this.cnv.width; vx++) {
                        // console.log('-');
                        const pixIdx = ((vy * this.cnv.width) + vx) * 4;
                        let randIdx = pixIdx % rand.length;
                        let pixVals = getPixelValues(pixIdx, this.vidPixels.data);
                        // console.log(pixVals)
                        // if (pixIdx !== 0) continue;
                        for (const module of this.currentVisChain) {
                            // include module parameters in arguments
                            const kwargs = visParams[module.name];
                            // include common parameters in arguments
                            // kwargs.previewSize = previewSize;
                            // kwargs.fft = fft;
                            kwargs.vx = vx;
                            kwargs.vy = vy;
                            kwargs.rand = rand[randIdx];
                            this.visualiserModules[module.name].processPixels(pixIdx, pixVals, kwargs, this);
                        }
                    }
                }
                this.cnvContext.putImageData(this.cnvPixels, 0, 0);
            }
            
            // this.cnvContext.drawImage(this.vidIn, 0, 0, this.cnv.width, this.cnv.height);
            ++this.frameCount;
            if (this.debug) {
                while (this.frametimes.length > 0 && this.frametimes[0] <= timestamp - 1000)
                    this.frametimes.shift();
                this.frametimes.push(timestamp);
                this.frameRate = this.frametimes.length;
                this.fr.innerText = this.frameRate;
            }
            // if (this.frameCount > 600) return;
            requestAnimationFrame(drawFrame);
        }
        requestAnimationFrame(drawFrame);
    }

    drawBackground = async() => {
            // set background
            const { bg_opacity = 255, bg_r = 0, bg_g = 0, bg_b = 0 } = this.outputSettings;
            const bg_col = `rgba(${bg_r}, ${bg_g}, ${bg_b}, ${bg_opacity})`;
            this.cnvContext.fillStyle = bg_col;
            this.cnvContext.fillRect(0, 0, this.cnv.width, this.cnv.height);
    }

    launchFullscreen() {
        var enabled =
          document.fullscreenEnabled ||
          document.webkitFullscreenEnabled ||
          document.mozFullScreenEnabled ||
          document.msFullscreenEnabled;
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
}