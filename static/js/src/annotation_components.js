'use strict';

function Util() {};

Util.secondsToString = function(seconds) {
    if (seconds === null) {
        return '';
    }
    var timeStr = '00:';
    if (seconds >= 10) {
        timeStr += seconds.toFixed(3);
    } else {
        timeStr += '0' + seconds.toFixed(3);
    }
    return timeStr;
};

Util.createSegmentTime = function() {
    var timeDiv = $('<div>', {class: 'time_segment'});
    
    var start = $('<span>', {text: 'Start:'});
    var startInput = $('<input>', {
        type: 'text',
        class: 'form-control start',
        readonly: true
    });
    var end = $('<span>', {text: 'End:'});
    var endInput = $('<input>', {
        type: 'text',
        class: 'form-control end',
        readonly: true
    });

    return timeDiv.append([start, startInput, end, endInput]);
};

function StageOneView() {
    this.dom = null;
    this.clickStartAnnotation = null;
}

StageOneView.prototype = {
    create: function() {
        var container = $('<div>', {class: 'stage'});
        var button = $('<button>', {
            class: 'btn btn_start',
            text: 'CLICK TO START A NEW ANNOTATION',
        });
        button.click(this.clickStartAnnotation);

        var time = Util.createSegmentTime();

        this.dom = container.append([button, time]);
    },

    update: function(start) {
        $('.start', this.dom).val(Util.secondsToString(start));
        $('.end', this.dom).val(Util.secondsToString(null));
    },
};

function StageTwoView() {
    this.dom = null;
    this.clickStopAnnotation = null;
}

StageTwoView.prototype = {
    create: function() {
        var container = $('<div>', {class: 'stage'});
        var button = $('<button>', {
            class: 'btn btn_stop',
            text: 'CLICK TO END ANNOTATION',
        });
        button.click(this.clickStopAnnotation);

        var time = Util.createSegmentTime();
        
        this.dom = container.append([button, time]);
    },

    update: function(region) {
        $('.start', this.dom).val(Util.secondsToString(region.start));
        $('.end', this.dom).val(Util.secondsToString(region.end));
    },
};

function StageThreeView() {
    this.dom = null;
    this.saveOptionsDom = null;
    this.editOptionsDom = null;
    this.clickReplay = null;
    this.clickSave = null;
    this.clickCancel = null;
    this.clickReset = null;
    this.clickDelete = null;
    this.clickProximityTag = null;
    this.clickAnnotationTag = null;
    this.inputCustomTag = null;
}

