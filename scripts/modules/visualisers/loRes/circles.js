const circles = function(vx, vy, iR, iG, iB, loResStep, showVignette, vigMask) {
    push()
    noStroke()
    const col = color(iR>>1, iG>>1, iB<<1, Math.floor(random(200, 255)))
    const dripCol = color(255)
    if (showVignette) {
        col.setAlpha(alpha(col) * vigMask[vx + (vy * width)])
        dripCol.setAlpha(alpha(dripCol) * vigMask[vx + (vy * width)])
    }
    fill(col)
    if (random(0, 1) > 0.99995) {
        loResStep *= random(0.5, 2)
        stroke(dripCol)
        strokeWeight(random(1, 3))
    }
    circle(vx, vy, loResStep)
    pop()
}

export default circles