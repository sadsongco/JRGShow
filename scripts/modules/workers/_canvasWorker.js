class ProcessCanvas {
  constructor() {
    this.cnv = null; // will hold this worker's canvas
    this.cnvContext = null; // will hold this worker's canvas context
    // subcanvas parameters passed at instantiation
    this.start = 0; // starting line of subcanvas in main canvas
    this.drawStart = 0; // where to draw the canvas from
    this.height = 0; // height of sub canvas
    this.overlap = 0; // overlap between sub canvases
    // local copies of global parameters
    this.outputSettings = {};
  }

  setup(data) {
    const canvas = data.canvas;
    console.log(data.canvas);
    this.start = data.start;
    this.drawStart = data.drawStart;
    this.height = data.height;
    this.drawHeight = data.drawHeight;
    this.cnv = data.canvas;
    this.cnvContext = this.cnv.getContext('2d');
    // initialise output settings and target DOM elements
    this.outputSettings = { bg_opacity: 255, bg_col: [0, 0, 0] };
    console.log(this);
  }

  draw(kwargs) {
    this.drawBackground();
    switch (parseInt(kwargs.index)) {
      case 0:
        this.cnvContext.fillStyle = `rgba(255, 0, 0, 0.5)`;
        break;
      case 1:
        this.cnvContext.fillStyle = `rgba(0, 255, 0, 0.5)`;
        break;
      case 2:
        this.cnvContext.fillStyle = `rgba(0, 0, 255, 0.5)`;
        break;
      default:
        this.cnvContext.fillStyle = `rgba(255, 255, 0, 0.5)`;
    }

    this.cnvContext.fillRect(0, this.drawStart, this.cnv.width, this.drawHeight);
    // this.cnvContext.fillRect(0, 0, this.cnv.width, this.height);
  }

  drawBackground = async () => {
    // set background
    const { bg_opacity = 255, bg_col = [0, 0, 0] } = this.outputSettings;
    const bgCol = `rgba(${bg_col[0]}, ${bg_col[1]}, ${bg_col[2]}, ${bg_opacity / 255})`;
    this.cnvContext.save();
    this.cnvContext.fillStyle = bgCol;
    // this.cnvContext.fillRect(0, 0, this.cnv.width, this.cnv.height);
    this.cnvContext.clearRect(0, 0, this.cnv.width, this.cnv.height);
    this.cnvContext.restore();
  };
}

const processCanvas = new ProcessCanvas();

onmessage = (e) => {
  if (e.data.task === 'setup') {
    processCanvas.setup(e.data);
  }
  if (e.data.task === 'draw') {
    processCanvas.draw(e.data.kwargs);
  }
};
