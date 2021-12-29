// async indexeddb wrapper https://github.com/jakearchibald/idb
import { openDB } from 'https://cdn.jsdelivr.net/npm/idb@7/+esm';

export const setupVisualisers = async(scaleDown = 1, cnvTarget) => {
    let inputDevice, outputRes;
    let db = await openDB('visDB', 1, db => {
        if (db.oldVersion == 0) {
            console.log(`Error opening database: ${err.message}`);
            return null;
        }
    });
    inputDevice = await getInputDevice(db);
    outputRes = await getOutputResolution(db);
    const scaledRes = {
        w: outputRes.w * ((windowWidth / outputRes.w) / scaleDown),
        h: outputRes.h * ((windowWidth / outputRes.w) / scaleDown),
    };
    // create and place the canvas
    pixelDensity(1);
    const cnv = createCanvas(scaledRes.w, scaledRes.h);
    cnv.parent(cnvTarget);

    // set up camera to capture from input source
    const vidIn = createCapture(inputDevice.constraints, () => {
        vidIn.hide();
        vidIn.size(cnv.width, cnv.height);
    });
    return [cnv, vidIn];
}

const getInputDevice = async(db) => {
    try {
        const result =  await db.get('inputDevice', 1);
        return result.inputDevice;
    }
    catch (err) {
        console.log(`error retrieving input device: ${err}`)
    }
}

const getOutputResolution = async(db) => {
    try {
        const result = await db.get('outputResolution', 1);
        return result.outputResolution;
    }
    catch (err) {
        console.log(`error retrieving output resolutions: ${err}`)
    }
}
