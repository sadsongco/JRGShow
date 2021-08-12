const processVisMessage = function(e) {
    let currTrackEl = document.querySelector('.currTrack')
    if ('visTransition' in e.data) {
        if (e.data.visTransition) {
            currTrackEl.classList.remove('currTrack')
            currTrackEl.classList.add('visLoading')
        }
        else
        currTrackEl.classList.remove('visLoading')
        currTrackEl.classList.add('currTrack')
}

}

export default processVisMessage