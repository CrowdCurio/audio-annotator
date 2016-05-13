var wavesurfer = Object.create(WaveSurfer);

wavesurfer.init({
  container: '#waveform',
  waveColor: 'red',
  progressColor: 'purple'
});

wavesurfer.on('ready', function () {
    var spectrogram = Object.create(WaveSurfer.Spectrogram);

    var colorFunc = function(colorValue) {
      if (colorValue < 90) {
        return 'rgb(255, 255, 255)';
      } else if (colorValue < 150) {
        return 'rgb(255, 0, 0)';
      } else if (colorValue < 185) {
        return 'rgb(255, 0, 255)';
      } else {
        return 'rgb(51, 153, 255)';
      }
    }

    spectrogram.init({
        wavesurfer: wavesurfer,
        container: "#wave-spectrogram",
        getFrequencyRGB: colorFunc
    });
});

wavesurfer.load('traffic.wav');
