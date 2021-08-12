const lines = function(vx, vy, iR, iG, iB, loResStep, lineSpeed, showVignette, vigMask) {
    push()
    noFill()
    const col = color(iR, iG, iB, Math.floor(random(240, 255)))
    if (showVignette)
        col.setAlpha(alpha(col) * vigMask[vx + (vy * width)])
    stroke(col)
    if (frameCount % lineSpeed >= 0 && frameCount % lineSpeed < Math.floor(lineSpeed/4))
        line(vx - loResStep, vy, vx + loResStep, vy)
    else if (frameCount % lineSpeed >= Math.floor(lineSpeed/4) && frameCount % lineSpeed < Math.floor(lineSpeed/2))
        line(vx - loResStep, vy - loResStep, vx + loResStep, vy + loResStep)
    else if (frameCount % lineSpeed >= Math.floor(lineSpeed/2) && frameCount % lineSpeed < lineSpeed - Math.floor(lineSpeed/4))
        line(vx, vy - loResStep, vx, vy * loResStep)
    else
        line(vx + loResStep, vy - loResStep, vx - loResStep, vy + loResStep)
    pop()
}

export default lines