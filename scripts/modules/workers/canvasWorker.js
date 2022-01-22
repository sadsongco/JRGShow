class ProcessCanvas {
  constructor() {
    this.cnv = null; // will hold this worker's canvas
    this.cnvContext = null; // will hold this worker's canvas context
    this.start = 0; // starting line of subcanvas in main canvas
    this.height = 0; // height of sub canvas
  }

  setup(data) {
    const canvas = data.canvas;
    console.log(canvas);
    this.start = data.start;
    this.height = data.height;
    this.cnv = canvas;
    this.cnvContext = this.cnv.getContext("2d");
    console.log(this);
  }

  draw(kwargs) {
    console.log(kwargs);
    switch (parseInt(kwargs.index)) {
      case 0:
        this.cnvContext.fillStyle = `rgba(${(Math.random() * 255) << 0}, 0, 0, 1)`;
        break;
      case 1:
        this.cnvContext.fillStyle = `rgba(0, ${(Math.random() * 255) << 0}, 0, 1)`;
        break;
      case 2:
        this.cnvContext.fillStyle = `rgba(0, 0, ${(Math.random() * 255) << 0}, 1)`;
        break;
      default:
        this.cnvContext.fillStyle = `rgba(${(Math.random() * 255) << 0}, ${(Math.random() * 255) << 0}, ${(Math.random() * 255) << 0}, 1`;
    }
    this.cnvContext.fillRect(0, 0, this.cnv.width, this.cnv.height);
    console.log("drawn");
  }
}

const processCanvas = new ProcessCanvas();

onmessage = (e) => {
  if (e.data.task === "setup") {
    processCanvas.setup(e.data);
  }
  if (e.data.task === "draw") {
    processCanvas.draw(e.data.kwargs);
  }
};
