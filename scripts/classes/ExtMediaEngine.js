/**
 * @class Class that manages external media files
 * Necessary because Web Workers can't get video frames
 * https://stackoverflow.com/questions/64560612/createelement-for-read-only-in-web-worker
 */
export const ExtMediaEngine = class {
  /**
   * Initialise video parameters and set event listeners for loading of source video
   * @param {Object<Integer, Integer>} params - total number of subcanvases and the master canvas width
   */
  constructor(numWorkers, targetWidth, idx) {
    this.idx = idx;
    this.videoEl = document.createElement('video'); // DOM element to hold external video
    this.videoEl.setAttribute('preload', 'auto');
    this.videoEl.setAttribute('loop', 'loop');
    this.videoEl.setAttribute('muted', 'true');
    this.validMedia = false; // public variable showing whether there is a viable external media source
    this.metaDataLoaded = false;
    this.videoReady = false;
    this.numWorkers = numWorkers;
    this.targetWidth = targetWidth;
    this.subCnvHeight = 0;
    this.videoEl.addEventListener(
      'loadedmetadata',
      (e) => {
        e.target.width = e.target.videoWidth;
        e.target.height = e.target.videoHeight;
        this.subCnvHeight = (e.target.videoHeight / this.numWorkers) << 0;
        this.metaDataLoaded = true;
      },
      false
    );
    this.videoEl.addEventListener(
      'canplay',
      (e) => {
        if (this.validMedia && this.metaDataLoaded) this.videoReady = true;
      },
      false
    );
  }

  /**
   * Getter for video source
   */
  get videoSrc() {
    return this.videoEl.getAttribute('src');
  }

  /**
   * Setter for video source
   */
  set videoSrc(url) {
    this.videoReady = false;
    this.videoEl.setAttribute('src', url);
  }

  /**
   * Getter for video dimensions
   */
  get dimensions() {
    return { width: this.videoEl.videoWidth, height: this.videoEl.videoHeight };
  }

  /**
   * Setter for if the video source exists
   */
  set validURL(val) {
    // https://developers.google.com/web/updates/2017/06/play-request-was-interrupted
    console.log(`validURL engine ${this.idx}, ${val}`);
    this.validMedia = val;
    if (this.validMedia) {
      let playPromise = this.videoEl.play();
      if (playPromise !== undefined) {
        playPromise.then((_) => {
          this.videoReady = true;
        });
      }
    } else this.videoEl.pause();
  }

  /**
   * Gets the current video frame to pass to web worker for drawing to canvas
   * @param {Object} params
   * @returns {Promise<ImageBitmap>}
   */
  getFrame = async function ({ worker, resizeWidth, resizeHeight }) {
    // console.log(worker, resizeWidth, resizeHeight);
    // console.log(this.videoSrc);
    // console.log(this.videoReady);
    if (this.videoReady) {
      const vid = await createImageBitmap(this.videoEl, 0, worker * this.subCnvHeight, this.videoEl.videoWidth, this.subCnvHeight, {
        resizeWidth: resizeWidth,
        resizeHeight: resizeHeight,
        resizeQuality: 'low',
      });
      return vid;
    } else return false;
  };

  get video() {
    return this.videoEl;
  }
};
