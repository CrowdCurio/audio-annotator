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
    });
    var end = $('<span>', {text: 'End:'});
    var endInput = $('<input>', {
        type: 'text',
        class: 'form-control end',
    });

    return timeDiv.append([start, startInput, end, endInput]);
};

Util.updateSegmentTime = function(start, end) {
    $('input.start').val(Util.secondsToString(start));
    $('input.end').val(Util.secondsToString(end));
};

function AnnotationStages(wavesurfer, proximityTags, annotationTags) {
    this.currentStage = 0;
    this.currentRegion = null;
    this.stageOneDom = null;
    this.stageTwoDom = null;
    this.stageThreeDom = null;
    this.saveOptionsDom = null;
    this.editOptionsDom = null;
    this.wavesurfer = wavesurfer;
    this.proximityTags = proximityTags;
    this.annotationTags = annotationTags;
    this.savedAnnotations = new SavedAnnotations();
    this.colors = ['rgba(236,0,251,0.2)', 'rgba(39,117,243,0.2)', 'rgba(33,177,4,0.2)'];
}

AnnotationStages.prototype.createStages = function() {
    this.createStageOne();
    this.createStageTwo();
    this.createStageThree();
    this.addWaveSurferEvents();
};

AnnotationStages.prototype.createStageOne = function() {
    var my = this;

    var container = $('<div>', {class: 'stage'});
    var button = $('<button>', {
        class: 'btn btn_start',
        text: 'CLICK TO START A NEW ANNOTATION',
    });
    button.click(function () {
        var region = my.wavesurfer.addRegion({
            start: my.wavesurfer.getCurrentTime(),
            end: my.wavesurfer.getCurrentTime(),
        });
        region.update({            
            drag: false,
            resize: false
        });
        my.updateStage(2, region);
    })

    var time = Util.createSegmentTime();

    this.stageOneDom = container.append([button, time]);
};

AnnotationStages.prototype.createStageTwo = function() {
    var my = this;

    var container = $('<div>', {class: 'stage'});
    var button = $('<button>', {
        class: 'btn btn_stop',
        text: 'CLICK TO END ANNOTATION',
    });
    button.click(function () {
        if (my.wavesurfer.isPlaying()) {
            my.wavesurfer.pause();
        }
        my.currentRegion.update({
            drag: true,
            resize: true,
        });
        my.updateStage(3, my.currentRegion);
    })

    var time = Util.createSegmentTime();
    
    this.stageTwoDom = container.append([button, time]);
};

AnnotationStages.prototype.createProximityTags = function() {
    var my = this;

    var proximity = $('<div>');
    var proximityLabel = $('<div>', {
        class: 'stage_3_label',
        text: 'Proximity:',
    });

    var proximityContainer = $('<div>', {
        class: 'proximity_tags'
    });

    this.proximityTags.forEach(function (tagName, index) {
        var tag = $('<button>', {
            class: 'proximity_tag btn',
            text: tagName,
        });
        tag.click(function() {
            my.currentRegion.proximity = tagName;
            my.currentRegion.update({color: my.colors[index]})
            $('.proximity_tag').removeClass('selected');
            tag.addClass('selected');
        });
        proximityContainer.append(tag);
    });

    return proximity.append([proximityLabel, proximityContainer]);
};

AnnotationStages.prototype.createAnnotationTags = function() {
    var my = this;

    var annotation = $('<div>');
    var annotationLabel = $('<div>', {
        class: 'stage_3_label',
        text: 'Choose a tag:',
    });

    var annotationContainer = $('<div>', {
        class: 'annotation_tags'
    });

    this.annotationTags.forEach(function (tagName) {
        var tag = $('<button>', {
            class: 'annotation_tag btn',
            text: tagName,
        });
        tag.click(function() {
            my.currentRegion.update({annotation: tagName});
            $('.custom_tag input').val('');
            $('.annotation_tag').removeClass('selected');
            tag.addClass('selected');
        });
        annotationContainer.append(tag);
    });

    return annotation.append([annotationLabel, annotationContainer]);
};

AnnotationStages.prototype.createCustomTag = function() {
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
    input.on('change', function() {
        my.currentRegion.update({annotation: input.val()});
        $('.annotation_tag').removeClass('selected');
    });

    var customTag = $('<div>', {
        class: 'custom_tag'
    });
    customTag.append(input);

    return custom.append([customLabel, customTag]);
};

