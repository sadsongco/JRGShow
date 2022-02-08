/**
 * @class Class that displays text to a canvas.
 * Solves problems related to web workers and sub canvases
 */
export const TextDisplayEngine = class {
  constructor({ numworkers, width, height }) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.numworkers = numworkers;
  }
};
