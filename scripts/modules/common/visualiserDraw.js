// import utilities and generators
import { dynamicGenerator, pseudoRandomGenerator } from "../util/generators.js"
import getPixelValues from '../util/getPixelValues.js';

export function visualiserDraw(moduleChain, visualiserModules, vidIn, audioIn, fft, cnv, outputParamVals, previewSize = 1) {
    // frameRate(4)
    // noLoop()
    // set background
    const { bg_opacity = 255, bg_r = 0, bg_g = 0, bg_b = 0 } = outputParamVals;
    background(bg_r, bg_g, bg_b, bg_opacity);
    // get audio data
    const dyn = dynamicGenerator();
    const rand = pseudoRandomGenerator();
    // set params, once per frame, included in processFramePre loop
    const visParams = {}
    for (const module of moduleChain) {
        visParams[module.name] = {...module.params};
        const kwargs = visParams[module.name];
        kwargs.dyn = dyn;
        kwargs.fft = fft;
        visualiserModules[module.name].processFramePre(vidIn, kwargs);
    }
    if (moduleChain.length > 0) {
        loadPixels();
        vidIn.loadPixels();
        for (let vy = 0; vy < cnv.height; vy++) {
            for (let vx = 0; vx < cnv.width; vx++) {
                const pixIdx = ((vy * width) + vx) * 4;
                // let randIdx = rand.length - (Math.abs((pixIdx ^ parseInt(rand, 2)) << 1) % rand.length) - 1;
                let randIdx = pixIdx % rand.length;
                let pixVals = getPixelValues(pixIdx, vidIn.pixels);
                let lyrVals = getPixelValues(pixIdx, pixels);
                for (const module of moduleChain) {
                    // include module parameters in arguments
                    const kwargs = visParams[module.name];
                    // include common parameters in arguments
                    kwargs.previewSize = previewSize;
                    kwargs.fft = fft;
                    kwargs.vx = vx;
                    kwargs.vy = vy;
                    kwargs.rand = rand[randIdx];
                    visualiserModules[module.name].processPixels(pixIdx, pixVals, kwargs);
                }
            }
        }
        updatePixels();
    }
    for (const module of moduleChain) {
        const kwargs = visParams[module.name];
        kwargs.fft = fft;
        visualiserModules[module.name].processFramePost(vidIn);
    }
}
