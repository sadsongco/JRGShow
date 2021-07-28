// constructor for ascii video loops
const ascii = function (myCapture, gfx, myAsciiArt) {
    let ascii_arr;
    gfx.background(0);
    gfx.image(myCapture, 0, 0, gfx.width, gfx.height);
    gfx.filter(POSTERIZE, 5)
    ascii_arr = myAsciiArt.convert(gfx)
    myAsciiArt.typeArray2d(ascii_arr, this);
}

export default ascii;