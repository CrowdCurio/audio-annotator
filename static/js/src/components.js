'use strict';

/*
 * Purpose:
 *   Used to create the timestamps of segment start and end times and play bar
 * Dependencies:
 *   jQuey, urban-ears.css
 */

var Util = {
    // Convert seconds to timestamp string
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

    // Return input elements that will contain the start, end and duration times of a sound segment
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

        // Return the parent element with the all the time elements appended 
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
    // Dom element containing play button and progress timestamp
    this.playBarDom = null;
    // List of user actions (click-pause, click-play, spacebar-pause, spacebar-play) with
    // timestamps of when the user took the action
    this.events = [];
}

PlayBar.prototype = {

    // Return a string of the form "<current_time> / <clip_duration>" (Ex "00:03.644 / 00:10.796")
    getTimerText: function() {
        return Util.secondsToString(this.wavesurfer.getCurrentTime()) +
               ' / ' + Util.secondsToString(this.wavesurfer.getDuration());
    },

    // Create the play bar and progress timestamp html elements and append eventhandlers for updating
    // these elements for when the clip is played and paused
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

    // Append the play buttom and the progress timestamp to the .play_bar container
    update: function() {
        $(this.playBarDom).detach();
        $('.play_bar').append(this.playBarDom);
        this.events = [];
        this.updateTimer();
    },

    // Update the progress timestamp (called when audio is playing)
    updateTimer: function() {
        $('.timer').text(this.getTimerText());
    },

    // Used to track events related to playing and pausing the clip (click or spacebar)
    trackEvent: function(eventString) {
        var audioSourceTime = this.wavesurfer.getCurrentTime();

        var eventData = {
            event: eventString,
            time: new Date().getTime(),
            audioSourceTime: audioSourceTime
        };
        this.events.push(eventData);
    },

    // Return the list of events representing the actions the user did related to playing and
    // pausing the audio
    getEvents: function() {
        // Return shallow copy
        return this.events.slice();
    },

    // Add wavesurfer event handlers to update the play button and progress timestamp
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

        // Play and pause on spacebar keydown
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
    // Dom of submit and load next btn
    this.nextBtn = null;
    // Dom of exit task btn
    this.exitBtn = null;
    // The url the user will be directed to when they exit
    this.exitUrl = exitUrl;

    // Boolean that determined if the exit button is shown
    this.showExitBtn = false;
}

WorkflowBtns.prototype = {
    // Create dom elements for the next and exit btns
    create: function() {
        var my = this;
        this.nextBtn = $('<button>', {
            class: 'btn submit',
            text: 'SUBMIT & LOAD NEXT RECORDING'
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

    // Append the next and exit elements to the the parent container
    update: function() {
        $('.submit_container').append(this.nextBtn);
        if (this.showExitBtn) {
            $('.submit_container').append(this.exitBtn);
        }
    },

    // Set the value of showExitBtn
    setExitBtnFlag: function(showExitBtn) {
        this.showExitBtn = showExitBtn;
    }
};
