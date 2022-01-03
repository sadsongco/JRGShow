// import utilities and generators
import { dynamicGenerator, pseudoRandomGenerator } from "../util/generators.js"
import getPixelValues from '../util/getPixelValues.js';

export function visualiserDraw(moduleChain, visualiserModules, vidIn, audioIn, fft, cnv, outputParamVals, prevSize = 1) {
    // console.log('visualiserDraw', outputParamVals)
    // frameRate(1)
    // set background
    const { bg_opacity = 255, bg_r = 0, bg_g = 0, bg_b = 0 } = outputParamVals;
    // const bg_opacity = 255, bg_r = 0, bg_g = 0, bg_b = 0;
    background(bg_r, bg_g, bg_b, bg_opacity);
    // get audio data
    // let spectrum = fft.analyze()
    const dyn = dynamicGenerator();
    const rand = pseudoRandomGenerator();
    // console.log(rand)
    for (const module of moduleChain) {
        const kwargs = module.params;
        kwargs.fft = fft;
        if (typeof visualiserModules[module.name].processFramePre == 'function')
        visualiserModules[module.name].processFramePre(vidIn, kwargs);
    }
    if (moduleChain.length > 0) {
        loadPixels();
        vidIn.loadPixels();
        for (let vy = 0; vy < cnv.height; vy++) {
            for (let vx = 0; vx < cnv.width; vx++) {
                const pixIdx = ((vy * width) + vx) * 4;
                let randIdx = rand.length - (Math.abs((pixIdx ^ parseInt(rand, 2)) << 1) % rand.length) - 1;
                let pixVals = getPixelValues(pixIdx, vidIn.pixels);
                for (const module of moduleChain) {
                    // include module parameters in arguments
                    const kwargs = module.params;
                    // include common parameters in arguments
                    kwargs.prevSize = prevSize;
                    kwargs.vx = vx;
                    kwargs.vy = vy;
                    kwargs.fft = fft;
                    kwargs.dyn = dyn;
                    kwargs.rand = rand[randIdx];
                    if (typeof visualiserModules[module.name].processPixels == 'function')
                        visualiserModules[module.name].processPixels(pixIdx, pixVals, kwargs);
                    // rand.unshift(currRand);
                }
            }
        }
        updatePixels();
    }
    for (const module of moduleChain) {
        const kwargs = module.params;
        kwargs.fft = fft;
        if (typeof visualiserModules[module.name].processFramePost == 'function')
            visualiserModules[module.name].processFramePost(vidIn);
    }
}
