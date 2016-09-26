'use strict';

function UrbanEars() {
    this.wavesurfer;
    this.playBar;
    this.stages;
    this.workflowBtns;
    this.currentTask;
    this.taskStartTime;
    this.hiddenImage;
    this.sendingResponse = false;

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
        container: '.audio_visual',
        waveColor: '#FF00FF',
        progressColor: '#FF00FF',
        // For the spectrogram the height is half the number of fftSamples
        fftSamples: height * 2,
        height: height,
        colorMap: spectrogramColorMap
    });

    var labels = Object.create(WaveSurfer.Labels);
    labels.init({
        wavesurfer: this.wavesurfer,
        container: '.labels'
    });

    this.hiddenImage = new HiddenImg('.hidden_img', 100);
    this.hiddenImage.create();

    // Create the play button and time that appear below the wavesurfer
    this.playBar = new PlayBar(this.wavesurfer);
    this.playBar.create();

    // Create the annotation stages that appear below the wavesurfer
    this.stages = new AnnotationStages(this.wavesurfer, this.hiddenImage);
    this.stages.create();

    // Create Workflow btns (submit and exit)
    this.workflowBtns = new WorkflowBtns();
    this.workflowBtns.create();

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
            my.updateTaskTime();
            my.workflowBtns.update();
            if (my.currentTask.feedback === 'hiddenImage') {
                my.hiddenImage.append(my.currentTask.imgUrl);
            }
        });
    },

    updateTaskTime: function() {
        this.taskStartTime = new Date().getTime();
    },

    addWorkflowBtnEvents: function() {
        $(this.workflowBtns).on('submit-annotations', this.submitAnnotations.bind(this));
    },

    addEvents: function() {
        this.addWaveSurferEvents();
        this.addWorkflowBtnEvents();
    },

    update: function() {
        var my = this;
        var mainUpdate = function(annotationSolutions) {

            var proximityTags = my.currentTask.proximityTag;
            var annotationTags = my.currentTask.annotationTag;
            my.stages.reset(
                proximityTags,
                annotationTags,
                annotationSolutions
            );
            my.wavesurfer.params.visualization = my.currentTask.visualization;
            my.wavesurfer.params.feedback = my.currentTask.feedback;

            my.wavesurfer.load(my.currentTask.url);
        };

        if (this.currentTask.feedback !== 'none') {
            $.getJSON(this.currentTask.annotationSolutionsUrl)
            .done(function(data) {
                mainUpdate(data);
            })
            .fail(function() {
                alert('Error: Unable to retrieve annotation solution set');
            });
        } else {
            mainUpdate({});
        }
    },

    loadNextTask: function() {
        var my = this;
        $.getJSON(dataUrl)
        .done(function(data) {
            my.currentTask = data.task;
            my.update();
        });
    },

    submitAnnotations: function() {
        if (this.stages.annotationDataValidationCheck()) {
            if (this.sendingResponse) {
                return;
            }
            this.sendingResponse = true;
            var content = {
                task_start_time: this.taskStartTime,
                task_end_time: new Date().getTime(),
                visualization: this.wavesurfer.params.visualization,
                annotations: this.stages.getAnnotations(),
                deleted_annotations: this.stages.getDeletedAnnotations(),
                annotation_events: this.stages.getEvents(),
                play_events: this.playBar.getEvents(),
                final_solution_shown: this.stages.aboveThreshold()
            };
            if (this.stages.aboveThreshold()) {
                var my = this;
                this.stages.displaySolution();
                setTimeout(function() {
                    my.post(content);
                }, 2000);
            } else {
                this.post(content);
            }
        }
    },

    post: function (content) {
        var my = this;
        $.ajax({
            type: 'POST',
            url: '/some/url',
            contentType: 'application/json',
            data: content
        })
        .done(function(data) {
            if (my.currentTask.feedback === 'hiddenImage') {
                my.hiddenImage.remove();
            }
            my.loadNextTask();
        })
        .fail(function() {
            alert('Error: Unable to Submit Annotations');
        })
        .always(function() {
            my.sendingResponse = false;
        });
    }

};

function main() {
    var urbanEars = new UrbanEars();
    urbanEars.loadNextTask();
}
main();
