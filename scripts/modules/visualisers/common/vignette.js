// const vignette = function(pixIdx, vigMask, pixels) {
//     pixels[pixIdx + 3] *= vigMask[pixIdx/4]
// }   
// export default vignette

import { Visualiser } from '../Visualiser.js';
import vignetteMask from '../../util/vignetteMask.js'

export const vignette = class extends Visualiser {
    // constructor() {
    //     super();
    //     this.vigMask;
    // }
    setup = async function() {
        console.log('vignette setup')
        this.vigMask
        vignetteMask(width, height)
        .then((res)=>{this.vigMask = res; console.log(this.vigMask)})
    }
    processPixels = function(pixIdx, pixVals, kwargs) {
        pixels[pixIdx + 3] = this.vigMask[pixIdx / 4];
        // console.error('vigMask undefined at index: ', pixIdx / 4, err);
    }
}