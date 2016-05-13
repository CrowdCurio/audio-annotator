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
function renderImage(file) {

  // generate a new FileReader object
  var reader = new FileReader();

  reader.onload = function(event) {
    the_url = event.target.result
    wavesurfer.load(the_url);
  }
 
  reader.readAsDataURL(file);
}
$("#the-file-input").change(function() {
    renderImage(this.files[0]);
});

