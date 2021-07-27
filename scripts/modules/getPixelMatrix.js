const getPixelMatrix = function(vy, vx, width, height, inputPixels, dim=3) {
    let pixArr = nj.zeros([dim, dim], 'int8')
    const centre = Math.floor(dim/2)
    for (let i = 0; i < dim; i ++) {
        for (let j = 0; j < dim; j ++) {
            const colOffset = j - centre
            const rowOffset = i - centre
            let col = vx + colOffset
            if (col < 0 || col > width - 1) col = vx
            let row = vy + rowOffset
            if (row < 0 || row > height - 1) row = vy
            const pixIdx = ((row * width) + col) * 4
            pixArr.set(j, i, inputPixels[pixIdx])
        }
    }
    return pixArr
}

export default getPixelMatrix