AnnotationStages.prototype.createSaveOptions = function() {
    var my = this;

    var options = $('<div>', {class: 'option_container'});
    var save = $('<button>', {
        class: 'btn btn-sm save',
        text: 'SAVE ANNOTATION',
    });
    save.click(function () {
        if (my.currentRegion.annotation && my.currentRegion.proximity) {
            my.currentRegion.update({
                drag: false,
                resize: false,
            });
            my.savedAnnotations.save(my.currentRegion);
            my.updateStage(1);
        } else {
            alert("Please select a proximity and an annotation tag");
        }
    });

    var cancel = $('<button>', {
        class: 'btn btn-sm cancel',
        html: 'CANCEL<i class="fa fa-remove"></i>',
    });
    cancel.click(function () {
        my.savedAnnotations.delete(my.currentRegion);
        my.currentRegion.remove();
        my.updateStage(1);
    });

    return options.append([save, cancel])
};

AnnotationStages.prototype.createEditOptions = function() {
    var my = this;

    var options = $('<div>', {class: 'option_container'});
    var save = $('<button>', {
        class: 'btn btn-sm save',
        text: 'SAVE CHANGES',
    });
    save.click(function () {
        if (my.currentRegion.annotation && my.currentRegion.proximity) {
            my.currentRegion.update({
                drag: false,
                resize: false,
            });
            my.savedAnnotations.save(my.currentRegion);
            my.updateStage(1);
        } else {
            alert("Please select a proximity and an annotation tag");
        }
    });

    var reset = $('<button>', {
        class: 'btn btn-sm reset',
        html: 'RESET CHANGES<i class="fa fa-reply"></i>',
    });
    reset.click(function () {
        my.savedAnnotations.restore(my.currentRegion);
    });

    var remove = $('<button>', {
        class: 'btn btn-sm btn-danger remove',
        html: 'DELETE<i class="fa fa-trash"></i>',
    });
    remove.click(function () {
        my.savedAnnotations.delete(my.currentRegion);
        my.currentRegion.remove();
        my.updateStage(1);
    });


    return options.append([save, reset, remove]);
};

AnnotationStages.prototype.createStageThree = function() {
    var my = this;

    var container = $('<div>', {class: 'stage'});
    var button = $('<button>', {
        class: 'btn btn_replay',
        html: '<i class="fa fa-refresh"></i>REPLAY SEGMENT',
    });
    button.click(function () {
        my.currentRegion.play();
    });

    var time = Util.createSegmentTime();

    var proximity = this.createProximityTags();
    var annotation = this.createAnnotationTags();
    var custom = this.createCustomTag();

    var tagContainer = $('<div>', {
        class: 'tag_container',
    });

    tagContainer.append([proximity, annotation, custom])
    
    this.stageThreeDom = container.append([button, time, tagContainer]);
    this.saveOptionsDom = this.createSaveOptions();
    this.editOptionsDom = this.createEditOptions();
};

AnnotationStages.prototype.updatedStageOneDom = function() {
    var dom = this.stageOneDom;
    $('.start', dom).val(Util.secondsToString(this.wavesurfer.getCurrentTime()));
    $('.end', dom).val(Util.secondsToString(null));
    $('.start', dom).attr('readonly', true);
    $('.end', dom).attr('readonly', true);
    return dom;
}

AnnotationStages.prototype.updatedStageTwoDom = function(region) {
    var dom = this.stageTwoDom;
    $('.start', dom).val(Util.secondsToString(region.start));
    $('.end', dom).val(Util.secondsToString(region.end));
    $('.start', dom).attr('readonly', true);
    $('.end', dom).attr('readonly', true);
    return dom;
}

AnnotationStages.prototype.updateTags = function(region, dom) {
    if (!dom) {
        dom = document;
    }
    $('.annotation_tag', dom).removeClass('selected');
    $('.proximity_tag', dom).removeClass('selected');
    $('.custom_tag input', dom).val('');

    if (region.annotation) {
        var selectedTags = $('.annotation_tag', dom).filter(function() {
            return this.innerHTML === region.annotation;
        });
        if (selectedTags.length > 0) {
            selectedTags.addClass('selected');       
        } else {
            $('.custom_tag input', dom).val(region.annotation); 
        }
    }

    if (region.proximity) {
        var selectedTags = $('.proximity_tag', dom).filter(function() {
            return this.innerHTML === region.proximity;
        });
        selectedTags.addClass('selected');
    }
}

