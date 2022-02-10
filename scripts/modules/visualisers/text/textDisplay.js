import { Visualiser } from '/scripts/modules/visualisers/Visualiser.js';
import { greyscaleCalc } from '/scripts/modules/util/utils.js';
import alphaBlend from '/scripts/modules/util/alphaBlend.js';

export class textDisplay extends Visualiser {
  constructor() {
    super();
    this.text = '';
  }

  updateData = function (idx, data) {
    this.chainIdx = idx;
    this.text = data;
  };

  /**
   * Manipulate the frame before the pixels have been processed.
   * Draw general images and graphics to the canvas.
   * Can improve performance to save class attributes here rather than destructure them
   * for every pixel in processPixels
   * @param {ImageData} vidPixels - image data for the current frame of video input
   * @param {Object} kwargs - parameters passed to visualiser
   * @param {Object} context - methods and attributes of the parent web worker
   */
  processFramePre = function (vidPixels, kwargs = {}, context) {
    const { extFrame } = kwargs;
    if (extFrame) {
      const { compMethod = 'source-over' } = kwargs;
      context.cnvContext.globalCompositeOperation = compMethod;
      context.cnvContext.drawImage(extFrame, 0, context.drawStart);
      context.cnvContext.globalCompositeOperation = 'source-over';
    }
  };

  /**
   * Manipulate a specific pixel in the pixel array.
   * Pixel array is iterated in the web worker and this method is called for each.
   * Don't destructure the kwargs before they arrive in the method, performance is much worse.
   * Some common parameters are included and destructured
   * @param {Integer} pixIdx - index of current pixel in the canvas pixel array
   * @param {Array} pixVals - pre-calculated red, green and blue 8 bit integer values for current pixel
   * @param {Object} kwargs - parameters passed to visualiser
   * @param {Object} context - methods and attributes of the parent web worker
   */
  processPixels = function (pixIdx, pixVals, kwargs, context) {
    const { bw } = kwargs;
    const { lyrOpacity } = kwargs;
    /* set input pixel values */
    let [iR, iG, iB] = pixVals;
    /* set processed pixel values */
    const greyscale = greyscaleCalc(pixVals);
    let [pR, pG, pB] = bw ? [greyscale, greyscale, greyscale] : [iR, iG, iB];
    /* set output pixel values preserving alpha, put into pixel array */
    let [oR, oG, oB] = alphaBlend([...context.cnvPixVals, 255], [pR, pG, pB, lyrOpacity]);
    // context.cnvPixels.data[pixIdx + 0] = oR;
    // context.cnvPixels.data[pixIdx + 1] = oG;
    // context.cnvPixels.data[pixIdx + 2] = oB;
  };

  /**
   * Manipulates the frame after the pixels have been processed.
   * Save loop-dependent attributes, paint to the canvas.
   * @param {ImageData} vidPixels - image data for the current frame of the video input
   * @param {Object} kwargs - parameters passed to visualiser
   * @param {Object} context - methods and attributes of the parent web worker
   */
  processFramePost = function (vidPixels, kwargs = {}, context) {};

  /**
   * Parameters that can be set and adjusted on the creator page,
   * then fed back to the methods as kwargs. Some common ones are included.
   * Tooltips will show when the parameter name is hovered over
   */
  params = [
    /**
     * sets the opacity of the layer
     */
    {
      name: 'lyrOpacity',
      displayName: 'Layer Opacity',
      type: 'val',
      range: [0, 1],
      step: 0.1,
      value: 1,
      tooltip: 'How much the previous module, or background, will show through',
    },
    {
      name: 'textCol',
      displayName: 'Text Colour',
      type: 'colour',
      value: '#ffffff',
    },
    {
      name: 'text',
      displayName: 'Display Text',
      type: 'textarea',
      value: '',
      tooltip: '<TODO: Some tips on how to format text for display here>',
    },
  ];
}
