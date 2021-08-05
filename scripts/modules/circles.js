const circles = function(vx, vy, iR, iG, iB, loResStep) {
    push()
    noStroke()
    fill(iR, iG, iB, Math.floor(random(240, 255)))
    if (random(0, 1) > 0.9995)
        loResStep *= random(0.5, 2)
    circle(vx, vy, loResStep)
    pop()
}

export default circles