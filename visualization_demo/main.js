(function () {
  var visualizations = [];

  function addWaveSurferEvents(wavesurfer) {
    var playElement = '.' + wavesurfer.container.id + '_visualization .play_audio';

    $(playElement).click(function () {
      wavesurfer.playPause();
    });

    wavesurfer.on('play', function () {
      $(playElement + ' i').removeClass('fa-play-circle').addClass('fa-stop-circle');
    });

    wavesurfer.on('pause', function () {
      $(playElement + ' i').removeClass('fa-stop-circle').addClass('fa-play-circle');
    });

    wavesurfer.on('ready', function () {
      $(wavesurfer.container).removeClass('loading').addClass('loaded');
    });
  }

  function addFileEvent() {
    $("#the-file-input").change(function() {
      if (this.files.length > 0) {
        $("#waveform, #spectrogram, #invisible").removeClass('loaded').addClass('loading');
        renderImage(this.files[0]);
      }
    });
  }

  function renderImage(file) {
    var reader = new FileReader();  

    reader.onload = function(event) {
      var url = event.target.result;
      visualizations.forEach(function (wavesurfer) {
        wavesurfer.load(url);
      });
    }
   
    reader.readAsDataURL(file);
  }

  function main() {
    var waveform = Object.create(WaveSurfer);
    var invisible = Object.create(WaveSurfer);
    var spectrogram = Object.create(WaveSurfer);  

    waveform.init({
      container: '#waveform',
      waveColor: '#FF00FF',
    });

    spectrogram.init({
      container: '#spectrogram',
      waveColor: '#FF00FF',
      visualization: 'spectrogram',
      fftSamples: 256,
    });

    invisible.init({
      container: '#invisible',
      visualization: 'invisible',
    });

    visualizations = [waveform, spectrogram, invisible];  

    visualizations.forEach(function (wavesurfer) {
      addWaveSurferEvents(wavesurfer);
    });

    addFileEvent();
  }

  main();
})();




