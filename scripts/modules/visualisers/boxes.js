const boxes = function(vx, vy, iR, iG, iB, loResStep) {
    push()
    rectMode(CENTER)
    noStroke()
    fill(iR, iG, iB, Math.floor(random(240, 255)))
    rect(vx, vy, loResStep, loResStep)
    pop()
}

export default boxes