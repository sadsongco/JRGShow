const TestCard = function() {

    let testImage

    this.init = function() {
        testImage = loadImage(
            './assets/images/test/testpattern.jpg',
            ()=>console.log('testpattern loaded'),
            ()=>console.log('testpattern loading failed')
        )
    }

    this.draw = function() {
        image(testImage, 0, 0, width, height)
    }
}

export default TestCard