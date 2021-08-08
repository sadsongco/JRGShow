const motion = function(pixIdx, iR, iG, iB, loResHalfStep, motionThresh, prevFrame, pixels) {
    let motion = false
    const currVec = createVector(iR, iG, iB)
    if (prevFrame) {
        const prevVec = createVector(prevFrame[pixIdx + 0], prevFrame[pixIdx + 1], prevFrame[pixIdx + 2])
        motion = currVec.dist(prevVec) > motionThresh
    }

    if (motion) {
        for (let i = -loResHalfStep; i < loResHalfStep; i ++) {
            pixels[pixIdx + (i*4) + 0] = 255
            pixels[pixIdx + (i*4) + 1] = 255
            pixels[pixIdx + (i*4) + 2] = 255
            pixels[pixIdx + (i*4) + 3] = 255
        }
    } else {
        for (let i = -loResHalfStep; i < loResHalfStep; i ++) {
            pixels[pixIdx + (i*4) + 0] = iR
            pixels[pixIdx + (i*4) + 1] = iG
            pixels[pixIdx + (i*4) + 2] = iB
            pixels[pixIdx + (i*4) + 3] = 100
        }
    }
}

export default motion