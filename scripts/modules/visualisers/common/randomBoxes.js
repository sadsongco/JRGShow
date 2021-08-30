const randomBoxes = function(run, rand) {
    if (!run || rand)
        return
    noStroke()
    fill(random(0, 255), random(0, 255), random(0, 255), random(0, 100))
    const x = random(30, width-30)
    const y = random(30, height-30)
    const w = random(10, 30)
    const h = random(10, 30)
    rect(x, y, w, h)
}

export default randomBoxes