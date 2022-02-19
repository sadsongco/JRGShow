import { Visualiser } from '../../visualisers/Visualiser.js';

export const videoFile = class extends Visualiser {
  // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Synchronous_and_Asynchronous_Requests
  doesMediaExist = async function () {
    // console.log(`videoFile ${this.chainIdx} doesMediaExist for ${this.mediaPath + this.mediaURL}`);
    const xhr = new XMLHttpRequest();
    xhr.open('GET', this.mediaPath + this.mediaURL, true);
    xhr.onload = (e) => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          this.initialiseVideo();
          return true;
        } else {
          this.mediaLoaded = false;
          // console.log(`videoFile ${this.chainIdx} posting message false`);
          postMessage({
            videoFile: false,
            chainIdx: this.chainIdx,
          });
        }
      }
    };
    xhr.onerror = function (e) {
      this.mediaLoaded = false;
      // console.log(`videoFile ${this.chainIdx} posting message false`);
      postMessage({
        videoFile: false,
        chainIdx: this.chainIdx,
      });
    };
    xhr.send(null);
  };

  initialiseVideo = async function () {
    // console.log(`videoFile ${this.chainIdx} posting message true`);
    postMessage({
      videoFile: this.mediaPath + this.mediaURL,
      chainIdx: this.chainIdx,
    });
    this.mediaLoaded = true;
  };

  constructor() {
    super();
    this.mediaURL = '';
    this.mediaPath = '/userMedia/';
    this.mediaLoaded = false;
  }

  updateData(idx, data) {
    this.chainIdx = idx;
    this.mediaURL = data;
    if (this.mediaURL != '') this.doesMediaExist();
  }

  processFramePre = function (vidPix, kwargs = {}, context) {
    this.chainIdx = kwargs.idx;
    const { mediaURL = '' } = kwargs;
    if (this.mediaURL !== mediaURL && mediaURL != '') {
      this.mediaURL = mediaURL;
      this.doesMediaExist();
    }
  };

  processFramePost = function (vidPix, kwargs = {}, context) {
    if (this.mediaLoaded) {
      const { extFrame } = kwargs;
      if (extFrame) {
        const { compMethod = 'source-over' } = kwargs;
        context.cnvContext.globalCompositeOperation = compMethod;
        context.cnvContext.drawImage(extFrame, 0, context.drawStart);
        context.cnvContext.globalCompositeOperation = 'source-over';
      }
    }
  };

  params = [
    {
      name: 'mediaURL',
      displayName: 'Video file name',
      type: 'text',
      value: '',
      tooltip: "Put a video file for display into the 'userMedia' directory, then select it by typing the full file name here. ***IN THE CURRENT ITERATION ONLY ONE OF THESE VISUALISERS WILL WORK AT A TIME IN THE CHAIN***",
    },
    {
      name: 'compMethod',
      displayName: 'Compositing Method',
      type: 'select',
      options: ['source-over', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity'],
      value: 'source-over',
      tooltip: "How the external video is composited over existing visualisers. source-over means you'll only see the external video, over a blank background many will result in a blank output.",
    },
  ];
};
