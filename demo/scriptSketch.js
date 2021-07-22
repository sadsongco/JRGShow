const vids = []
let audio
const hpos = [50, 250, 450, 650]
let scriptFont

function preload() {
    const vidFilenames = ['JRGReichTest.mov', 'violin.mov', 'cello.mov', 'piano.mov'];
    for (let v = 0; v < vidFilenames.length; v++) {
        vids[v] = createVideo(`./assets/video/${vidFilenames[v]}`, ()=>{
            console.log('vid loaded')
            vids[v].hide()
        });
    }
    audio = loadSound('./assets/audio/JRGAudioExtract.mp3', ()=>{ console.log('audio loaded') }, ()=>{console.log('error loading audio')}, ()=>{ console.log('loading...')});
    textExample = loadStrings('./assets/text/example.txt', ()=>{console.log('text loaded')}, ()=>{console.log('error loading text')});
    scriptFont = loadFont('./assets/fonts/CourierPrime-Regular.ttf')
}

function setup() {
    visEl = document.getElementById('vis');

    frameRate(30);
    pixelDensity(1);

    cnv = createCanvas(windowWidth, windowHeight);
    cnv.parent(visEl);

    script = new Script()
}

function draw() {
    background(0, 5)
    for (const vidIdx in vids) {
        const img = vids[vidIdx].get()
        img.filter(GRAY)
        image(img, hpos[vidIdx], 30, 200, 300)
    }
    if (frameCount > frameRate() * 5 && audio.isPlaying() && frameCount % int(frameRate()/4) === 0) {
        script.draw()
    }
}

function mousePressed() {
    if (audio.isPlaying()) {
        audio.pause()
        return pauseVideos()
    }
    audio.loop()
    playVideos()
}

function pauseVideos() {
    for (const vid of vids) {
        vid.pause()
    }
}

function playVideos() {
    for (const vid of vids) {
        vid.loop()
    }
}