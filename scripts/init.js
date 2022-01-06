window.onload = () => {
    // setup persistent storage
    let openRequest = indexedDB.open('visDB', 1);
    openRequest.onupgradeneeded = () => {
        console.log('onupgradeneeded');
        console.log(openRequest);
        let db = openRequest.result;
        if (!db.objectStoreNames.contains('outputResolution'))
            db.createObjectStore('outputResolution', {keyPath: 'id'});
        if (!db.objectStoreNames.contains('inputDevice'))
            db.createObjectStore('inputDevice', {keyPath: 'id'});
        if (!db.objectStoreNames.contains('audioSource'))
            db.createObjectStore('audioSource', {keyPath: 'id'});
            if (!db.objectStoreNames.contains('visChains'))
            db.createObjectStore('visChains', {keyPath: 'id'});
        if (!db.objectStoreNames.contains('setlist')) {
            let setlist = db.createObjectStore('setlist', {keyPath: 'name'});
            let setPosIdx = setlist.createIndex('setpos', 'position', { unique:true });
        }
    }
    openRequest.onerror = () => {
        console.log('onerror');
        console.log(openRequest);
    }
    openRequest.onsuccess = () => {
        let db = openRequest.result;
        console.log(`Database opened:`);
        console.log(db);
    }
}


// helper function for capturing from specific video source
// https://editor.p5js.org/codingtrain/sketches/JjRoa1lWO
const devices = [], audioSources = [];
const deviceTarget = document.getElementById('vidsrc');
const deviceSelector = document.createElement('select');
const audioTarget = document.getElementById('audiosrc');
const audioSelector = document.createElement('select');

/**
 * Creates variables and HTML selector from available video input devices
 * @param {array} deviceInfos - available video input devices
 */
const gotDevices = (deviceInfos) => {
    for (let deviceInfo of deviceInfos) {
        if (deviceInfo.kind == 'videoinput') {
            devices.push({
                label: deviceInfo.label,
                id: deviceInfo.deviceId
            });
        }
        if (deviceInfo.kind == 'audioinput') {
            audioSources.push({
                label: deviceInfo.label,
                id: deviceInfo.deviceId
            });
        }
    }
    for (let deviceIdx in devices) {
        const device = devices[deviceIdx];
        let supportedConstraints = navigator.mediaDevices.getSupportedConstraints();
        device.constraints = {
            video: {
                deviceId: {
                    exact: device.id
                },
            },
            resize: supportedConstraints['height'] && supportedConstraints['width']
        };
        const option = document.createElement('option');
        option.value = deviceIdx
        option.text = device.label;
        deviceSelector.add(option)
    }
    deviceTarget.appendChild(deviceSelector);
    for (let audioIdx in audioSources) {
        const device = audioSources[audioIdx];
        const option = document.createElement('option');
        option.value = audioIdx
        option.text = device.label;
        audioSelector.add(option)
    }
    audioTarget.appendChild(audioSelector);
}

const gotSources = (deviceList) => {
    console.log(deviceList);
}

/**
 * Writes resolution and input device to database, redirects to hub page
 */
const launchVis = () => {
    console.log(resolutions[resSelector.value])
    console.log(devices[deviceSelector.value])
    console.log(audioSources[audioSelector.value])
    let openRequest = indexedDB.open('visDB', 1);
    openRequest.onerror = () => {
        return 'Database error'
    }
    openRequest.onsuccess = () => {
        let db = openRequest.result;
        // write output resolution to db
        let transaction = db.transaction('outputResolution', 'readwrite');
        let writeSettings = transaction.objectStore('outputResolution');
        let outputSettings = {
            id: 1,
            outputResolution: resolutions[resSelector.value]
        }
        writeSettings.put(outputSettings);
        // write video input settings to db
        transaction = db.transaction('inputDevice', 'readwrite');
        writeSettings = transaction.objectStore('inputDevice');
        let inputDevice = {
            id: 1,
            inputDevice: devices[deviceSelector.value]
        }
        writeSettings.put(inputDevice);
        // write audio input settings to db
        transaction = db.transaction('audioSource', 'readwrite');
        writeSettings = transaction.objectStore('audioSource');
        let audioDevice = {
            id: 1,
            sources: audioSources,
            sourceIdx: parseInt(audioSelector.value),
            source: audioSources[audioSelector.value]
        }
        writeSettings.put(audioDevice);
    }
    window.location.href = "hub.html";
}

// get video and audio sources
// TODO selected device doesn't carry over - look here: https://jsfiddle.net/bomzj/beap6n2g/
navigator.mediaDevices.enumerateDevices()
.then(gotDevices)

// create dropbown selector for output options
const resolutions = [
    {
        label: 'SD',
        name: '480p',
        w: 640,
        h: 480
    },
    {
        label: 'HD',
        name: '720p',
        w: 1280,
        h: 720
    },
    {
        label: 'Full HD',
        name: '1080p',
        w: 1920,
        h: 1080
    }
];

const resTarget = document.getElementById('vidres');
const resSelector = document.createElement('select');

for (let resIdx in resolutions) {
    const res = resolutions[resIdx]
    const option = document.createElement('option');
    option.value = resIdx;
    option.text = `${res.label} ${res.name} (${res.w} x ${res.h})`;
    resSelector.add(option);
}

resTarget.appendChild(resSelector)

// set up launch button
const launchTarget = document.getElementById('launch');
const launcher = document.createElement('button');
launcher.innerText = "Launch";
launchTarget.appendChild(launcher);
launcher.addEventListener('click', launchVis);