const Score = function() {
    const scoreImgPath = '../../assets/images/score/'
    const imgs = {
        vlns : [],
        cll: [],
        pno: [],
        full: [],
    }
    const dirs = {
        vlns: 36,
        cll: 20,
        pno: 37,
        full: 8,
    }
    const fixedOffset = {
        vlns: [-300, -200],
        cll: [300, -200],
        pno: [0, 200],
        full: [0, 0]
    }

    this.init = function (){
        for (const [key, value] of Object.entries(dirs)) {
            for (let i = 1; i <= value; i ++) {
                const imgPath = scoreImgPath + key + '/' + key + i + '.png'
                imgs[key][i-1] = (
                    loadImage(imgPath)
                )
            }
        }
    }

    this.draw = function(trigger=false) {
        if (trigger) {
            const imgToDraw = imgs[trigger].shift()
            if (imgToDraw.width > width)
                imgToDraw.resize(width - 200, 0)
            if (imgToDraw.height > height)
                imgToDraw.resize(0, height-200)
            const centrX = (width / 2) - (imgToDraw.width / 2)
            const centrY = (height / 2) - (imgToDraw.height / 2)
            // put it back on the end of the array in case
            // I fuck up so there's always something to draw
            imgs[trigger].push(imgToDraw)
            const xOffset = trigger == 'full' ? 0 : Math.floor(random(-100, 100))
            const yOffset = trigger == 'full' ? 0 : Math.floor(random(-100, 100))
            image(imgToDraw, centrX + fixedOffset[trigger][0] + xOffset,
                centrY + fixedOffset[trigger][1] + yOffset)
        }
    }
}

export default Score