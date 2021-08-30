const vidThru = function(vidIn, bw=false) {
    const frame = vidIn.get()
    image(frame, 0, 0)
    if (bw)
        filter(GRAY)
}

export default vidThru