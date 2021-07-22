// constructor for ascii video loops
function Ascii() {
    // hoisting
    this.onResize = function() {
        // this is called on resize, but also when song / video is changed
        asciiH = windowHeight / 4;
        asciiW = windowWidth / 8;
        asciiHInc = Math.ceil(currentVid.width/asciiH);
        asciiVInc = Math.ceil(currentVid.height/asciiW);
    }
    currentVid = temp;
    // adjust size of display depending on window
    let asciiH = windowHeight / 4;
    let asciiW = windowWidth / 8;
    // ascii characters to choose, from 'brightest' to 'darkest'
    const asciiKey = ['#', '@', 'M', 'W', '8', 'X', 'D', 'C', 'O', '|', '1', '-', '_', ',', '&nbsp;'];
    // array for the lines of ascii characters
    let displayArr = [];
    // not going to display every pixel, calculate an increment
    let asciiHInc = Math.ceil(currentVid.width/asciiH);
    let asciiVInc = Math.ceil(currentVid.height/asciiW);
    // get DOM element, hide until needed
    const container = document.getElementById('ascii');
    // resize on instantiation
    this.onResize();


    this.draw = function() {
        // only update frame if there is sound playing
        if (audio.isPlaying()) {
            let r, g, b
            // load the pixels from the selected video
            currentVid.loadPixels();
            displayArr = [];
            // iterate through the pixels in the video using x, y
            // increment so we're only looking at pixels we're going to use
            // double the increment for the rows to preserve aspect ratio, ish
            for (let y = 0; y < currentVid.height; y += (2 * asciiHInc)) {
                // span with dynamic id for new row
                let rowStr = '<span id = "' + y + '">';
                for (let x = 0; x < currentVid.width; x += asciiVInc) {
                    // calculate array index from pixel x, y position, get pixel values
                    let vIndex = (x + (y * currentVid.width)) * 4;
                    let vR = currentVid.pixels[vIndex + 0];
                    let vG = currentVid.pixels[vIndex + 1];
                    let vB = currentVid.pixels[vIndex + 2];
                    // calculate the greyscale value from the r g b
                    // this is actually redundant now that I have made the videos black and white at source
                    // leaving it in in case I add any colour videos
                    let avg = (vR * 0.2126 + vG * 0.7152 + vB * 0.0722);
                    // choose ascii character from array depending on greyscale value
                    let asciiIndex = round(map(avg, 255, 0, 0, asciiKey.length - 1));
                    // add ascii character to string
                    rowStr += asciiKey[asciiIndex];
                }
                // finish the span, push the row to the display array
                rowStr += '</span><br />';
                displayArr.push(rowStr);
            }
            // iterate through display array, write to container div
            let str = '';
            for (let i = 0; i < displayArr.length; i ++) {
                str += displayArr[i];
            }
            container.innerHTML = str;
            // dynamically change colour depending on position on screen and sound level
            // this should be possible with the p5 createSpan command
            // but I couldn't make it work, so left it at this revision
            for (let y = 0; y < currentVid.height; y += (2 * asciiHInc)) {
                // let r = map(y, 0, currentVid.height, 100, 255);
                // let rR = map(level, 0, 0.5, r, 255);
                // let g = map(y, 0, currentVid.height, 255, 100);
                // let gG = map(level, 0, 0.5, g, 255);
                // let b = map(y, 0, currentVid.height, 150, 210);
                // let bB = map(level, 0, 0.5, b, 255);
                let a = map(y, 0, currentVid.height, 0.4, 0);
                let aA = map(level, 0, 0.5, a, 1);
                let rR = 255, gG = 255, bB = 255
                document.getElementById(y).style.color = `rgba(${rR}, ${gG}, ${bB}, ${aA})`;
            }
        }
    }

}