const vidThruPoster = function(vidIn) {
    const frame = vidIn.get()
    image(frame, 0, 0)
    filter(POSTERIZE, 11)
}

export default vidThruPoster