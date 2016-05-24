'use strict';

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
        	class: 'form-control',
        	value: Util.secondsToString(region.start),
        });
        var end = $('<span>', {text: 'End:'});
        var endInput = $('<input>', {
        	type: 'text',
        	class: 'form-control',
        	value: Util.secondsToString(region.end),
        });

        return timeDiv.append([start, startInput, end, endInput]);
	},

    createStageOne: function (wavesurfer) {
    	var my = this;
        my.currentStage = 1;

    	wavesurfer.enableDragSelection();
    	wavesurfer.on('region-update-end', function(region) {
    	    my.changeStages(wavesurfer, 'drag', region);
        })
        
        var button = $('<button>', {
        	class: 'btn btn_start',
        	text: 'CLICK TO START A NEW ANNOTATION',
        });
        button.click(function () {
        	my.changeStages(wavesurfer, 'click');
        })

        
        return button;
    },

    createStageTwo: function (wavesurfer) {
    	var my = this;
    	my.currentStage = 2;

    	var button = $('<button>', {
        	class: 'btn btn_stop',
        	text: 'CLICK TO END ANNOTATION',
        });
        button.click(function () {
        	my.changeStages(wavesurfer, 'click');
        })
        
        return button;
    },

    createStageThree: function (wavesurfer, region) {
    	var my = this;
    	my.currentStage = 3;

        wavesurfer.disableDragSelection();

        var container = $('<div>');
    	var button = $('<button>', {
        	class: 'btn btn_replay',
        	html: '<i class="fa fa-refresh"></i>REPLAY SEGMENT',
        });

        var time = my.createSegmentTime(region);
        
        return container.append([button, time]);
    },

    changeStages: function (wavesurfer, transitionAction, region) {
    	var my = this;
 
        var newContent = null;
        if (my.currentStage === 0) {
        	newContent = my.createStageOne(wavesurfer);
        } else if (my.currentStage === 1 && transitionAction === 'click') {
        	newContent = my.createStageTwo(wavesurfer);
        } else if (my.currentStage === 1 && transitionAction === 'drag') {
        	newContent = my.createStageThree(wavesurfer, region);
        } else if (my.currentStage === 2 && transitionAction === 'click') {
        	newContent = my.createStageThree(wavesurfer);
        }

        if (newContent) {
            var container = $('.creation_stage_container');
        	container.fadeOut(10, function(){
                container.empty().append(newContent).fadeIn();
            });
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
        })
        
        // Add event handlers for events which change the play button
        wavesurfer.on('play', function () {
            playButton.removeClass('fa-play-circle').addClass('fa-stop-circle');
        });
        wavesurfer.on('pause', function () {
            playButton.removeClass('fa-stop-circle').addClass('fa-play-circle');
        });    

        // Create audio timer text
        var timer = $('<span>', {
            text: my.getTimerText(wavesurfer),
            class: 'timer',
        });    

        // Add event handlers for events which modify the timer text
        var updateTimer = function () {
            timer.text(my.getTimerText(wavesurfer));
        };
        wavesurfer.on('audioprocess', updateTimer);
        wavesurfer.on('seek', updateTimer);
        wavesurfer.on('finish', function () {
        	wavesurfer.seekTo(wavesurfer.getCurrentTime() / wavesurfer.getDuration());
        });    

        // Append the play button and audio timer test to the play_bar div
        $('.play_bar').append([playButton, timer]);
    }
};

var AnnotationList = {
    createAnnotationList: function (wavesurfer) {

    }
}

function main() {
    var wavesurfer = Object.create(WaveSurfer);
    var height = 128;

    wavesurfer.init({
        container: '#waveform',
        waveColor: '#FF00FF',
        visualization: experimentData["visualization_type"],
        fftSamples: height * 2,
        height: height,
    });

    wavesurfer.on('ready', function () {
        AnnotationList.createAnnotationList(wavesurfer);
        PlayBar.createPlayBar(wavesurfer);
        AnnotationStages.changeStages(wavesurfer);
    });
    
    wavesurfer.load(experimentData["url"]);
}

main();
