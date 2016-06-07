'use strict';

function addWaveSurferEvents(wavesurfer, playBar, stages) {
    var updateProgressBar = function () {
        var progress = wavesurfer.getCurrentTime() / wavesurfer.getDuration();
        wavesurfer.seekTo(progress);
    };
    // Update progress bar to the currentTime when the sound clip is 
    // finished or paused since it is only updated on audioprocess
    wavesurfer.on('pause', updateProgressBar);
    wavesurfer.on('finish', updateProgressBar);

    // When a new sound file is loaded into the wavesurfer update the regions 
    // on the wavesurfer obj, and update the play bar and annotations stages
    wavesurfer.on('ready', function () {
        wavesurfer.clearRegions()
        playBar.update();
        stages.updateStage(1);
    });
}

function main() {
    // Create color map for spectrogram
    var spectrogramColorMap = colormap({
        colormap: magma,
        nshades: 256,
        format: 'rgb',
        alpha: 1    
    });

    // Create wavesurfer
    var height = 128;
    var wavesurfer = Object.create(WaveSurfer);
    wavesurfer.init({
        container: '#waveform',
        waveColor: '#FF00FF',
        visualization: experimentData["visualization_type"],
        // For the spectrogram the height is half the number of fftSamples
        fftSamples: height * 2,
        height: height,
        colorMap: spectrogramColorMap
    });

    // Create the play button and time that appear below the wavesurfer
    var playBar = new PlayBar(wavesurfer);
    playBar.createPlayBar();

    // Create the annotation stages that appear below the wavesurfer
    var stages = new AnnotationStages(
        wavesurfer, 
        experimentData["proximity_tags"], 
        experimentData["annotation_tags"]
    );
    stages.createStages();

    addWaveSurferEvents(wavesurfer, playBar, stages);
    // Load sound file into wavesurfer
    wavesurfer.load(experimentData["url"]);
}

main();
