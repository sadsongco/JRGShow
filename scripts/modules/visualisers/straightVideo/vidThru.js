export const vidThru = function(vidIn, bw=false, vignette=false, vignetteImage) {
    const frame = vidIn.get()
    image(frame, 0, 0)
    if (bw)
        filter(GRAY)
    if (vignette)
        image(vignetteImage, 0, 0)
}

export const processFramePre = function(vidIn, kwargs={}) {
    const { bw = false } = kwargs;
    image(vidIn, 0, 0)
    if (bw)
        filter(GRAY)
}

/**
 * An array of parameters for this visualiser
 */
 export const params = [
    {
        name: 'bw',
        type: 'toggle',
        value: false
    }
]

export default vidThru;