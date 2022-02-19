import { Visualiser } from '../../visualisers/Visualiser.js';
import LoResObj from './LoResObj.js';

class Box extends LoResObj {
  draw(ctx) {
    ctx.save();
    ctx.fillStyle = `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
    const drawSize = this.size - this.size * this.spacing;
    ctx.fillRect(this.x, this.y, drawSize, drawSize);
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
    let { spacing = 0 } = kwargs;
    const { dyn = [] } = kwargs;
    if (kwargs.dynRes === true) {
      const { dynRange = 80 } = kwargs;
      const { dynResSpeed = 1 } = kwargs;
      resolution += dyn[dynResSpeed] * dynRange;
    }
    if (kwargs.dynSpace === true) {
      const { dynSpaceRange = 0 } = kwargs;
      const { dynSpaceSpeed = 1 } = kwargs;
      spacing = dyn[dynSpaceSpeed] * dynSpaceRange;
    }
    let loResStep = (context.cnv.width / resolution) << 0;
    if (vx % loResStep != 0 || vy % loResStep != 0) return;
    let [iR, iG, iB] = pixVals;
    const { lyrOpacity = 1 } = kwargs;
    this.loResObjs.push(new Box(vx, vy, iR, iG, iB, lyrOpacity, loResStep, spacing));
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
      name: 'spacing',
      displayName: 'Spacing',
      type: 'val',
      range: [0, 1],
      step: 0.05,
      value: 0,
    },
    {
      name: 'dynSpace',
      displayName: 'Dynamic Spacing',
      type: 'toggle',
      value: 'false',
    },
    {
      name: 'dynSpaceRange',
      displayName: 'Dynamic Spacing Range',
      type: 'val',
      range: [0, 1],
      value: 0,
      step: 0.05,
    },
    {
      name: 'dynSpaceSpeed',
      displayName: 'Dynamic Spcing Speed',
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
      tooltip: 'Because of how this visualiser works, it will draw to the entire canvas, overriding other visualisers. You can make it more transparent overall using this control.',
    },
  ];
}
