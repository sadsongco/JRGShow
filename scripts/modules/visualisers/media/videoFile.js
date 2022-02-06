import { Visualiser } from '/scripts/modules/visualisers/Visualiser.js';

export const videoFile = class extends Visualiser {
  // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Synchronous_and_Asynchronous_Requests
  doesMediaExist = async function () {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', this.mediaPath + this.mediaURL, true);
    xhr.onload = (e) => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          this.initialiseVideo();
          return true;
        } else {
          this.mediaLoaded = false;
          postMessage({
            videoFile: false,
          });
        }
      }
    };
    xhr.onerror = function (e) {
      this.mediaLoaded = false;
      postMessage({
        videoFile: false,
      });
    };
    xhr.send(null);
  };

  initialiseVideo = async function () {
    postMessage({
      videoFile: this.mediaPath + this.mediaURL,
    });
    this.mediaLoaded = true;
  };

  constructor() {
    super();
    this.mediaURL = '';
    this.mediaPath = '/userMedia/';
    this.mediaLoaded = false;
  }

  processFramePre = function (vidPix, { mediaURL = '', ...kwargs } = {}, context) {
    if (this.mediaURL !== mediaURL && mediaURL != '') {
      this.mediaURL = mediaURL;
      this.doesMediaExist();
    }
    if (this.mediaLoaded) {
      const { extVideoFrame } = kwargs;
      if (extVideoFrame) {
        const { compMethod = 'source-over' } = kwargs;
        context.cnvContext.globalCompositeOperation = compMethod;
        context.cnvContext.drawImage(extVideoFrame, 0, context.drawStart);
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
      tooltip: "Put a video file for display into the 'userMedia' directory, then select it by typing the full file name here",
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
