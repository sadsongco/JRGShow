import { Visualiser } from "../Visualiser.js"

// const boxes = function(vx, vy, iR, iG, iB, loResStep, showVignette, vigMask) {
//     push()
//     rectMode(CENTER)
//     noStroke()
//     const col = color(iR, iG, iB, Math.floor(random(240, 255)))
//     if (showVignette)
//         col.setAlpha(alpha(col) * vigMask[vx + (vy * width)])
//     fill(col)
//     rect(vx, vy, loResStep, loResStep)
//     pop()
// }

// export default boxes

export class boxes extends Visualiser {
    constructor() {
        super();
        this.pg;
    }
    preload = async function() {
        this.pg = createGraphics(width, height);
    }
    processFramePre = function() {
        this.pg.clear();
    }
    processPixels = function(pixIdx, pixVals, kwargs={}) {
        let [iR, iG, iB] = pixVals;
        const { prevSize } = kwargs;
        const { vx = 0, vy = 0 } = kwargs; 
        let { loResStep = 160 } = kwargs;
        if (kwargs.dynRes === true) {
            const { dyn = 0 } = kwargs;
            const { dynRange = 100 } = kwargs;
            const { dynSpeed = 1 } = kwargs;
            loResStep += ((dyn[dynSpeed] * 2) - 1) * dynRange;
        }
        if (vx % (loResStep / prevSize) != 0 || vy % (loResStep / prevSize) != 0) return;
        this.pg.push()
        this.pg.rectMode(CENTER)
        this.pg.noStroke()
        const col = color(iR, iG, iB);
        this.pg.fill(col)
        this.pg.rect(vx, vy, loResStep / prevSize, loResStep / prevSize)
        this.pg.pop()
    }
    processFramePost = function() {
        image(this.pg, 0, 0);
    }
    params = [
        {
            name: "loResStep",
            displayName: "Resolution",
            type: "val",
            range: [
                0, 640
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