StageThreeView.prototype = {
    create: function(proximityTags, annotationTags) {
        var container = $('<div>', {class: 'stage'});
        var button = $('<button>', {
            class: 'btn btn_replay',
            html: '<i class="fa fa-refresh"></i>REPLAY SEGMENT',
        });
        button.click(this.clickReplay);

        var time = Util.createSegmentTime();

        var proximity = this.createProximityTags(proximityTags);
        var annotation = this.createAnnotationTags(annotationTags);
        var custom = this.createCustomTag();

        var tagContainer = $('<div>', {
            class: 'tag_container',
        });

        tagContainer.append([proximity, annotation, custom]);
        
        this.dom = container.append([button, time, tagContainer]);
        this.saveOptionsDom = this.createSaveOptions();
        this.editOptionsDom = this.createEditOptions();
    },

    createSaveOptions: function() {
        var options = $('<div>', {class: 'option_container'});
        var save = $('<button>', {
            class: 'btn btn-sm save',
            text: 'SAVE ANNOTATION',
        });
        save.click(this.clickSave);

        var cancel = $('<button>', {
            class: 'btn btn-sm cancel',
            html: 'CANCEL<i class="fa fa-remove"></i>',
        });
        cancel.click(this.clickCancel);

        return options.append([save, cancel])
    },

    createEditOptions: function() {
        var options = $('<div>', {class: 'option_container'});
        var save = $('<button>', {
            class: 'btn btn-sm save',
            text: 'SAVE CHANGES',
        });
        save.click(this.clickSave);

        var reset = $('<button>', {
            class: 'btn btn-sm reset',
            html: 'RESET CHANGES<i class="fa fa-reply"></i>',
        });
        reset.click(this.clickReset);

        var remove = $('<button>', {
            class: 'btn btn-sm btn-danger remove',
            html: 'DELETE<i class="fa fa-trash"></i>',
        });
        remove.click(this.clickDelete);


        return options.append([save, reset, remove]);
    },

    createProximityTags: function(proximityTags) {
        var my = this;

        var proximity = $('<div>');
        var proximityLabel = $('<div>', {
            class: 'stage_3_label',
            text: 'Proximity:',
        });

        var proximityContainer = $('<div>', {
            class: 'proximity_tags'
        });

        proximityTags.forEach(function (tagName, index) {
            var tag = $('<button>', {
                class: 'proximity_tag btn',
                text: tagName,
            });
            tag.click(my.clickProximityTag);
            proximityContainer.append(tag);
        });

        return proximity.append([proximityLabel, proximityContainer]);
    },

    createAnnotationTags: function(annotationTags) {
        var my = this;

        var annotation = $('<div>');
        var annotationLabel = $('<div>', {
            class: 'stage_3_label',
            text: 'Choose a tag:',
        });

        var annotationContainer = $('<div>', {
            class: 'annotation_tags'
        });

        annotationTags.forEach(function (tagName) {
            var tag = $('<button>', {
                class: 'annotation_tag btn',
                text: tagName,
            });
            tag.click(my.clickAnnotationTag);
            annotationContainer.append(tag);
        });

        return annotation.append([annotationLabel, annotationContainer]);
    },

    createCustomTag: function() {
        var my = this;

        var custom = $('<div>');
        var customLabel = $('<div>', {
            class: 'stage_3_label',
            text: 'OR use a custom tag:',
        });

        var input = $('<input>', {
            type: 'text',
            class: 'form-control',
            placeholder: 'Enter custom tag'
        });
        input.on('change', this.inputCustomTag);

        var customTag = $('<div>', {
            class: 'custom_tag'
        });
        customTag.append(input);

        return custom.append([customLabel, customTag]);
    },

    update: function(region, isSaved) {
        this.updateTime(region);
        this.updateTags(region);

        $('.option_container', this.dom).detach();
        var options = isSaved ? this.editOptionsDom : this.saveOptionsDom;
        $('.tag_container', this.dom).append(options);
    },

    updateTime: function(region) {
        $('.start', this.dom).val(Util.secondsToString(region.start));
        $('.end', this.dom).val(Util.secondsToString(region.end));
    },

    updateTags: function(region) {
        $('.annotation_tag', this.dom).removeClass('selected');
        $('.proximity_tag', this.dom).removeClass('selected');
        $('.custom_tag input', this.dom).val('');

        if (region.annotation) {
            var selectedTags = $('.annotation_tag', this.dom).filter(function() {
                return this.innerHTML === region.annotation;
            });
            if (selectedTags.length > 0) {
                selectedTags.addClass('selected');       
            } else {
                $('.custom_tag input', this.dom).val(region.annotation); 
            }
        }

        if (region.proximity) {
            var selectedTags = $('.proximity_tag', this.dom).filter(function() {
                return this.innerHTML === region.proximity;
            });
            selectedTags.addClass('selected');
        }
    },
};


function AnnotationStages(wavesurfer, proximityTags, annotationTags, colors) {
    this.currentStage = 0;
    this.currentRegion = null;
    this.stageOneView = new StageOneView();
    this.stageTwoView = new StageTwoView();
    this.stageThreeView = new StageThreeView();
    this.wavesurfer = wavesurfer;
    this.proximityTags = proximityTags;
    this.annotationTags = annotationTags;
    this.savedAnnotations = new SavedAnnotations();
    this.colors = {};
    this.colors[proximityTags[0]] = 'rgba(236,0,251,0.2)';
    this.colors[proximityTags[1]] = 'rgba(39,117,243,0.2)';
    this.colors[proximityTags[2]] = 'rgba(33,177,4,0.2)';
}

