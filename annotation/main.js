var wavesurfer = Object.create(WaveSurfer);

wavesurfer.init({
    container: '#waveform',
    waveColor: '#FF00FF',
    visualization: 'spectrogram',
    fftSamples: 256,
});

wavesurfer.on('ready', function () {
    wavesurfer.enableDragSelection();
});

$('.play_audio').click(function () {
    wavesurfer.playPause(); 
});

wavesurfer.on('play', function () {
    $('.play_audio i').removeClass('fa-play-circle').addClass('fa-stop-circle');
});

wavesurfer.on('pause', function () {
    $('.play_audio i').removeClass('fa-stop-circle').addClass('fa-play-circle');
});

wavesurfer.load('../static/wav/traffic.wav');
