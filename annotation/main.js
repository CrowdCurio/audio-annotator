function getTimerText(wavesurfer) {
	return '00:' + wavesurfer.getCurrentTime().toFixed(3) +
	       ' / 00:' + wavesurfer.getDuration().toFixed(3);
}

function createPlayBar(wavesurfer) {
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
        text: getTimerText(wavesurfer),
        class: 'timer',
    });

    // Add event handlers for events which modify the timer text
    var updateTimer = function () {
        timer.text(getTimerText(wavesurfer));
    };
    wavesurfer.on('audioprocess', updateTimer);
    wavesurfer.on('seek', updateTimer);
    wavesurfer.on('finish', function () {
    	wavesurfer.seekTo(wavesurfer.getCurrentTime() / wavesurfer.getDuration());
    });

    // Create and append the play button and audio timer test to the play_bar div
    var playBar = $('<div>', {
        class: 'play_bar',
    });
    return playBar.append([playButton, timer]);  
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
        wavesurfer.enableDragSelection();
        var playBar = createPlayBar(wavesurfer);
        $('.annotation').append(playBar);
    });
    
    wavesurfer.load(experimentData["url"]);
}

main();