AnnotationStages.prototype = {
    createStages: function() {
        // Add events
        this.addStageOneEvents();
        this.addStageTwoEvents();
        this.addStageThreeEvents();
        this.addWaveSurferEvents();

        // Create dom
        this.stageOneView.create();
        this.stageTwoView.create();
        this.stageThreeView.create(this.proximityTags, this.annotationTags);

    },

    updateStage: function(newStage, region) {
        this.currentRegion = region;

        if (this.currentStage !== newStage) {
            var newContent = null;

            if (newStage === 1) {
                this.stageOneView.update(this.wavesurfer.getCurrentTime());
                newContent = this.stageOneView.dom;
                this.wavesurfer.enableDragSelection();
            } else if (newStage === 2) {
                this.stageTwoView.update(region);
                newContent = this.stageTwoView.dom;
                this.wavesurfer.disableDragSelection();
            } else if (newStage === 3) {
                var isSaved = this.savedAnnotations.isSaved(region)
                this.stageThreeView.update(region, isSaved);
                newContent = this.stageThreeView.dom;
                this.wavesurfer.disableDragSelection();
            }

            if (newContent) {
                // update current stage
                this.currentStage = newStage;

                // update dom of page
                var container = $('.creation_stage_container');
                container.fadeOut(10, function(){
                    $('.stage').detach();
                    container.append(newContent).fadeIn();
                });
            }
        }
    },

    updateRegion: function() {
        var current = this.wavesurfer.getCurrentTime();
        if (this.currentStage === 2 && current > this.currentRegion.end) {
            this.currentRegion.update({
                end: current
            });
            this.stageTwoView.update(this.currentRegion);
        }
    },

    createRegionSwitchToStageThree: function(region) {
        if (this.currentStage === 1 && !this.savedAnnotations.isSaved(region)) {
            this.updateStage(3, region);
        }
    },

    switchToStageThree: function(region) {
        if (this.currentStage === 1) {
            region.update({drag:true, resize:true});
            this.updateStage(3, region);
        }
    },

    updateStartEndStageThree: function() {
        if (this.currentStage === 3) {
            this.stageThreeView.updateTime(this.currentRegion);
        }
    },

    updateStartInput: function() {
        if (this.currentStage === 1) {
            this.stageOneView.update(this.wavesurfer.getCurrentTime());
        }
    },

    startAnnotation: function () {
        var region = this.wavesurfer.addRegion({
            start: this.wavesurfer.getCurrentTime(),
            end: this.wavesurfer.getCurrentTime(),
        });
        region.update({            
            drag: false,
            resize: false
        });
        this.updateStage(2, region);
    },

    stopAnnotation: function () {
        if (this.wavesurfer.isPlaying()) {
            this.wavesurfer.pause();
        }
        this.currentRegion.update({
            drag: true,
            resize: true,
        });
        this.updateStage(3, this.currentRegion);
    },

    playCurrentRegion: function() {
        this.currentRegion.play();
    },

    saveAnnotation: function() {
        if (this.currentRegion.annotation && this.currentRegion.proximity) {
            this.currentRegion.update({
                drag: false,
                resize: false,
            });
            this.savedAnnotations.save(this.currentRegion);
            this.updateStage(1);
        } else {
            alert("Please select a proximity and an annotation tag");
        }
    },

    cancelAnnotation: function() {
        this.savedAnnotations.delete(this.currentRegion);
        this.currentRegion.remove();
        this.updateStage(1);
    },

    restoreAnnotation: function () {
        this.savedAnnotations.restore(this.currentRegion);
    },

    deleteAnnotation: function () {
        this.savedAnnotations.delete(this.currentRegion);
        this.currentRegion.remove();
        this.updateStage(1);
    },

    updateAnnotationProximity: function(e) {
        var tag = e.target.textContent;
        this.currentRegion.proximity = tag;
        this.currentRegion.update({color: this.colors[tag]});
    },

    updateAnnotationLabel: function(e) {
        var tag = e.target.textContent;
        this.currentRegion.update({annotation: tag});
    },

    updateAnnotationCustomLabel: function(e) {
        var tag = e.target.value;
        this.currentRegion.update({annotation: tag});
    },

    addWaveSurferEvents: function() {
        this.wavesurfer.on('audioprocess', this.updateRegion.bind(this));
        this.wavesurfer.on('audioprocess', this.updateStartInput.bind(this));
        this.wavesurfer.on('seek', this.updateStartInput.bind(this));
        this.wavesurfer.on('pause', this.updateRegion.bind(this)); 
        this.wavesurfer.on('region-dblclick', this.switchToStageThree.bind(this));
        this.wavesurfer.on('region-update-end', this.createRegionSwitchToStageThree.bind(this));
        this.wavesurfer.on('region-update-end', this.updateStartEndStageThree.bind(this));
        this.wavesurfer.on('region-updated', this.updateStartEndStageThree.bind(this));
        this.wavesurfer.on('region-updated', this.stageThreeView.updateTags.bind(this));
    },

    addStageOneEvents: function() {
        this.stageOneView.clickStartAnnotation = this.startAnnotation.bind(this);
    },

    addStageTwoEvents: function() {
        this.stageTwoView.clickStopAnnotation = this.stopAnnotation.bind(this);
    },

    addStageThreeEvents: function() {
        this.stageThreeView.clickReplay = this.playCurrentRegion.bind(this);
        this.stageThreeView.clickSave = this.saveAnnotation.bind(this);
        this.stageThreeView.clickCancel = this.cancelAnnotation.bind(this);
        this.stageThreeView.clickReset = this.restoreAnnotation.bind(this);
        this.stageThreeView.clickDelete = this.deleteAnnotation.bind(this);
        this.stageThreeView.clickProximityTag = this.updateAnnotationProximity.bind(this);
        this.stageThreeView.clickAnnotationTag = this.updateAnnotationLabel.bind(this);
        this.stageThreeView.inputCustomTag = this.updateAnnotationCustomLabel.bind(this);
    },   
};

