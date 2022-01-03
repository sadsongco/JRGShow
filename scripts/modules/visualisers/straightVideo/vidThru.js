import { Visualiser } from '../Visualiser.js';

export class vidThru extends Visualiser {
    processFramePre = function(vidIn, kwargs={}) {
        const { bw = false } = kwargs;
        image(vidIn, 0, 0)
        if (bw)
            filter(GRAY)
    }
    params = [
       {
           name: 'bw',
           displayName: 'Black & White',
           type: 'toggle',
           value: false
       }
    ]

}
