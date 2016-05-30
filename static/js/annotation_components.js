'use strict';

var StageSpecificCallBacks = {

    updateRegion: function () {
        AnnotationStages.currentRegion.update({
            end: wavesurfer.getCurrentTime(),
        });
    },

    switchToStageThree: function (region) {
        AnnotationStages.updateStage(wavesurfer, 3, region);
    },

};

var Util = {
    secondsToString: function (seconds) {
        if (!seconds) {
            return '';
        }
        var timeStr = '00:';
        if (seconds > 9) {
            timeStr += seconds.toFixed(3);
        } else {
            timeStr += '0' + seconds.toFixed(3);
        }
        return timeStr;
    },

    createSegmentTime: function () {
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
    },

    updateSegmentTime: function (start, end) {
        $('input.start').value(Util.secondsToString(start));
        $('input.end').value(Util.secondsToString(end));
    },
}

var AnnotationStages = {
    currentStage: 0,
    currentRegion: null,
    stageOneDom: null,
    stageTwoDom: null,
    stageThreeDom: null,

    createStages: function (wavesurfer, proximityTags, annotationTags) {
        this.createStageOne(wavesurfer);
        this.createStageTwo(wavesurfer);
        this.createStageThree(wavesurfer, proximityTags, annotationTags);
        this.updateStage(wavesurfer, 1);
    },

    createStageOne: function (wavesurfer) {
        var my = this;
        
        var container = $('<div>', {class: 'stage'});
        var button = $('<button>', {
            class: 'btn btn_start',
            text: 'CLICK TO START A NEW ANNOTATION',
        });
        button.click(function () {
            var region = wavesurfer.addRegion({
                start: wavesurfer.getCurrentTime(),
                end: wavesurfer.getCurrentTime()
            });
            my.updateStage(wavesurfer, 2, region);
        })

        var time = Util.createSegmentTime();

        this.stageOneDom = container.append([button, time]);
    },
    
    appendEventListenersStageOne: function (wavesurfer) {
        wavesurfer.enableDragSelection();
        wavesurfer.on('region-update-end', StageSpecificCallBacks.switchToStageThree);
    },

    createStageTwo: function (wavesurfer) {
        var my = this;

        var container = $('<div>', {class: 'stage'});
        var button = $('<button>', {
            class: 'btn btn_stop',
            text: 'CLICK TO END ANNOTATION',
        });
        button.click(function () {
            if (wavesurfer.isPlaying()) {
                wavesurfer.pause();
            }
            my.updateStage(wavesurfer, 3, my.currentRegion);
        })

        var time = Util.createSegmentTime();
        
        this.stageTwoDom = container.append([button, time]);
    },

    appendEventListenersStageTwo: function (wavesurfer) {
        wavesurfer.on('audioprocess', StageSpecificCallBacks.updateRegion);
        wavesurfer.on('pause', StageSpecificCallBacks.updateRegion);
    },

    createStageThree: function (wavesurfer, proximityTags, annotationTags) {
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

        var proximity = $('<div>');
        var proximityLabel = $('<div>', {
            class: 'stage_3_label',
            text: 'Proximity:',
        });

        var proximityContainer = $('<div>', {
            class: 'proximity_tags'
        });

        proximityTags.forEach(function (tagName) {
            var tag = $('<button>', {
                class: 'proximity_tag btn',
                text: tagName,
            });
            proximityContainer.append(tag);
        })

        proximity.append([proximityLabel, proximityContainer]);

        var choose = $('<div>');
        var chooseLabel = $('<div>', {
            class: 'stage_3_label',
            text: 'Choose a tag:',
        });

        var chooseContainer = $('<div>', {
            class: 'annotation_tags'
        });

        annotationTags.forEach(function (tagName) {
            var tag = $('<button>', {
                class: 'annotation_tag btn',
                text: tagName,
            });
            chooseContainer.append(tag);
        })
        choose.append([chooseLabel, chooseContainer]);

        var custom = $('<div>');
        var customLabel = $('<div>', {
            class: 'stage_3_label',
            text: 'OR use a custom tag:',
        });
        custom.append(customLabel);

        var tagContainer = $('<div>', {
            class: 'tag_container',
        });

        tagContainer.append([proximity, choose, custom])
        
        this.stageThreeDom = container.append([button, time, tagContainer]);
    },

    appendEventListenersStageThree: function (wavesurfer) {
        wavesurfer.on('region-update-end', StageSpecificCallBacks.switchToStageThree);
    },

    updateStage: function(wavesurfer, newStage, region) {
        this.currentRegion = region;

        if (this.currentStage !== newStage) {
            var newContent = null;
            var appendEventListeners = null;

            if (newStage === 1) {
                newContent = this.stageOneDom;
                appendEventListeners = this.appendEventListenersStageOne;
            } else if (newStage === 2) {
                newContent = this.stageTwoDom;
                appendEventListeners = this.appendEventListenersStageTwo;
            } else if (newStage === 3) {
                newContent = this.stageThreeDom;
                appendEventListeners = this.appendEventListenersStageThree;
            }

            if (newContent && appendEventListeners) {
                // update current stage
                this.currentStage = newStage;

                // update dom of page
                var container = $('.creation_stage_container');
                container.fadeOut(10, function(){
                    $('.stage').detach();
                    container.append(newContent).fadeIn();
                });

                // update wavesurfer events for specific stage
                this.removeStageSpecificCallBacks(wavesurfer);
                appendEventListeners(wavesurfer);
            }
        }
    },

    removeStageSpecificCallBacks: function (wavesurfer) {
        wavesurfer.un('audioprocess', StageSpecificCallBacks.updateRegion);
        wavesurfer.un('pause', StageSpecificCallBacks.updateRegion); 
        wavesurfer.un('region-update-end', StageSpecificCallBacks.switchToStageThree);
        if (wavesurfer.regions) {
            wavesurfer.disableDragSelection();
        }  
    },
};


var PlayBar = {
    getTimerText: function (wavesurfer) {
        return Util.secondsToString(wavesurfer.getCurrentTime()) +
               ' / ' + Util.secondsToString(wavesurfer.getDuration());
    },

    createPlayBar: function (wavesurfer) {
        // Create the play button
        var playButton = $('<i>', {
            class: 'play_audio fa fa-play-circle',
        });
        playButton.click(function () {
            wavesurfer.playPause();
        });
        
        // Create audio timer text
        var timer = $('<span>', {
            text: this.getTimerText(wavesurfer),
            class: 'timer',
        });    

        // Append the play button and audio timer test to the play_bar div
        $('.play_bar').append([playButton, timer]);
    },

    updateTimer: function (wavesurfer) {
        $('.timer').text(this.getTimerText(wavesurfer));
    }
};