var wavesurfer = Object.create(WaveSurfer);

wavesurfer.init({
  container: '#waveform',
  waveColor: '#FF00FF',
  interact: false,
  cursorWidth: 0,
});

wavesurfer.on('ready', function () {
    $("#waveform, #wave-spectrogram").removeClass('loading').addClass('loaded');
    
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
  var reader = new FileReader();

  reader.onload = function(event) {
    var url = event.target.result;
    wavesurfer.load(url);
  }
 
  reader.readAsDataURL(file);
}

$("#the-file-input").change(function() {
    if (this.files.length > 0) {
      $("#waveform, #wave-spectrogram").removeClass('loaded').addClass('loading');
      $("spectrogram").remove();
      renderImage(this.files[0]);
    }
});

