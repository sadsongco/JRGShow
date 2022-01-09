// async indexeddb wrapper https://github.com/jakearchibald/idb
import { openDB } from 'https://cdn.jsdelivr.net/npm/idb@7/+esm';

// export const setupVisualisers = async(scaleDown = 1, audioCtx) => {
//     const cnvTarget = 'canvasContainer';
//     let inputDevice, audioSource, outputRes;
//     let db = await openDB('visDB', 1, db => {
//         if (db.oldVersion == 0) {
//             console.log(`Error opening database: ${err.message}`);
//             return null;
//         }
//     });
//     inputDevice = await getInputDevice(db);
//     audioSource = await getAudioSource(db);
//     outputRes = await getOutputResolution(db);
//     const scaledRes = {
//         w: (outputRes.w * ((windowWidth / outputRes.w) / scaleDown)) << 0,
//         h: (outputRes.h * ((windowWidth / outputRes.w) / scaleDown)) << 0,
//     };
//     // create and place the canvas
//     pixelDensity(1);
//     const cnv = createCanvas(scaledRes.w, scaledRes.h);
//     cnv.parent(cnvTarget);

//     // set up camera to capture from input source
//     const vidIn = createCapture(inputDevice.constraints, () => {
//         vidIn.hide();
//         vidIn.size(cnv.width, cnv.height);
//     });

//     // set up audio source
//     let stream = await navigator.mediaDevices.getUserMedia({audio: { deviceId: { exact: audioSource.id } } })
//     let audioIn = audioCtx.createMediaStreamSource(stream)
//     return [cnv, vidIn, audioIn];
// }

export const setupVisualiserCanvas = async() => {
    const cnvTarget = document.getElementById('canvasContainer');
    const [inputDevice, audioSource, outputRes] = await getSettings();
    // create canvas
    const cnv = document.createElement('canvas');
    await resizeCanvas(cnvTarget, outputRes, cnv);
    cnvTarget.appendChild(cnv)
    // window.onresize = () => resizeCanvas(cnvTarget, outputRes, cnv);
    // create video node, attach to video input stream
    const vidIn = document.createElement('video');
    vidIn.srcObject = await navigator.mediaDevices.getUserMedia(inputDevice.constraints)
    vidIn.play()
    // create video canvas to read video pixels into
    const vidCnv = document.createElement('canvas');
    resizeCanvas(cnvTarget, outputRes, vidCnv);
    // TODO - create audio in
    let audioIn = null;
    return [cnv, vidCnv, vidIn, audioIn];
}

const resizeCanvas = async (cnvTarget, outputRes, cnv) => {
    const scaledRes = await getResolution(outputRes, cnvTarget);
    cnv.width = cnvTarget.style.width = scaledRes.w;
    cnv.height = cnvTarget.style.height = scaledRes.h;
}

const getResolution = async(outputRes, cnvTarget) => {
    // console.log(cnvTarget);
    cnvTarget.w = parseFloat(window.getComputedStyle(cnvTarget).width)
    const scaledRes = {
        w: cnvTarget.w << 0,
        h: outputRes.h * (cnvTarget.w / outputRes.w) << 0,
    };
    return scaledRes;
}

const getSettings = async() => {
    let db = await openDB('visDB', 1, db => {
        if (db.oldVersion == 0) {
            console.log(`Error opening database: ${err.message}`);
            return null;
        }
    });
    const inputDevice = await getInputDevice(db);
    const audioSource = await getAudioSource(db);
    const outputRes = await getOutputResolution(db);
    return [inputDevice, audioSource, outputRes];
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

const getAudioSource = async(db) => {
    try {
        const result =  await db.get('audioSource', 1);
        return result.source;
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
