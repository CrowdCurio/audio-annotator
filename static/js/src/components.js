'use strict';

/*
 * Purpose:
 *   Used to create the timestamps of segment start and end times and play bar
 * Dependencies:
 *   jQuey, urban-ears.css
 */

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

        var duration = $('<span>', {text: 'Duration:'});
        var durationInput = $('<input>', {
            type: 'text',
            class: 'form-control duration',
            readonly: true
        });

        return timeDiv.append([start, startInput, end, endInput, duration, durationInput]);
    }
};

/*
 * Purpose:
 *   Used for the play button and timestamp that controls how the wavesurfer audio is played
 * Dependencies:
 *   jQuery, Font Awesome, Wavesurfer (lib/wavesurfer.min.js), Util (src/components.js), urban-ears.css
 */

function PlayBar(wavesurfer) {
    this.wavesurfer = wavesurfer;
    this.playBarDom = null;
    this.events = [];
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
            my.trackEvent('click-' + (my.wavesurfer.isPlaying() ? 'pause' : 'play'));
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
        this.events = [];
        this.updateTimer();
    },

    updateTimer: function() {
        $('.timer').text(this.getTimerText());
    },

    trackEvent: function(eventString) {
        var eventData = {
            event: eventString,
            time: new Date().getTime()
        };
        this.events.push(eventData);
    },

    getEvents: function() {
        // Return shallow copy
        return this.events.slice();
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

        $(document).on("keydown", function (event) {
            if (event.keyCode === 32) {
                event.preventDefault();
                my.trackEvent('spacebar-' + (my.wavesurfer.isPlaying() ? 'pause' : 'play'));
                my.wavesurfer.playPause();
            }
        });
    },
};

/*
 * Purpose:
 *   Used for the workflow buttons that are used to submit annotations or to exit the task
 * Dependencies:
 *   jQuery, urban-ears.css
 */

function WorkflowBtns(exitUrl) {
    this.nextBtn = null;
    this.exitBtn = null;
    this.exitUrl = exitUrl;

    this.showExitBtn = false;
}

WorkflowBtns.prototype = {
    create: function() {
        var my = this;
        this.nextBtn = $('<button>', {
            class: 'btn submit',
            text: 'SUMBIT & LOAD NEXT CLIP'
        });
        this.nextBtn.click(function () {
            $(my).trigger('submit-annotations');
        });

        this.exitBtn = $('<button>', {
            text: 'Exit Now',
            class: 'exit btn',
        });
        this.exitBtn.click(function () {
            window.location = my.exitUrl;
        });
    },

    update: function() {
        $('.submit_container').append(this.nextBtn);
        if (this.showExitBtn) {
            $('.submit_container').append(this.exitBtn);
        }
    },

    setExitBtnFlag: function(showExitBtn) {
        this.showExitBtn = showExitBtn;
    }
};
