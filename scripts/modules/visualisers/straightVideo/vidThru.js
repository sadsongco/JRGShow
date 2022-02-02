import { Visualiser } from '../../../_prototype/modules/visualisers/Visualiser.js';

export class vidThru extends Visualiser {
  processFramePre = function (vidIn, kwargs = {}, context) {
    const { audioInfo } = kwargs;
    const { bwAmt = 1 } = kwargs;
    const { invAmt = 100 } = kwargs;
    let { brightness = 100 } = kwargs;
    const { brightAudioMod = false, brightAudioSens = 0, invertBrightAudioMod = false } = kwargs;
    const { contrast = 100 } = kwargs;
    const { hue = 0 } = kwargs;
    const { opacity = 100 } = kwargs;
    const { sepia = 0 } = kwargs;
    let filters = [];
    filters.push(`grayscale(${bwAmt})`);
    filters.push(`brightness(${brightness + (invertBrightAudioMod * -2 + 1) * (brightAudioMod && (audioInfo['vol'] / 255) * brightAudioSens)}%)`);
    filters.push(`contrast(${contrast}%)`);
    filters.push(`hue-rotate(${hue}deg)`);
    filters.push(`opacity(${opacity}%)`);
    filters.push(`sepia(${sepia}%)`);
    filters.push(`invert(${invAmt}%)`);
    context.cnvContext.save();
    context.cnvContext.filter = filters.join(' ');
    context.cnvContext.drawImage(vidIn, 0, context.drawStart, context.cnv.width, context.drawHeight);
    context.cnvContext.restore();
  };
  params = [
    {
      name: 'bwAmt',
      displayName: 'Black & White amount',
      type: 'val',
      range: [0, 1],
      step: 0.1,
      value: 0,
    },
    {
      name: 'invAmt',
      displayName: 'Inversion amount',
      type: 'val',
      range: [0, 100],
      value: 0,
    },
    {
      name: 'brightness',
      displayName: 'Brightness',
      type: 'val',
      range: [0, 200],
      value: 100,
    },
    {
      name: 'brightAudioMod',
      displayName: 'Brightness Audio Modulation',
      type: 'toggle',
      value: false,
    },
    {
      name: 'brightAudioSens',
      displayName: 'Brightness Audio Modulation Sensitivity',
      type: 'val',
      range: [0, 255],
      value: 0,
    },
    {
      name: 'invertBrightAudioMod',
      displayName: 'Invert Brightness Audio Modulation',
      type: 'toggle',
      value: false,
    },
    {
      name: 'contrast',
      displayName: 'Contrast',
      type: 'val',
      range: [0, 200],
      value: 100,
    },
    {
      name: 'hue',
      displayName: 'Hue',
      type: 'val',
      range: [0, 360],
      value: 0,
    },
    {
      name: 'opacity',
      displayName: 'Opacity',
      type: 'val',
      range: [0, 100],
      value: 100,
    },
    {
      name: 'sepia',
      displayName: 'Sepia',
      type: 'val',
      range: [0, 100],
      value: 0,
    },
  ];
}
