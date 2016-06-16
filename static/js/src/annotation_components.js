'use strict';

var Util = {
    secondsToString: function(seconds) {
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
    },

    createSegmentTime: function() {
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
    }
};

function StageOneView() {
    this.dom = null;
}

StageOneView.prototype = {
    create: function() {
        var my = this;
        var container = $('<div>', {class: 'stage'});
        var button = $('<button>', {
            class: 'btn btn_start',
            text: 'CLICK TO START A NEW ANNOTATION',
        });
        button.click(function () {
            $(my).trigger('start-annotation');
        });

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
}

StageTwoView.prototype = {
    create: function() {
        var my = this;
        var container = $('<div>', {class: 'stage'});
        var button = $('<button>', {
            class: 'btn btn_stop',
            text: 'CLICK TO END ANNOTATION',
        });
        button.click(function () {
            $(my).trigger('stop-annotation');
        });

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
    this.colors = ['rgba(236,0,251,0.2)', 'rgba(39,117,243,0.2)', 'rgba(33,177,4,0.2)'];
}

StageThreeView.prototype = {
    create: function() {
        var my = this;
        var container = $('<div>', {class: 'stage'});
        var button = $('<button>', {
            class: 'btn btn_replay',
            html: '<i class="fa fa-refresh"></i>REPLAY SEGMENT',
        });
        button.click(function() {
            $(my).trigger('replay');
        });

        var time = Util.createSegmentTime();

        var tagContainer = $('<div>', {
            class: 'tag_container',
        });
        
        this.dom = container.append([button, time, tagContainer]);
        this.saveOptionsDom = this.createSaveOptions();
        this.editOptionsDom = this.createEditOptions();
    },

    updateTagContents: function(proximityTags, annotationTags) {
        $('.tag_container', this.dom).empty();
        var proximity = this.createProximityTags(proximityTags);
        var annotation = this.createAnnotationTags(annotationTags);
        var custom = this.createCustomTag();
        $('.tag_container', this.dom).append([proximity, annotation, custom]);
    },

    createSaveOptions: function() {
        var my = this;
        var options = $('<div>', {class: 'option_container'});
        var save = $('<button>', {
            class: 'btn btn-sm save',
            text: 'SAVE ANNOTATION',
        });
        save.click(function() {
            $(my).trigger('save');
        });

        var cancel = $('<button>', {
            class: 'btn btn-sm cancel',
            html: 'CANCEL<i class="fa fa-remove"></i>',
        });
        cancel.click(function() {
            $(my).trigger('cancel-create');
        });

        return options.append([save, cancel])
    },

    createEditOptions: function() {
        var my = this;
        var options = $('<div>', {class: 'option_container'});
        var save = $('<button>', {
            class: 'btn btn-sm save',
            text: 'SAVE CHANGES',
        });
        save.click(function() {
            $(my).trigger('save');
        });

        var reset = $('<button>', {
            class: 'btn btn-sm reset',
            html: 'RESET CHANGES<i class="fa fa-reply"></i>',
        });
        reset.click(function() {
            $(my).trigger('reset');
        });

        var remove = $('<button>', {
            class: 'btn btn-sm btn-danger remove',
            html: 'DELETE<i class="fa fa-trash"></i>',
        });
        remove.click(function() {
            $(my).trigger('delete');
        });


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
            tag.click(function() {
                $(my).trigger(
                    'change-tag', 
                    [{proximity: tagName, color: my.colors[index]}]
                );
            });
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
            tag.click(function() {
                $(my).trigger('change-tag', [{annotation: tagName}]);
            });
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
        input.on('change', function(e) {
            $(my).trigger('change-tag', [{annotation: e.target.value}]);
        });

        var customTag = $('<div>', {
            class: 'custom_tag'
        });
        customTag.append(input);

        return custom.append([customLabel, customTag]);
    },

    update: function(region, isSaved) {
        this.updateTime(region);
        this.updateSelectedTags(region);

        $('.option_container', this.dom).detach();
        var options = isSaved ? this.editOptionsDom : this.saveOptionsDom;
        $(this.dom).append(options);
    },

    updateTime: function(region) {
        $('.start', this.dom).val(Util.secondsToString(region.start));
        $('.end', this.dom).val(Util.secondsToString(region.end));
    },

    updateSelectedTags: function(region) {
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

    updateTagContents: function(proximityTags, annotationTags) {
        $('.tag_container', this.dom).empty();
        var proximity = this.createProximityTags(proximityTags);
        var annotation = this.createAnnotationTags(annotationTags);
        var custom = this.createCustomTag();
        $('.tag_container', this.dom).append([proximity, annotation, custom]);
    },
};


function AnnotationStages(wavesurfer) {
    this.currentStage = 0;
    this.currentRegion = null;
    this.stageOneView = new StageOneView();
    this.stageTwoView = new StageTwoView();
    this.stageThreeView = new StageThreeView();
    this.wavesurfer = wavesurfer;
    this.savedAnnotations = new SavedAnnotations();
}

AnnotationStages.prototype = {
    create: function() {
        // Add events
        this.addStageOneEvents();
        this.addStageTwoEvents();
        this.addStageThreeEvents();
        this.addWaveSurferEvents();

        // Create dom
        this.stageOneView.create();
        this.stageTwoView.create();
        this.stageThreeView.create();

    },

    swapRegion: function(newStage, region) {
        if (this.currentRegion) {
            this.currentRegion.update({drag: false, resize: false});
            $(this.currentRegion.element).removeClass('current_region');
        }
        if (region) {
            if (newStage === 2) {
                region.update({drag: false, resize: false});
            } else if (newStage === 3) {
                region.update({drag: true, resize: true});
                $(region.element).addClass('current_region');
            }
        }
        this.currentRegion = region;
    },

    updateStage: function(newStage, region) {
        this.swapRegion(newStage, region);

        var newContent = null;
        if (newStage === 1) {
            this.stageOneView.update(this.wavesurfer.getCurrentTime());
            newContent = this.stageOneView.dom;
            if (this.currentStage !== 1) {
                this.wavesurfer.enableDragSelection();
            }
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

        $(this).trigger('stage-updated', [this.currentStage, this.savedAnnotations.getLength()]);
    },

    reset: function(proximityTags, annotationTags) {
        // Clear Regions
        this.savedAnnotations = new SavedAnnotations();
        this.wavesurfer.clearRegions();
        // Update all Tags' Contents
        this.updateContentsTags(proximityTags, annotationTags)
    },

    updateContentsTags: function(proximityTags, annotationTags) {
        this.stageThreeView.updateTagContents(
            proximityTags,
            annotationTags
        );
    },

    updateEndOfRegion: function() {
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
        this.updateStage(2, region);
    },

    stopAnnotation: function () {
        if (this.wavesurfer.isPlaying()) {
            this.wavesurfer.pause();
        }
        this.updateStage(3, this.currentRegion);
    },

    playCurrentRegion: function() {
        this.currentRegion.play();
    },

    saveAnnotation: function() {
        if (this.currentRegion.annotation && this.currentRegion.proximity) {
            this.savedAnnotations.save(this.currentRegion);
            this.updateStage(1);
        } else {
            alert("Please select a proximity and an annotation tag");
        }
    },

    restoreAnnotation: function () {
        this.savedAnnotations.restore(this.currentRegion);
    },

    deleteAnnotation: function () {
        this.savedAnnotations.delete(this.currentRegion);
        this.currentRegion.remove();
        this.updateStage(1);
    },

    updateRegion: function(event, data) {
        this.currentRegion.update(data);
    },

    addWaveSurferEvents: function() {
        this.wavesurfer.on('audioprocess', this.updateEndOfRegion.bind(this));
        this.wavesurfer.on('audioprocess', this.updateStartInput.bind(this));
        this.wavesurfer.on('seek', this.updateStartInput.bind(this));
        this.wavesurfer.on('pause', this.updateEndOfRegion.bind(this)); 
        this.wavesurfer.on('region-dblclick', this.switchToStageThree.bind(this));
        this.wavesurfer.on('region-update-end', this.createRegionSwitchToStageThree.bind(this));
        this.wavesurfer.on('region-update-end', this.updateStartEndStageThree.bind(this));
        this.wavesurfer.on('region-updated', this.updateStartEndStageThree.bind(this));
        this.wavesurfer.on('region-updated', this.stageThreeView.updateSelectedTags.bind(this));
    },

    addStageOneEvents: function() {
        $(this.stageOneView).on('start-annotation', this.startAnnotation.bind(this));
    },

    addStageTwoEvents: function() {
        $(this.stageTwoView).on('stop-annotation', this.stopAnnotation.bind(this));
    },

    addStageThreeEvents: function() {
        $(this.stageThreeView).on('replay', this.playCurrentRegion.bind(this));
        $(this.stageThreeView).on('save', this.saveAnnotation.bind(this));
        $(this.stageThreeView).on('cancel-create delete', this.deleteAnnotation.bind(this));
        $(this.stageThreeView).on('reset', this.restoreAnnotation.bind(this));
        $(this.stageThreeView).on('change-tag', this.updateRegion.bind(this));
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

    create: function() {
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
        $(this.playBarDom).detach();
        $('.play_bar').append(this.playBarDom);
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

    getLength: function() {
        return Object.keys(this.annotations).length
    },

    delete: function(region) {
        delete this.annotations[region.id];
    },

    isSaved: function(region) {
        return region.id in this.annotations;
    }
};

function NextTask() {
    this.dom = null;
    this.clickSubmitAnnotations = null;
}

NextTask.prototype = {
    create: function() {
        var my = this;
        var nextButton = $('<button>', {
            class: 'btn submit',
        });
        nextButton.click(function () {
            $(my).trigger('submit-annotations');
        });
        this.dom = nextButton;
    },

    update: function(event, currentStage, numSavedAnnotations) {
        $('.submit_container').append(this.dom);

        $(this.dom).prop('disabled', currentStage !== 1);
        var text = 'SUBMIT NO ANNOTATIONS';
        if (numSavedAnnotations > 0) {
            text = 'SUBMIT SAVED ANNOTATIONS';
        }
        $(this.dom).text(text);
    }
};
