let cnv;
const videos = [];
let audio;
let textExample;
let visEl;
let fft;
let motionVis;
let temp
let amp, level

function preload() {
    temp = createVideo('./assets/video/violin.mov', ()=>console.log('video_loaded'))
    temp.hide()

    audio = loadSound('./assets/audio/JRGAudioExtract.mp3', ()=>{ console.log('audio loaded') }, ()=>{console.log('error loading audio')}, ()=>{ console.log('loading...')});

    textExample = loadStrings('./assets/text/example.txt', ()=>{console.log('text loaded')}, ()=>{console.log('error loading text')});
}

function setup() {
    frameRate(30);
    pixelDensity(1);

	fft = new p5.FFT();

    ascii = new Ascii();
    amplitude = new p5.Amplitude();
}

function draw() {
    level = amplitude.getLevel();
    ascii.draw()
}

function mousePressed() {
    if (audio.isPlaying()) {
        audio.pause()
        return temp.pause()
    }
    audio.loop()
    temp.loop()
}