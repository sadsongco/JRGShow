const vidThru = function(vidIn) {
    const frame = vidIn.get()
    image(frame, 0, 0)
}

export default vidThru