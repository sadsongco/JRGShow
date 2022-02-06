// async indexeddb wrapper https://github.com/jakearchibald/idb
import { openDB } from '../../../lib/openDB.js';

/**
 * Creates and initialises HTML Canvas, initialises audio and video input
 * @returns {Promise<Array>} - Canvas, Video Canvas, Video In, Audio In objects, and preview size float
 */
const setupVisualiserCanvas = async () => {
  const cnvTarget = document.getElementById('canvasContainer');
  const [inputDevice, audioSource, outputRes] = await getSettings();
  // create canvas
  const cnv = document.createElement('canvas');
  const previewSize = await resizeCanvas(cnvTarget, outputRes, cnv);
  // cnvTarget.appendChild(cnv);
  // window.onresize = () => resizeCanvas(cnvTarget, outputRes, cnv);
  // create video node, attach to video input stream
  const vidIn = await getVideoInput(inputDevice);
  vidIn.play();
  // create video canvas to read video pixels into
  const vidCnv = document.createElement('canvas');
  resizeCanvas(cnvTarget, outputRes, vidCnv);
  // TODO - create audio in
  return [cnv, vidCnv, vidIn, audioSource, previewSize];
};

const getVideoInput = (inputDevice) => {
  return new Promise((resolve) => {
    const vidIn = document.createElement('video');
    navigator.mediaDevices.getUserMedia(inputDevice.constraints).then((src) => (vidIn.srcObject = src));
    vidIn.addEventListener('loadedmetadata', () => {
      resolve(vidIn);
    });
  });
};

/**
 * Sizes the canvas to fit the containing DOM element
 * @param {HTMLElement} cnvTarget - DOM element that holds the canvas
 * @param {Object} outputRes - user selected width and height for visualiser output
 * @param {Promise<HTMLElement>} cnv - HTML5 canvas
 */
const resizeCanvas = async (cnvTarget, outputRes, cnv) => {
  try {
    const scaledRes = await getResolution(outputRes, cnvTarget);
    cnv.width = scaledRes.w;
    cnvTarget.style.width = `${scaledRes.w}px`;
    cnv.height = scaledRes.h;
    cnvTarget.style.height = `${scaledRes.h}px`;
    return scaledRes.w / outputRes.w;
  } catch (err) {
    throw new Error(`Error resizing the canvas: ${err.message}`);
  }
};

/**
 * Calculates the size for a canvas in a DOM element, retaining aspect ratio
 * @param {Object} outputRes - user selected width and height for visualiser output
 * @param {HTMLElement} cnvTarget - DOM element that holds the canvas
 * @returns {Object} scaledRes - width and height for canvas
 */
const getResolution = async (outputRes, cnvTarget) => {
  cnvTarget.w = parseFloat(window.getComputedStyle(cnvTarget).width);
  const scaledRes = {
    w: cnvTarget.w << 0,
    h: (outputRes.h * (cnvTarget.w / outputRes.w)) << 0,
  };
  return scaledRes;
};

/**
 * Retreives user settings for input and output from the database
 * @returns {Promise<Array>} - video input device Object audio input device Object, user selected width and height for visualiser output
 */
const getSettings = async () => {
  try {
    let db = await openDB('visDB', 1, (db) => {
      if (db.oldVersion == 0) {
        console.log(`Error opening database: ${err.message}`);
        return null;
      }
    });
    const inputDevice = await getInputDevice(db);
    const audioSource = await getAudioSource(db);
    const outputRes = await getOutputResolution(db);
    return [inputDevice, audioSource, outputRes];
  } catch (err) {
    throw new Error(`Error retrieving settings from database: ${err.message}`);
  }
};

/**
 * Retrieves user selected video input device from the database
 * @param {IDBOpenDBRequest} db - open database request
 * @returns {IDBObjectStore}
 */
const getInputDevice = async (db) => {
  try {
    const result = await db.get('inputDevice', 1);
    return result.inputDevice;
  } catch (err) {
    throw new Error(`Error retrieving input device: ${err}`);
  }
};

/**
 * Retrieves user selected audio input device from the database
 * @param {IDBOpenDBRequest} db - open database request
 * @returns {IDBObjectStore}
 */
const getAudioSource = async (db) => {
  try {
    const result = await db.get('audioSource', 1);
    return result.source;
  } catch (err) {
    throw new Error(`error retrieving input device: ${err}`);
  }
};

/**
 * Retrieves user selected output resolution from the database
 * @param {IDBOpenDBRequest} db - open database request
 * @returns {IDBObjectStore}
 */
const getOutputResolution = async (db) => {
  try {
    const result = await db.get('outputResolution', 1);
    return result.outputResolution;
  } catch (err) {
    throw new Error(`error retrieving output resolutions: ${err}`);
  }
};
export { setupVisualiserCanvas };
