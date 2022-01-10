// import utilities and generators
import { dynamicGenerator, pseudoRandomGenerator } from "../modules/util/generators.js"
import getPixelValues from '../modules/util/getPixelValues.js';
import { importModules } from "../modules/common/importModules.js";
import { setupVisualisers } from "../modules/common/setupVisualisers.js";

// p5js preview visualiser variables
let cnv, vidIn, audioIn;
let fft = null;
// container for visualiser modules
let visualiserModules = {};

/**
 * Wrapper for importModules to keep visualiser modules in scope, and deliver to external scripts when needed
 * @returns {Object} visualiser modules
 */
export const visPreload = async function() {
    return await importModules();
}

/**
 * P5.JS preload function
 * Called asnchronously once at beginning of execution
 */
export const p5Preload = async function() {
}

/**
 * P5.JS setup function
 * Called once after preload is done
 */
export const p5Setup = async function(previewSize, context) {
    console.log('p5setup')
    console.log(visualiserModules)
    // get data from persistent storage
    const audioCtx = getAudioContext();
    [cnv, vidIn, audioIn] = await setupVisualisers(previewSize, audioCtx)
    fft = new p5.FFT(0.8, 32);
    fft.setInput(audioIn);
    for (let visualiserModule of Object.values(visualiserModules)) {
        console.log(visualiserModule)
        let kwargs = visualiserModule.params;
        visualiserModule.setup(context, kwargs); // include context for some vis modules
    }
    return await Promise.resolve([cnv, vidIn, audioIn, fft]);
}

export function p5Draw(moduleChain, outputParamVals, previewSize = 1) {
    // frameRate(4)
    // noLoop()
    // set background
    const { bg_opacity = 255, bg_r = 0, bg_g = 0, bg_b = 0 } = outputParamVals;
    cnv.background(bg_r, bg_g, bg_b, bg_opacity);
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
        cnv.loadPixels();
        vidIn.loadPixels();
        for (let vy = 0; vy < cnv.height; vy++) {
            for (let vx = 0; vx < cnv.width; vx++) {
                const pixIdx = ((vy * width) + vx) * 4;
                // let randIdx = rand.length - (Math.abs((pixIdx ^ parseInt(rand, 2)) << 1) % rand.length) - 1;
                let randIdx = pixIdx % rand.length;
                let pixVals = getPixelValues(pixIdx, vidIn.pixels);
                // let lyrVals = getPixelValues(pixIdx, pixels);
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
