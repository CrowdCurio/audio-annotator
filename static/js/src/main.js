'use strict';

function UrbanEars() {
    this.wavesurfer;
    this.playBar;
    this.stages;
    this.nextTask;
    this.experimentData = [];

    // Create color map for spectrogram
    var spectrogramColorMap = colormap({
        colormap: magma,
        nshades: 256,
        format: 'rgb',
        alpha: 1
    });

    // Create wavesurfer
    var height = 128;
    this.wavesurfer = Object.create(WaveSurfer);
    this.wavesurfer.init({
        container: '#waveform',
        waveColor: '#FF00FF',
        progressColor: '#FF00FF',
        // For the spectrogram the height is half the number of fftSamples
        fftSamples: height * 2,
        height: height,
        colorMap: spectrogramColorMap
    });

    // Create the play button and time that appear below the wavesurfer
    this.playBar = new PlayBar(this.wavesurfer);
    this.playBar.create();

    // Create the annotation stages that appear below the wavesurfer
    this.stages = new AnnotationStages(this.wavesurfer);
    this.stages.create();

    // Create Submit btn
    this.nextTask = new NextTask();
    this.nextTask.create();

    this.addEvents();
}

UrbanEars.prototype = {
    addWaveSurferEvents: function() {
        var my = this;
        var updateProgressBar = function () {
            var progress = my.wavesurfer.getCurrentTime() / my.wavesurfer.getDuration();
            my.wavesurfer.seekTo(progress);
        };
        // Update progress bar to the currentTime when the sound clip is 
        // finished or paused since it is only updated on audioprocess
        this.wavesurfer.on('pause', updateProgressBar);
        this.wavesurfer.on('finish', updateProgressBar);    

        // When a new sound file is loaded into the wavesurfer update the regions 
        // on the wavesurfer obj, and update the play bar and annotations stages
        this.wavesurfer.on('ready', function () {
            my.playBar.update();
            my.stages.updateStage(1);
        });
    },

    addNextTaskEvents: function() {
        $(this.stages).on('stage-updated', this.nextTask.update.bind(this.nextTask));
        $(this.nextTask).on('submit-annotations', this.loadNextTask.bind(this));
    },

    addEvents: function() {
        this.addWaveSurferEvents();
        this.addNextTaskEvents();
    },

    update: function() {
        var data = this.experimentData.shift();
        this.stages.reset(
            data['proximity_tags'], 
            data['annotation_tags']
        );        

        this.wavesurfer.params.visualization = data['visualization_type'];
        this.wavesurfer.load(data['url']);
    },

    loadNextTask: function() {
        var my = this;
        if (this.experimentData.length === 0) {
            // Load more data
            $.getJSON('static/json/experiment_data.json')
                .done(function(data) {
                    my.experimentData = data.tasks;
                    my.update();
                })
                .fail(function() {
                    alert( "error" );
                });
        } else {
            // Remove the old task and update the new one
            this.update();
        }
    }

};

function main() {
    var urbanEars = new UrbanEars();
    urbanEars.loadNextTask();
}
main();
