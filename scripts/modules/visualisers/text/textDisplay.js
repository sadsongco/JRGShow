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
      context.cnvContext.save();
      context.cnvContext.globalCompositeOperation = compMethod;
      context.cnvContext.drawImage(extFrame, 0, context.drawStart);
      context.cnvContext.restore();
    }
  };

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
      name: 'textSize',
      displayName: 'Text Size',
      type: 'val',
      range: [3, 170],
      value: 50,
      tooltip: 'Font size in pixels of the text. If a line is wider than the screen it will be automatically shrunk to fit, affecting this width but not the height',
    },
    {
      name: 'padL',
      displayName: 'Left Padding',
      type: 'val',
      range: [0, 100],
      value: 0,
      tooltip: 'Space to the left before text starts',
    },
    {
      name: 'padT',
      displayName: 'Top Padding',
      type: 'val',
      range: [0, 100],
      value: 0,
      tooltip: 'Space at the top before text starts',
    },
    {
      name: 'lineSpacing',
      displayName: 'Line Spacing',
      type: 'val',
      range: [-100, 100],
      value: 0,
      tooltip: 'Space between each line of text',
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
    {
      name: 'typing',
      displayName: 'Typing Text',
      type: 'toggle',
      value: false,
      tooltip: 'Type out the text character by character',
    },
    {
      name: 'typingSpeed',
      displayName: 'Typing Slowness',
      type: 'val',
      range: [1, 60],
      value: 1,
      tooltip: 'How slowly the text types out',
    },
    {
      name: 'selectedFont',
      displayName: 'Text font',
      type: 'select',
      options: ['CourierPrime', 'VT323', 'Montserrat', 'Monoton', 'Bowlby'],
      value: 'vol',
    },
    {
      name: 'audioMod',
      displayName: 'Linespacing Audio Modulation',
      type: 'toggle',
      value: false,
    },
    {
      name: 'audioModSource',
      displayName: 'Audio Modulation Source',
      type: 'select',
      options: ['bass', 'loMid', 'hiMid', 'treble', 'vol'],
      value: 'vol',
    },
    {
      name: 'audioSens',
      displayName: 'Audio Modulation Sensitivity',
      type: 'val',
      range: [0, 255],
      value: 0,
    },
    {
      name: 'compMethod',
      displayName: 'Compositing Method',
      type: 'select',
      options: ['source-over', 'source-in', 'source-out', 'source-atop', 'destination-over', 'destination-in', 'destination-out', 'destination-atop', 'lighter', 'copy', 'xor', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity'],
      value: 'source-over',
      tooltip: 'How the text is composited over existing visualisers.',
    },
  ];
}
