let cnv;
const videos = [];
let audio;
let textExample;
let visEl;
let fft;
let motionVis;
let temp

function preload() {
    temp = createVideo('./assets/video/JRGReichTest.mov', ()=>console.log('video_loaded'))
    temp.hide()
    // const vidFilenames = ['JRGReichTest.mov', 'violin.mov', 'cello.mov', 'piano.mov'];
    // for (let v = 0; v < vidFilenames.length; v++) {
    //     videos[v] = createVideo(`./assets/video/${vidFilenames[v]}`, ()=>{
    //         console.log('vid loaded')
    //         videos[v].hide()
    //     });
    // }

    audio = loadSound('./assets/audio/JRGAudioExtract.mp3', ()=>{ console.log('audio loaded') }, ()=>{console.log('error loading audio')}, ()=>{ console.log('loading...')});
}

function setup() {
    visEl = document.getElementById('vis');

    frameRate(30);
    pixelDensity(1);

    cnv = createCanvas(windowWidth, windowHeight);
    cnv.parent(visEl);

	fft = new p5.FFT();

    motionVis = new Motion;
}

function draw() {
    // image(temp, 10, 10)
    motionVis.draw();
    // image(videos[0], 0, 0)
}

function mousePressed() {
    temp.loop()
    audio.loop()
}