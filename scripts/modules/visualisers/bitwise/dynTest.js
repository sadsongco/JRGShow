import { Visualiser } from "../Visualiser.js";

export class dynTest extends Visualiser {
    processFramePre = function(vidIn, kwargs={}) {
        const { dyn = 0 } = kwargs;
        const { fft = null } = kwargs
        let spectrum = [], waveform = [];
        if (fft) {
            spectrum = fft.analyze();
            waveform = fft.waveform();
        }
        const maxDiameter = 50
        push();
        colorMode(HSB);
        noStroke();
        fill(255, 0, 255);
        for (let i = 0; i< spectrum.length; i++){
          let x = map(i, 0, spectrum.length, 0, width);
          let h = -height + map(spectrum[i], 0, 255, height, 0);
          rect(x, height, width / spectrum.length, h )
        }
        noFill();
        beginShape();
        stroke(20);
        for (let i = 0; i < waveform.length; i++){
            let x = map(i, 0, waveform.length, 0, width);
            let y = map( waveform[i], -1, 1, 0, height);
            vertex(x,y);
        }
        endShape();
        for (let dynIdx in dyn) {
            const val = dyn[dynIdx];
            const hue = Math.trunc((360 * dynIdx) / dyn.length);
            let c = color(hue, 150, 150, 1);
            let x = dynIdx * (width / dyn.length);
            let y = height / 2;
            let d = maxDiameter * val;
            noFill();
            strokeWeight(3);
            stroke(c);
            circle(x, y, d)
        }
        noStroke();
        const cntr = 128;
        const rnge = 100;
        const dynSpeed = 1;
        const bright = cntr + (((dyn[dynSpeed] * 2) - 1) * rnge)
        fill(bright, 160, 255);
        rect(50, 50, 50, 50);
        pop();
    }
    
    params = [
    
    ]
}