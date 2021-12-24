import { inputDevice, setInputDevice, outputRes, setOutputRes, cnv, setCanvas, vidIn, setVidIn } from "../../creator.js";

export function setupVisualisers() {
    let openRequest = indexedDB.open('visDB', 1);
    openRequest.onupgradeneeded = () => {
        console.log('onupgradeneeded');
        console.log(openRequest);
    };
    openRequest.onerror = () => {
        console.log('onerror');
        console.log(openRequest.error);
    };
    openRequest.onsuccess = () => {
        const db = openRequest.result;
        // get input device
        const inputDeviceTransaction = db.transaction('inputDevice', 'readwrite');
        const inputDevices = inputDeviceTransaction.objectStore('inputDevice');
        const inputDeviceQuery = inputDevices.get(1);
        inputDeviceQuery.onsuccess = () => {
            setInputDevice(inputDeviceQuery.result.inputDevice);
        };
        inputDeviceQuery.onerror = () => {
            console.log(`Database error: ${inputDeviceQuery.error}`);
        };
        // get output resolution
        const outputResTransaction = db.transaction('outputResolution', 'readwrite');
        const outputResos = outputResTransaction.objectStore('outputResolution');
        const outputResQuery = outputResos.get(1);
        outputResQuery.onsuccess = () => {
            setOutputRes(outputResQuery.result.outputResolution);
            const previewRes = {
                w: outputRes.w * ((windowWidth / outputRes.w) / 4),
                h: outputRes.h * ((windowWidth / outputRes.w) / 4),
            };
            // create and place the canvas
            pixelDensity(1);
            setCanvas(createCanvas(previewRes.w, previewRes.h));
            cnv.parent('preview');

            // set up camera to capture from input source
            setVidIn(createCapture(inputDevice.constraints, () => {
                vidIn.hide();
                vidIn.size(cnv.width, cnv.height);
            }));
        };
        outputResQuery.onerror = () => {
            console.log(`Database error: ${outputResQuery.error}`);
        };
        frameRate(30);
    };
}
