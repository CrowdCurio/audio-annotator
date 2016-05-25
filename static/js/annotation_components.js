'use strict';

var EventCallBacks = {
    'region': null,

    updateOnPlay: function () {
        EventCallBacks.region.update({
            end: wavesurfer.getCurrentTime(),
        });
    },
};

var Util = {
    secondsToString: function (seconds) {
        var timeStr = '00:';
        if (seconds > 9) {
            timeStr += seconds.toFixed(3);
        } else {
            timeStr += '0' + seconds.toFixed(3);
        }
        return timeStr;
    }
}

var AnnotationStages = {
	'currentStage': 0,

	createSegmentTime: function (region) {
        var timeDiv = $('<div>', {class: 'time_segment'});
        
        var start = $('<span>', {text: 'Start:'});
        var startInput = $('<input>', {
        	type: 'text',
        	class: 'form-control start',
        	value: Util.secondsToString(region.start),
        });
        var end = $('<span>', {text: 'End:'});
        var endInput = $('<input>', {
        	type: 'text',
        	class: 'form-control end',
        	value: Util.secondsToString(region.end),
        });

        return timeDiv.append([start, startInput, end, endInput]);
	},

    createStageOne: function (wavesurfer) {
    	var my = this;
        my.currentStage = 1;

    	wavesurfer.enableDragSelection();
        
        var button = $('<button>', {
        	class: 'btn btn_start',
        	text: 'CLICK TO START A NEW ANNOTATION',
        });
        button.click(function () {
            var region = wavesurfer.addRegion({
                start: wavesurfer.getCurrentTime(),
                end: wavesurfer.getCurrentTime()
            });
        	my.changeStages(wavesurfer, 2, region);
        })

        
        return button;
    },

    createStageTwo: function (wavesurfer, region) {
    	var my = this;
    	my.currentStage = 2;

        wavesurfer.disableDragSelection();
        
        EventCallBacks.region = region;
        wavesurfer.on('audioprocess', EventCallBacks.updateOnPlay);

    	var button = $('<button>', {
        	class: 'btn btn_stop',
        	text: 'CLICK TO END ANNOTATION',
        });
        button.click(function () {
        	my.changeStages(wavesurfer, 3, region);
        })
        
        return button;
    },

    createStageThree: function (wavesurfer, region) {
    	var my = this;
    	my.currentStage = 3;

        wavesurfer.disableDragSelection();
        wavesurfer.un('audioprocess', EventCallBacks.updateOnPlay);

        var container = $('<div>');
    	var button = $('<button>', {
        	class: 'btn btn_replay',
        	html: '<i class="fa fa-refresh"></i>REPLAY SEGMENT',
        });

        var time = my.createSegmentTime(region);
        
        return container.append([button, time]);
    },

    updateStageThree: function (wavesurfer, region) {
        $('input.start').val(Util.secondsToString(region.start));
        $('input.end').val(Util.secondsToString(region.end));
    },

    changeStages: function(wavesurfer, newStage, region) {
        var my = this;
        if (my.currentStage === newStage) {
            my.updateStage(wavesurfer, newStage, region);
        } else {
            my.createStage(wavesurfer, newStage, region);
        }
    },

    createStage: function (wavesurfer, newStage, region) {
    	var my = this;
 
        var newContent = null;
        if (my.currentStage === 0) {
        	newContent = my.createStageOne(wavesurfer);
        } else if (my.currentStage === 1 && newStage === 2) {
        	newContent = my.createStageTwo(wavesurfer, region);
        } else if (my.currentStage === 1 && newStage === 3) {
        	newContent = my.createStageThree(wavesurfer, region);
        } else if (my.currentStage === 2 && newStage === 3) {
        	newContent = my.createStageThree(wavesurfer, region);
        }

        if (newContent) {
            var container = $('.creation_stage_container');
        	container.fadeOut(10, function(){
                container.empty().append(newContent).fadeIn();
            });
        }
    },

    updateStage: function (wavesurfer, newStage, region) {
        var my = this;

        if (newStage === 3) {
            my.updateStageThree(wavesurfer, region);
        }
           
    },
};


var PlayBar = {
    getTimerText: function (wavesurfer) {
        return Util.secondsToString(wavesurfer.getCurrentTime()) +
               ' / ' + Util.secondsToString(wavesurfer.getDuration());
    },

    createPlayBar: function (wavesurfer) {
        var my = this;

        // Create the play button
        var playButton = $('<i>', {
            class: 'play_audio fa fa-play-circle',
        });
        playButton.click(function () {
            wavesurfer.playPause();
        });
        
        // Create audio timer text
        var timer = $('<span>', {
            text: my.getTimerText(wavesurfer),
            class: 'timer',
        });    

        // Append the play button and audio timer test to the play_bar div
        $('.play_bar').append([playButton, timer]);
    },

    updateTimer: function (wavesurfer) {
        var my = this;
        $('.timer').text(my.getTimerText(wavesurfer));
    }
};