function PlayBar(wavesurfer) {
    this.wavesurfer = wavesurfer;
    this.playBarDom = null;
}

PlayBar.prototype = {
    getTimerText: function() {
        return Util.secondsToString(this.wavesurfer.getCurrentTime()) +
               ' / ' + Util.secondsToString(this.wavesurfer.getDuration());
    },

    createPlayBar: function() {
        var my = this;
        this.addWaveSurferEvents();

        // Create the play button
        var playButton = $('<i>', {
            class: 'play_audio fa fa-play-circle',
        });
        playButton.click(function () {
            my.wavesurfer.playPause();
        });
        
        // Create audio timer text
        var timer = $('<span>', {
            class: 'timer',
        });    

        this.playBarDom = [playButton, timer];
    },

    update: function() {
        $('.play_bar').empty().append(this.playBarDom)
        this.updateTimer();
    },

    updateTimer: function() {
        $('.timer').text(this.getTimerText());
    },

    addWaveSurferEvents: function() {
        var my = this;

        this.wavesurfer.on('play', function () {
            $('.play_audio').removeClass('fa-play-circle').addClass('fa-stop-circle');
        });
        
        this.wavesurfer.on('pause', function () {
            $('.play_audio').removeClass('fa-stop-circle').addClass('fa-play-circle');
        }); 

        this.wavesurfer.on('seek', function () {
            my.updateTimer();
        });

        this.wavesurfer.on('audioprocess', function () {
            my.updateTimer();
        });
    },
};

function SavedAnnotations() {
    this.annotations = {};
}

SavedAnnotations.prototype = {
    save: function(region) {
        this.annotations[region.id] = {
            start: region.start,
            end: region.end,
            annotation: region.annotation,
            proximity: region.proximity,
            color: region.color
        };
    },

    restore: function(region) {
        if (this.isSaved(region)) {
            region.update(this.annotations[region.id]);
        }
    },

    delete: function(region) {
        delete this.annotations[region.id];
    },

    isSaved: function(region) {
        return region.id in this.annotations;
    }
};