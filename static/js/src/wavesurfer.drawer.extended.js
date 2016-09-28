/*! wavesurfer.js 1.1.1 (Mon, 04 Apr 2016 09:49:47 GMT)
* https://github.com/katspaugh/wavesurfer.js
* @license CC-BY-3.0 */

'use strict';

/**
 * Purpose: 
 *   Add methods getFrequencyRGB, getFrequencies, resample, drawSpectrogram 
 *   to WaveSurfer.Drawer.Canvas. These methods are modified versions from the the 
 *   spectrogram plugin (https://github.com/katspaugh/wavesurfer.js/blob/master/plugin/wavesurfer.spectrogram.js)
 *   to allow the wavesurfer drawer to draw a spectrogram representation when this.params.visualization is 
 *   set to "spectrogram"
 * Dependencies:
 *   WaveSurfer (lib/wavesurfer.min.js & lib/wavesurfer.spectrogram.min.js)
 */
WaveSurfer.util.extend(WaveSurfer.Drawer.Canvas, {

    // Takes in integer 0-255 and maps it to rgb string
    getFrequencyRGB: function(colorValue) {
        if (this.params.colorMap) {
            // If the wavesurfer has a specified colour map
            var rgb = this.params.colorMap[colorValue];
            return 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')';
        } else {
            // If not just use gray scale
            return 'rgb(' + colorValue + ',' + colorValue + ',' + colorValue + ')';
        }
        
    },

    getFrequencies: function(buffer) {
        var fftSamples = this.params.fftSamples || 512;
        var channelOne = Array.prototype.slice.call(buffer.getChannelData(0));
        var bufferLength = buffer.length;
        var sampleRate = buffer.sampleRate;
        var frequencies = [];

        if (! buffer) {
            this.fireEvent('error', 'Web Audio buffer is not available');
            return;
        }

        var noverlap = this.params.noverlap;
        if (! noverlap) {
            var uniqueSamplesPerPx = buffer.length / this.width;
            noverlap = Math.max(0, Math.round(fftSamples - uniqueSamplesPerPx));
        }

        var fft = new WaveSurfer.FFT(fftSamples, sampleRate);

        var maxSlicesCount = Math.floor(bufferLength/ (fftSamples - noverlap));

        var currentOffset = 0;

        while (currentOffset + fftSamples < channelOne.length) {
            var segment = channelOne.slice(currentOffset, currentOffset + fftSamples);
            var spectrum = fft.calculateSpectrum(segment);
            var length = fftSamples / 2 + 1;
            var array = new Uint8Array(length);
            for (var j = 0; j < length; j++) {
                array[j] = Math.max(-255, Math.log10(spectrum[j])*45);
            }
            frequencies.push(array);
            currentOffset += (fftSamples - noverlap);
        }
        
        return frequencies;
    },

    resample: function(oldMatrix) {
        var columnsNumber = this.width;
        var newMatrix = [];

        var oldPiece = 1 / oldMatrix.length;
        var newPiece = 1 / columnsNumber;

        for (var i = 0; i < columnsNumber; i++) {
            var column = new Array(oldMatrix[0].length);

            for (var j = 0; j < oldMatrix.length; j++) {
                var oldStart = j * oldPiece;
                var oldEnd = oldStart + oldPiece;
                var newStart = i * newPiece;
                var newEnd = newStart + newPiece;

                var overlap = (oldEnd <= newStart || newEnd <= oldStart) ?
                                0 :
                                Math.min(Math.max(oldEnd, newStart), Math.max(newEnd, oldStart)) -
                                Math.max(Math.min(oldEnd, newStart), Math.min(newEnd, oldStart));

                if (overlap > 0) {
                    for (var k = 0; k < oldMatrix[0].length; k++) {
                        if (column[k] == null) {
                            column[k] = 0;
                        }
                        column[k] += (overlap / newPiece) * oldMatrix[j][k];
                    }
                }
            }

            var intColumn = new Uint8Array(oldMatrix[0].length);

            for (var k = 0; k < oldMatrix[0].length; k++) {
                intColumn[k] = column[k];
            }

            newMatrix.push(intColumn);
        }

        return newMatrix;
    },

    drawSpectrogram: function (buffer) {
        var pixelRatio = this.params.pixelRatio;
        var length = buffer.duration;
        var height = (this.params.fftSamples / 2) * pixelRatio;
        var frequenciesData = this.getFrequencies(buffer);

        var pixels = this.resample(frequenciesData);

        var heightFactor = pixelRatio;

        for (var i = 0; i < pixels.length; i++) {
            for (var j = 0; j < pixels[i].length; j++) {
                this.waveCc.fillStyle = this.getFrequencyRGB(pixels[i][j]);
                this.waveCc.fillRect(i, height - j * heightFactor, 1, heightFactor);
            }
        }
    }
});

/** 
 * Override the method WaveSurfer.drawBuffer to pass in the this.backend.buffer to
 * WaveSurfer.Drawer.drawPeaks since the buffer is needed to draw the spectrogram
 */
WaveSurfer.util.extend(WaveSurfer, {
    drawBuffer: function () {
        var nominalWidth = Math.round(
            this.getDuration() * this.params.minPxPerSec * this.params.pixelRatio
        );
        var parentWidth = this.drawer.getWidth();
        var width = nominalWidth;

        // Fill container
        if (this.params.fillParent && (!this.params.scrollParent || nominalWidth < parentWidth)) {
            width = parentWidth;
        }

        var peaks = this.backend.getPeaks(width);
        this.drawer.drawPeaks(peaks, width, this.backend.buffer);
        this.fireEvent('redraw', peaks, width);
    },
});

/** 
 * Override the methods WaveSurfer.Drawer.drawPeaks to support invisible and 
 * spectrogram representations
 */
WaveSurfer.util.extend(WaveSurfer.Drawer, {
    drawPeaks: function (peaks, length, buffer) {
        this.resetScroll();
        this.setWidth(length);
        var visualization = this.params.visualization;
        if (visualization === 'invisible') {
            //draw nothing
        } else if (visualization === 'spectrogram' && buffer) {
            this.drawSpectrogram(buffer);
        } else {
            this.params.barWidth ?
                this.drawBars(peaks) :
                this.drawWave(peaks);
        }
    }
});
