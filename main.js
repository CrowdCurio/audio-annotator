var wavesurfer = Object.create(WaveSurfer);

wavesurfer.init({
  container: '#waveform',
  waveColor: 'red',
  progressColor: 'purple' 
});

wavesurfer.on('ready', function () {
    var spectrogram = Object.create(WaveSurfer.Spectrogram);

    spectrogram.init({
        wavesurfer: wavesurfer,
        container: "#wave-spectrogram"
    });
});

wavesurfer.load('traffic.wav');
