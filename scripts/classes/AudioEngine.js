/**
 * @class Class to implement Web Audio API and analyse incoming audio from selected input
 */
export const AudioEngine = class {
  /**
   * Instantiate AudioEngine class with surrounding context and desired audio source
   * @param {AudioContext} context - application audio context
   * @param {Object} audioSource - audio source info
   */
  constructor(context, audioSource) {
    this.audioContext = context;
    this.audioSource = audioSource;
  }

  /**
   * Initialise audio engine, get input stream
   */
  init = async () => {
    let stream = await navigator.mediaDevices.getUserMedia(this.audioSource.constraints);
    this.audioIn = this.audioContext.createMediaStreamSource(stream);
    // setup analyser
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 32;
    this.bufferLength = this.analyser.frequencyBinCount;
    this.audioArray = new Uint8Array(this.bufferLength);
    this.analyser.getByteTimeDomainData(this.audioArray);
    // connect audio in to analyser
    this.audioIn.connect(this.analyser);
    // names for frequency bands
    this.freqBands = ['bass', 'loMid', 'hiMid', 'treble'];
    this.freqEnergy = {};
  };

  /**
   * Getter for audio engine frequency bands
   * @returns {Array}
   */
  getFreqBands = () => {
    return [...this.freqBands, 'vol'];
  };

  /**
   * Calculates average volume from array of frequency energies
   * @returns {Integer}
   */
  getAverageVolume = () => {
    return Object.values(this.freqEnergy).reduce((c, p, i) => ((c * i + p) / (i + 1)) << 0);
  };

  /**
   * Analyse level and frequency bands of current audio input
   */
  getAudioAnalysis = () => {
    this.analyser.getByteFrequencyData(this.audioArray);
    this.level = this.audioArray.reduce((a, b) => a + b, 0) / this.audioArray.length;
    for (let i = 0; i < this.bufferLength; i += 4) {
      this.freqEnergy[this.freqBands[i / 4]] = ((this.audioArray[i + 0] + this.audioArray[i + 1] + this.audioArray[i + 2] + this.audioArray[i + 3]) / 4) << 0;
    }
    this.freqEnergy['vol'] = this.getAverageVolume();
    return this.freqEnergy;
  };

  /**
   * Debug method to draw frequency plot onto current canvas
   * @param {CanvasRenderingContext2D} cnvContext - canvas context
   * @param {Element} cnv - HTML canvas element
   */
  draw = async (cnvContext, cnv) => {
    let barWidth = (cnv.width / this.freqBands.length) << 0;
    let barHeight;
    let x = 0;
    cnvContext.save();
    for (let i = 0; i < this.freqBands.length; i++) {
      barHeight = this.freqEnergy[this.freqBands[i]];
      cnvContext.fillStyle = `rgb(${barHeight + 100}, 50, 50)`;
      cnvContext.fillRect(x, cnv.height - barHeight, barWidth - 1, barHeight);
      x += barWidth + 1;
    }
    cnvContext.restore();
  };
};
