import { Visualiser } from "../../../_prototype/modules/visualisers/Visualiser.js"
import { greyscaleCalc } from "../../util/utils.js";
import Vector from "../../../classes/Vector.js";

export class motion extends Visualiser {
    constructor() {
        super();
        this.prevFrame = false;
        this.motion = false;
    }
    processPixels = function(pixIdx, pixVals, kwargs = {}, pixels) {
        if (Math.random() > 0.999999) console.log(this.prevFrame)
        if (!this.prevFrame) return
        const { resolution = 1 } = kwargs;
        if (pixIdx % resolution !== 0) return
        let [iR, iG, iB] = pixVals;
        const { motionThresh = 20 } = kwargs;
        const { lyrOpacity = 1 } = kwargs;
        const { bw = false } = kwargs;
        const { motionColToggle = false } = kwargs;
        const { motion_col = [255, 255, 255] } = kwargs;
        const [r, g, b] = motion_col;
        let oR = 0;
        let oG = 0;
        let oB = 0;
        const greyscale = greyscaleCalc(pixVals);
        const currVec = new Vector(iR, iG, iB)
        const prevVec = new Vector(this.prevFrame[pixIdx + 0], this.prevFrame[pixIdx + 1], this.prevFrame[pixIdx + 2])
        this.motion = currVec.distSq(prevVec) > (motionThresh*motionThresh);
        if (!this.motion) return
        oR = iR;
        oG = iG;
        oB = iB;
        if (bw)
            oR = oG = oB = greyscale
        if (motionColToggle) {
            oR = r;
            oG = g;
            oB = b;
        }
        // loop over resolution area and draw pixels
        for (let rx = 0; rx <= resolution; rx++) {
            for (let ry = 0; ry <= resolution; ry++) {
                let localPixIdx = (((ry + kwargs.vy) * pixels.width) + ( + kwargs.vx)) * 4;
                pixels.data[localPixIdx+0] = (oR * lyrOpacity) + (pixels.data[pixIdx+0] * (1 - lyrOpacity));
                pixels.data[localPixIdx+1] = (oG * lyrOpacity) + (pixels.data[pixIdx+1] * (1 - lyrOpacity));
                pixels.data[localPixIdx+2] = (oB * lyrOpacity) + (pixels.data[pixIdx+2] * (1 - lyrOpacity));
            }
        }

        // for (let i = 0; i < resolution; i ++) {
        //     const resStep = i * resolution;
            // //     context.pixels[pixIdx + (i*4) + 0] = oR
            // //     context.pixels[pixIdx + (i*4) + 1] = oG
            // //     context.pixels[pixIdx + (i*4) + 2] = oB
            // // }
        // }
    }
    notMethod = function(prop) {

    }
    processFramePost = function(vidPixels, kwargs = {}, context) {
        console.log(vidPixels)
        this.prevFrame = vidPixels;
    }
    params = [
        {
            name: "motionThresh",
            displayName: "Motion Threshold",
            type: "val",
            range: [
                0, 255
            ],
            value: 20
        },
        {
            name: "lyrOpacity",
            displayName: "Layer Opacity",
            type: "val",
            range: [
                0, 1
            ],
            step: 0.1,
            value: 1
        },
        {
            name: "resolution",
            displayName: "Resolution",
            type: "val",
            range: [
                1, 24
            ],
            step: 1,
            value: 1
        },

        {
            name: "bw",
            displayName: "Black and White",
            type: "toggle",
            value: false
        },
        {
            name: "motionColToggle",
            displayName: "Motion Colour",
            type: "toggle",
            value: false
        },
        {
            name: "motion_col",
            displayName: "Motion Colour picker",
            type: "colour",
            value: "#ffffff",
        }
   ]
}