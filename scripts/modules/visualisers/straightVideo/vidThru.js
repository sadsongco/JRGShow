import { Visualiser } from '../../../_prototype/modules/visualisers/Visualiser.js';

export class vidThru extends Visualiser {
    processFramePre = function(vidIn, kwargs={}, context) {
        const { bw = false } = kwargs;
        const { bwAmt = 1 } = kwargs;
        const { invert = false } = kwargs;
        const { invAmt = 100 } = kwargs;
        const { blur = 0 } = kwargs;
        const { brightness = 100 } = kwargs;
        const { contrast = 100 } = kwargs;
        const { hue = 0 } = kwargs;
        const { opacity = 100 } = kwargs;
        const { sepia = 0 } = kwargs;
        let filters = [];
        filters.push(`blur(${blur}px)`);
        filters.push(`grayscale(${bwAmt})`);
        filters.push(`brightness(${brightness}%)`);
        filters.push(`contrast(${contrast}%)`);
        filters.push(`hue-rotate(${hue}deg)`);
        filters.push(`opacity(${opacity}%)`);
        filters.push(`sepia(${sepia}%)`);
        filters.push(`invert(${invAmt}%)`);
        context.cnvContext.save();
        context.cnvContext.filter = filters.join(' ');
        context.cnvContext.drawImage(vidIn, 0, 0, context.cnv.width, context.cnv.height);
        context.cnvContext.restore();

    }
    params = [
        // {
        //     name: 'bw',
        //     displayName: 'Black & White',
        //     type: 'toggle',
        //     value: false
        // },
        {
            name: 'bwAmt',
            displayName: 'Black & White amount',
            type: 'val',
            range: [
                0, 1
            ],
            step: 0.1,
            value: 0
        },
        // {
        //     name: 'invert',
        //     displayName: 'Invert',
        //     type: 'toggle',
        //     value: false
        // },
        {
            name: 'invAmt',
            displayName: 'Inversion amount',
            type: 'val',
            range: [
                0, 100
            ],
            value: 0
        },
        {
            name: 'blur',
            displayName: 'Blur',
            type: 'val',
            range: [
                0, 50
            ],
            step: 0.5,
            value: 0
        },
        {
            name: 'brightness',
            displayName: 'Brightness',
            type: 'val',
            range: [
                0, 200
            ],
            value: 100
        },
        {
            name: 'contrast',
            displayName: 'Contrast',
            type: 'val',
            range: [
                0, 200
            ],
            value: 100
        },
        {
            name: 'hue',
            displayName: 'Hue',
            type: 'val',
            range: [
                0, 360
            ],
            value: 0
        },
        {
            name: 'opacity',
            displayName: 'Opacity',
            type: 'val',
            range: [
                0, 100
            ],
            value: 100
        },
        {
            name: 'sepia',
            displayName: 'Sepia',
            type: 'val',
            range: [
                0, 100
            ],
            value: 0
        },

      ]

}
