import getPixelValues from '../util/getPixelValues.js';

export function visualiserDraw(moduleChain, visualiserModules, vidIn, cnv) {
    // console.log(moduleChain)
    background(0, 0, 0, 255);
    for (const module of moduleChain) {
        const kwargs = module.params;
        if (typeof visualiserModules[module.name].processFramePre == 'function')
            visualiserModules[module.name].processFramePre(vidIn, kwargs);
    }
    if (moduleChain.length > 0) {
        loadPixels();
        vidIn.loadPixels();
        for (let vy = 0; vy < cnv.height; vy++) {
            for (let vx = 0; vx < cnv.width; vx++) {
                const pixIdx = ((vy * width) + vx) * 4;
                let pixVals = getPixelValues(pixIdx, vidIn.pixels);
                for (const module of moduleChain) {
                    const kwargs = module.params;
                    if (typeof visualiserModules[module.name].processPixels == 'function')
                        visualiserModules[module.name].processPixels(pixIdx, pixVals, kwargs);
                }
            }
        }
        updatePixels();
    }
    for (const module of moduleChain)
        if (typeof visualiserModules[module.name].processFramePost == 'function')
            visualiserModules[module.name].processFramePost(vidIn);
}