AnnotationStages.prototype.updatedStageThreeDom = function(region) {
    var dom = this.stageThreeDom;

    this.updateTags(region, dom);

    $('.option_container', dom).detach();
    var options = this.savedAnnotations.isSaved(region) ? this.editOptionsDom : this.saveOptionsDom;
    $('.tag_container', dom).append(options);

    $('.start', dom).val(Util.secondsToString(region.start));
    $('.end', dom).val(Util.secondsToString(region.end));
    // Make them read only for now
    $('.start', dom).attr('readonly', true);
    $('.end', dom).attr('readonly', true);

    return dom;
}



AnnotationStages.prototype.updateStage = function(newStage, region) {
    this.currentRegion = region;

    if (this.currentStage !== newStage) {
        var newContent = null;

        if (newStage === 1) {
            newContent = this.updatedStageOneDom();
            this.wavesurfer.enableDragSelection();
        } else if (newStage === 2) {
            newContent = this.updatedStageTwoDom(region);
            this.wavesurfer.disableDragSelection();
        } else if (newStage === 3) {
            newContent = this.updatedStageThreeDom(region);
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
};

AnnotationStages.prototype.updateRegion = function() {
    var current = this.wavesurfer.getCurrentTime();
    if (this.currentStage === 2 && current > this.currentRegion.end) {
        this.currentRegion.update({
            end: this.wavesurfer.getCurrentTime(),
        });
        Util.updateSegmentTime(this.currentRegion.start, this.currentRegion.end);
    }
};

AnnotationStages.prototype.createRegionSwitchToStageThree = function(region) {
    if (this.currentStage === 1 && !this.savedAnnotations.isSaved(region)) {
        this.updateStage(3, region);
    }
};

AnnotationStages.prototype.switchToStageThree = function(region) {
    if (this.currentStage === 1) {
        region.update({drag:true, resize:true});
        this.updateStage(3, region);
    }
};

AnnotationStages.prototype.updateStartEndStageThree = function() {
    if (this.currentStage === 3) {
        Util.updateSegmentTime(this.currentRegion.start, this.currentRegion.end);
    }
};

AnnotationStages.prototype.updateStartInput = function() {
    if (this.currentStage === 1) {
        Util.updateSegmentTime(this.wavesurfer.getCurrentTime(), null);
    }
}

AnnotationStages.prototype.addWaveSurferEvents = function() {
    this.wavesurfer.on('audioprocess', this.updateRegion.bind(this));
    this.wavesurfer.on('audioprocess', this.updateStartInput.bind(this));
    this.wavesurfer.on('seek', this.updateStartInput.bind(this));
    this.wavesurfer.on('pause', this.updateRegion.bind(this)); 
    this.wavesurfer.on('region-dblclick', this.switchToStageThree.bind(this));
    this.wavesurfer.on('region-update-end', this.createRegionSwitchToStageThree.bind(this));
    this.wavesurfer.on('region-update-end', this.updateStartEndStageThree.bind(this));
    this.wavesurfer.on('region-updated', this.updateStartEndStageThree.bind(this));
    this.wavesurfer.on('region-updated', this.updateTags.bind(this));
};

function PlayBar(wavesurfer) {
    this.wavesurfer = wavesurfer;
    this.playBarDom = null;
}

PlayBar.prototype.getTimerText = function() {
    return Util.secondsToString(this.wavesurfer.getCurrentTime()) +
           ' / ' + Util.secondsToString(this.wavesurfer.getDuration());
};

PlayBar.prototype.createPlayBar = function() {
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
};

PlayBar.prototype.update = function() {
    $('.play_bar').empty().append(this.playBarDom)
    this.updateTimer();
}

PlayBar.prototype.updateTimer = function() {
    $('.timer').text(this.getTimerText());
}

PlayBar.prototype.addWaveSurferEvents = function() {
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
}

function SavedAnnotations() {
    this.annotations = {};
}

SavedAnnotations.prototype.save = function(region) {
    this.annotations[region.id] = {
        start: region.start,
        end: region.end,
        annotation: region.annotation,
        proximity: region.proximity,
        color: region.color
    };
}

SavedAnnotations.prototype.restore = function(region) {
    if (this.isSaved(region)) {
        region.update(this.annotations[region.id]);
    }
}

SavedAnnotations.prototype.delete = function(region) {
    delete this.annotations[region.id];
}

SavedAnnotations.prototype.isSaved = function(region) {
    return region.id in this.annotations;
}