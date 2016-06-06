'use strict';

function addWaveSurferEvents(wavesurfer) {
    wavesurfer.on('pause', function () {
        wavesurfer.seekTo(wavesurfer.getCurrentTime() / wavesurfer.getDuration());
    });

    wavesurfer.on('finish', function () {
        wavesurfer.seekTo(wavesurfer.getCurrentTime() / wavesurfer.getDuration());
    });
}

function main() {
    var wavesurfer = Object.create(WaveSurfer);

    var spectrogramColorMap = colormap({
        colormap: 'hot',
        nshades: 256,
        format: 'rgb',
        alpha: 1    
    });

    var height = 128;
    wavesurfer.init({
        container: '#waveform',
        waveColor: '#FF00FF',
        visualization: experimentData["visualization_type"],
        fftSamples: height * 2,
        height: height,
        colorMap: spectrogramColorMap,
    });

    addWaveSurferEvents(wavesurfer);

    var stages = new AnnotationStages(
        wavesurfer, 
        experimentData["proximity_tags"], 
        experimentData["annotation_tags"]
    );
    stages.createStages();

    var playBar = new PlayBar(wavesurfer);
    playBar.createPlayBar();

    wavesurfer.on('ready', function () {
        wavesurfer.clearRegions()
        playBar.update();
        stages.updateStage(1);
    });
    
    wavesurfer.load(experimentData["url"]);
}

main();
