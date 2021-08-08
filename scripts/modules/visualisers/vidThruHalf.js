const vidThruHalf = function(vidIn) {
    const frame = vidIn.get(0, 0, width, height/2)
    image(frame, 0, 0)
}

export default vidThruHalf