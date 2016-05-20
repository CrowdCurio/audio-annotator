'use strict';

WaveSurfer.util.extend(WaveSurfer.Drawer.Canvas, {
    getFrequencyRGB: function(colorValue) {
        if (colorValue < 70) {
            return 'rgb(255, 255, 255)';
         } else if (colorValue < 115) {
             return 'rgb(255, 0, 0)';
         } else if (colorValue < 160) {
             return 'rgb(255, 0, 255)';
         } else if (colorValue < 200){
             return 'rgb(51, 153, 255)';
         } else  {
            return 'rgb(160, 160, 160)';
         }
    },

    getFrequencies: function(buffer) {
        var fftSamples = this.fftSamples || 256;
        var channelOne = Array.prototype.slice.call(buffer.getChannelData(0));
        var bufferLength = buffer.length;
        var sampleRate = buffer.sampleRate;
        var frequencies = [];

        if (! buffer) {
            this.fireEvent('error', 'Web Audio buffer is not available');
            return;
        }

        var noverlap = this.noverlap;
        if (! noverlap) {
            var uniqueSamplesPerPx = buffer.length / this.width;
            noverlap = Math.max(0, Math.round(fftSamples - uniqueSamplesPerPx));
        }

        var fft = new WaveSurfer.FFT(fftSamples, sampleRate, this.windowFunc, this.alpha);

        var maxSlicesCount = Math.floor(bufferLength/ (fftSamples - noverlap));

        var currentOffset = 0;

        while (currentOffset + fftSamples < channelOne.length) {
            var segment = channelOne.slice(currentOffset, currentOffset + fftSamples);
            var spectrum = fft.calculateSpectrum(segment);
            var array = new Uint8Array(fftSamples/2);
            for (var j = 0; j<fftSamples/2; j++) {
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
        var length = buffer.duration;
        var height = this.height;
        var frequenciesData = this.getFrequencies(buffer);

        var pixels = this.resample(frequenciesData);

        var heightFactor = buffer ? 
                              2 / buffer.numberOfChannels : 
                              1;

        for (var i = 0; i < pixels.length; i++) {
            for (var j = 0; j < pixels[i].length; j++) {
                var colorValue = 255 - pixels[i][j];
                this.waveCc.fillStyle = this.getFrequencyRGB(colorValue);
                this.waveCc.fillRect(i, height - j * heightFactor, 1, heightFactor);
            }
        }
    },
});

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
