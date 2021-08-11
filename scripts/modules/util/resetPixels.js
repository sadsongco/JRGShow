const resetPixels = function(pixels) {
    for (let i = 3; i < pixels.length; i += 4)
        pixels[i] = 0
}

export default resetPixels