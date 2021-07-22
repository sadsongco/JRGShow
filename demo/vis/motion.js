// constructor for webcam visualiser
function Motion() {
    // constructor properties
    // capture peaks
    const peak = new p5.PeakDetect(50, 200, 0.7, 2);
    let peakCol = 0;
    // motion detection properties
    let prevFrame = false;
    const motionThresh = 50;
    let motion = false;
    let vScale = 1
    let pixelJump = 5
    const currVid = temp
    
    this.draw = function() {
        background(0, map(sin(frameCount/113), -1, 1, 10, 200))
        // fill(random(0, 255))
        // noStroke()
        // rect(random(0, width), random(0, height), random(0, 5), random(0, 5))
        // currVid.loop()
        // image(currVid, 10, 10)
        // analyse spectrum and peaks, get bands
        fft.analyze(256);
        peak.update(fft);
        if (peak.isDetected) {
            peakCol = (peakCol + 1) % (width / vScale);
        }
        let bass = fft.getEnergy('bass');
        let mid = fft.getEnergy('mid');
        let treble = fft.getEnergy('treble');
        let avg = (bass + mid + treble) / 3;
        // console.log(bass, mid, treble, avg)
        // initialise canvas with processed webcam frame
        const currImg = currVid.get()
        tint(50, map(sin(frameCount/271), -1, 1, 0, 190));
        // let sizeCof = map(avg, 0, 255, 0.95, 1.2);
        currImg.filter(GRAY);
        // currImg.filter(INVERT);
        image(currImg, 0, 0);
        // get pixels arrays from canvas and webcam
        loadPixels();
        currVid.loadPixels();
        let fIndex, fR, fG, fB, fA
        pixelJump = int(map(sin(frameCount / 30), -1, 1, 2, 10))
        for (let vy = 0; vy < currVid.height; vy += pixelJump) {
            for (let vx = 0; vx < currVid.width; vx += pixelJump) {
                motion = false
                fIndex = ((vx + (vy * currVid.width)) * 4)
                let colVect = createVector(currVid.pixels[fIndex + 0], currVid.pixels[fIndex + 1], currVid.pixels[fIndex + 2])
                if (prevFrame) {
                    let compVect = createVector(prevFrame[fIndex + 0], prevFrame[fIndex + 1], prevFrame[fIndex + 2]);
                    motion = colVect.dist(compVect) > motionThresh
                }
                if (motion) {
                    fR = currVid.pixels[fIndex + 0]
                    fG = currVid.pixels[fIndex + 1]
                    fB = currVid.pixels[fIndex + 2]
                    if (fR > 127) {
                        fR = map(bass, 127, 255, fR, 255);
                    } else {
                        fR = map(bass, 0, 127, fR, 0);
                    }
                    if (fG > 127) {
                        fG = map(mid, 127, 255, fG, 255);
                    } else {
                        fG = map(mid, 0, 127, fG, 0);
                    }
                    if (fB < 127) {
                        fB = map(treble, 127, 255, fB, 255);
                    } else {
                        fB = map(treble, 0, 127, fB, 0);
                    }

                } else {
                    // no motion, draw pixels from pixel array
                    // fR = pixels[fIndex + 0]
                    // fG = pixels[fIndex + 1]
                    // fB = pixels[fIndex + 2]
                }
                fA = map(avg, 0, 255, 100, 255)
                // for (let k = floor(vScale / -2); k < floor(vScale / 2); k ++) {
                    // if (frameCount % 3 == 0) {
                        pIndex = ((((vx * vScale))+ (vy * vScale * width)) * 4);
                        pixels[pIndex + 0] = fR;
                        pixels[pIndex + 1] = fG;
                        pixels[pIndex + 2] = fB;
                        pixels[pIndex + 3] = fA;
                    // } else if (frameCount % 3 === 1) {
                    //     pIndex = ((width - (vx * vScale) + (((vy * vScale) + k) * width)) * 4);
                    //     pixels[pIndex + 0] = fG;
                    //     pixels[pIndex + 1] = fB;
                    //     pixels[pIndex + 2] = fR;  
                    //     pixels[pIndex + 3] = fA;
                    // }
                // }
            }
        }
    //     // loop through pixels in webcam
    //     let fIndex, pIndex;
    //     for (let vy = 0; vy < currVid.height; vy ++) {
    //         // new pixel, reset motion detection
    //         motion = false;
    //         for (let vx = 0; vx < currVid.width; vx ++) {
    //             // I find it easier to manipulate pixels when I think in 
    //             // pixel coordinates, hence the nested loops
    //             let dR, dG, dB;
    //             // convert pixel coordinates to array index
    //             fIndex = ((vx + (vy * currVid.width)) * 4);
    //             // create vector of this pixel, and this pixel in previous frame
    //             let colVect = createVector(currVid.pixels[fIndex + 0], currVid.pixels[fIndex + 1], currVid.pixels[fIndex + 2]);
    //             if (prevFrame) {
    //                 let compVect = createVector(prevFrame[fIndex + 0], prevFrame[fIndex + 1], prevFrame[fIndex + 2]);
    //                 // if difference is more than threshold, set motion flag
    //                 motion = colVect.dist(compVect) > motionThresh;
    //             }
    //             // if motion detected, draw pixels from webcam
    //             if (motion) {
    //                 let fR = currVid.pixels[fIndex + 0];
    //                 let fG = currVid.pixels[fIndex + 1];
    //                 let fB = currVid.pixels[fIndex + 2];
    //                 let fA = currVid.pixels[fIndex + 3];
    //                 if (fR > 127) {
    //                     dR = map(bass, 127, 255, fR, 255);
    //                 } else {
    //                     dR = map(bass, 0, 127, fR, 0);
    //                 }
    //                 if (fG > 127) {
    //                     dG = map(mid, 127, 255, fG, 255);
    //                 } else {
    //                     dG = map(mid, 0, 127, fG, 0);
    //                 }
    //                 if (fB < 127) {
    //                     dB = map(treble, 127, 255, fB, 255);
    //                 } else {
    //                     dB = map(treble, 0, 127, fB, 0);
    //                 }
    //             } else {
    //                 // no motion, draw pixels from pixel array
    //                 pIndex = (((vx * vScale) + 2 + (vy * vScale * width)) * 4);
    //                 dR = pixels[pIndex + 0], dG = pixels[pIndex + 1], dB = pixels[pIndex + 2];
    //             }
    //             let dA = 255;
    //             for (let k = floor(vScale / -2); k < floor(vScale / 2); k ++) {
    //                 if (frameCount % 3 == 0) {
    //                     pIndex = (((width - (vx * vScale)) + k + (vy * vScale * width)) * 4);
    //                     pixels[pIndex + 0] = dR;
    //                     pixels[pIndex + 1] = dG;
    //                     pixels[pIndex + 2] = dB;
    //                     pixels[pIndex + 3] = dA;
    //                 } else if (frameCount % 3 === 1) {
    //                     pIndex = ((width - (vx * vScale) + (((vy * vScale) + k) * width)) * 4);
    //                     pixels[pIndex + 0] = dG;
    //                     pixels[pIndex + 1] = dB;
    //                     pixels[pIndex + 2] = dR;  
    //                     pixels[pIndex + 3] = dA;
    //                 }
    //             }
    //         }
    //     }
    // // store this frame's pixels for motion comparison
    prevFrame = Array.from(currVid.pixels);
    // // blast all the pixels at the screen
    updatePixels();
    }
}