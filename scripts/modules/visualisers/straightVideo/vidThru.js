const vidThru = function(vidIn, bw=false, vignette=false, vignetteImage) {
    const frame = vidIn.get()
    image(frame, 0, 0)
    if (bw)
        filter(GRAY)
    if (vignette)
        image(vignetteImage, 0, 0)
}

export default vidThru