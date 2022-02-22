import { Visualiser } from '../Visualiser.js';
import { getRandGrey, getRandRGB } from '../../util/randGenerator.js';
import alphaBlend from '../../util/alphaBlend.js';

export class noise extends Visualiser {
  /**
   * Initialise the attributes of the visualiser
   */
  constructor() {
    super();
  }

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
    const { bw = false } = kwargs;
    const { lyrOpacity = 1 } = kwargs;
    const { procSource = 'Video In' } = kwargs;
    /* set input pixel values */
    let [iR, iG, iB] = pixVals;
    if (procSource === 'Prev Module') {
      [iR, iG, iB] = [context.cnvPixels.data[pixIdx + 0], context.cnvPixels.data[pixIdx + 1], context.cnvPixels.data[pixIdx + 2]];
    }
    /* set processed pixel values */
    let pR, pG, pB;
    if (bw) {
      pR = pG = pB = getRandGrey();
      // pR = pG = pB = (Math.random() * 255) << 0;
    } else {
      [pR, pG, pB] = getRandRGB();
      // pR = (Math.random() * 255) << 0;
      // pG = (Math.random() * 255) << 0;
      // pB = (Math.random() * 255) << 0;
    }
    /* set output pixel values preserving alpha, put into pixel array */
    let [oR, oG, oB] = alphaBlend([iR, iG, iB, 255], [pR, pG, pB, lyrOpacity]);
    context.cnvPixels.data[pixIdx + 0] = oR;
    context.cnvPixels.data[pixIdx + 1] = oG;
    context.cnvPixels.data[pixIdx + 2] = oB;
  };

  /**
   * Parameters that can be set and adjusted on the creator page,
   * then fed back to the methods as kwargs. Some common ones are included.
   * Tooltips will show when the parameter name is hovered over
   */
  params = [
    /**
     * chooses whether the visualiser processes the current video input or the existing
     * canvas contents from the previous visualiser module
     */
    {
      name: 'procSource',
      displayName: 'Processing Source',
      type: 'select',
      options: ['Video In', 'Prev Module'],
      value: 'Video In',
      tooltip: 'Using the Prev Module as the source allows you to threshold what is already showing. Using Video In as the source overlays thresholded video onto what is already showing',
    },
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
      name: 'bw',
      displayName: 'Black and White',
      type: 'toggle',
      value: false,
      tooltip: 'Change the visualiser output to black and white',
    },
  ];
}
