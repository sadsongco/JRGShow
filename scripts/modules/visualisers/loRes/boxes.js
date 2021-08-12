const boxes = function(vx, vy, iR, iG, iB, loResStep, showVignette, vigMask) {
    push()
    rectMode(CENTER)
    noStroke()
    const col = color(iR, iG, iB, Math.floor(random(240, 255)))
    if (showVignette)
        col.setAlpha(alpha(col) * vigMask[vx + (vy * width)])
    fill(col)
    rect(vx, vy, loResStep, loResStep)
    pop()
}

export default boxes