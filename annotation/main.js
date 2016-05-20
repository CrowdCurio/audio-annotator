var wavesurfer = Object.create(WaveSurfer);

wavesurfer.init({
    container: '#waveform',
    waveColor: '#FF00FF',
    visualization: 'spectrogram', 
});

wavesurfer.on('ready', function () {
    var spectrogram = Object.create(WaveSurfer.Spectrogram);

    spectrogram.init({
        fftSamples: 256,
        wavesurfer: wavesurfer,
        container: "#wave-spectrogram",
        getFrequencyRGB: wavesurfer.drawer.Canvas.getFrequencyRGB
    });
});

wavesurfer.load('../static/wav/traffic.wav');
