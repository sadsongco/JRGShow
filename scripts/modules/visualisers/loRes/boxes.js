import { Visualiser } from '../../../_prototype/modules/visualisers/Visualiser.js';

class loResObj {
  constructor(x, y, r, g, b, a, size) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
    this.size = size;
  }

  draw(ctx) {
    ctx.save();
    ctx.fillStyle = `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
    ctx.fillRect(this.x, this.y, this.size, this.size);
    ctx.restore();
  }
}

export class boxes extends Visualiser {
  constructor() {
    super();
    this.loResObjs = [];
  }

  processFramePre() {
    this.loResObjs = [];
  }

  processPixels = function (pixIdx, pixVals, kwargs = {}, context) {
    const { vx = 0, vy = 0 } = kwargs;
    let { resolution = 1 } = kwargs;
    if (kwargs.dynRes === true) {
      const { dyn = 0 } = kwargs;
      const { dynRange = 80 } = kwargs;
      const { dynResSpeed = 1 } = kwargs;
      resolution += dyn[dynResSpeed] * dynRange;
    }
    let loResStep = (context.cnv.width / resolution) << 0;
    const { previewSize = 1 } = kwargs;
    if (vx % loResStep != 0 || vy % loResStep != 0) return;
    let [iR, iG, iB] = pixVals;
    const { lyrOpacity = 1 } = kwargs;
    this.loResObjs.push(new loResObj(vx, vy, iR, iG, iB, lyrOpacity, loResStep));
  };

  processFramePost(vidPixels, kwargs, context) {
    for (let i = 0; i < this.loResObjs.length; i++) {
      this.loResObjs[i].draw(context.cnvContext);
    }
  }
  params = [
    {
      name: 'resolution',
      displayName: 'Resolution',
      type: 'val',
      range: [1, 80],
      value: 80,
    },
    {
      name: 'dynRes',
      displayName: 'Dynamic Resolution',
      type: 'toggle',
      value: 'false',
    },
    {
      name: 'dynRange',
      displayName: 'Dynamic Resolution Range',
      type: 'val',
      range: [0, 80],
      value: 1,
    },
    {
      name: 'dynResSpeed',
      displayName: 'Dynamic Resolution Speed',
      type: 'val',
      range: [0, 7],
      value: 0,
    },
    {
      name: 'lyrOpacity',
      displayName: 'Layer Opacity',
      type: 'val',
      range: [0, 1],
      step: 0.1,
      value: 1,
    },
  ];
}
