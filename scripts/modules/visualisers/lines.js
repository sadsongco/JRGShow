const lines = function(vx, vy, iR, iG, iB, loResStep) {
    push()
    noFill()
    stroke(iR, iG, iB, Math.floor(random(240, 255)))
    if (frameCount % 16 >= 0 && frameCount % 16 < 4)
        line(vx - loResStep, vy, vx + loResStep, vy)
    else if (frameCount % 16 >= 4 && frameCount % 16 < 8)
        line(vx - loResStep, vy - loResStep, vx + loResStep, vy + loResStep)
    else if (frameCount % 16 >= 8 && frameCount % 16 < 12)
        line(vx, vy - loResStep, vx, vy * loResStep)
    else
        line(vx + loResStep, vy - loResStep, vx - loResStep, vy + loResStep)
    pop()
}

export default lines