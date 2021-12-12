const newGetPixelValues = function(pixIdx) {
    // if (random(0, 1) > 0.99999)
    //     console.log(pixels[pixIdx])
    const iR = pixels[pixIdx + 0]
    const iG = pixels[pixIdx + 1]
    const iB = pixels[pixIdx + 2]
    return [iR, iG, iB]
}

export default newGetPixelValues