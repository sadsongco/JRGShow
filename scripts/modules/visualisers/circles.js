const circles = function(vx, vy, iR, iG, iB, loResStep, showVignette, vigMask) {
    push()
    noStroke()
    const col = color(iR, iG, iB, Math.floor(random(240, 255)))
    if (showVignette)
        col.setAlpha(alpha(col) * vigMask[vx + (vy * width)])
    fill(col)
    if (random(0, 1) > 0.9995)
        loResStep *= random(0.5, 2)
    circle(vx, vy, loResStep)
    pop()
}

export default circles