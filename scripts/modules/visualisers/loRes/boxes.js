import { Visualiser } from "../Visualiser.js"

export class boxes extends Visualiser {

    processPixels = function(pixIdx, pixVals, kwargs={}) {
        let [iR, iG, iB] = pixVals;
        const { previewSize } = kwargs;
        const { lyrOp = 1 } = kwargs;
        const { vx = 0, vy = 0 } = kwargs; 
        let { loResStep = 160 } = kwargs;
        loResStep /= previewSize;
        if (kwargs.dynRes === true) {
            const { dyn = 0 } = kwargs;
            const { dynRange = 100 } = kwargs;
            const { dynResSpeed = 1 } = kwargs;
            loResStep = (loResStep + (((dyn[dynResSpeed] * 2) - 1) * (dynRange / (2 * previewSize)))) | 0;
            if (loResStep < 1) loResStep = 1;
        }
        if (vx % loResStep != 0 || vy % loResStep != 0) return;
        for (let nx = vx; nx < vx+loResStep; nx++) {
            if (nx > width) break;
            for (let ny = vy; ny < vy+loResStep; ny++) {
                if (ny > height) break;
                let nIdx = ((ny * width) + nx) * 4;
                if (nIdx >= pixels.length) break;
                pixels[nIdx + 0] = (iR * lyrOp) + (pixels[nIdx + 0] * (1 - lyrOp));
                pixels[nIdx + 1] = (iG * lyrOp) + (pixels[nIdx + 1] * (1 - lyrOp));
                pixels[nIdx + 2] = (iB * lyrOp) + (pixels[nIdx + 2] * (1 - lyrOp));
            }
        }

    }
    params = [
        {
            name: "loResStep",
            displayName: "Resolution",
            type: "val",
            range: [
                1, 320
            ],
            value: 160
        },
        {
            name: "dynRes",
            displayName: "Dynamic Resolution",
            type: "toggle",
            value: "false"
        },
        {
            name: "dynRange",
            displayName: "Dynamic Resolution Range",
            type: "val",
            range: [0, 640],
            value: 100
        },
        {
            name: "dynResSpeed",
            displayName: "Dynamic Resolution Speed",
            type: "val",
            range: [
                0, 7
            ],
            value: 0
        }
    ]
}