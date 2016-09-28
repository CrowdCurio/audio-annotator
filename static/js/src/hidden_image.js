'use strict';

/*
 * Purpose:
 *   Create a img with a canvas over it, so you can slowly show random
 *   parts of the image
 * Dependencies:
 *   None
 */

function HiddenImg(container, height, width) {
    this.container = document.querySelector(container);
    this.canvas = null;
    this.height = height;
    this.width = this.container.offsetWidth;
    this.shuffleTitles = [];
}

HiddenImg.prototype = {

    // Create image, image container and canva elements
    create: function() {
        this.canvas = document.createElement('canvas');
        this.canvas.style.zIndex = 1;
        this.canvas.style.position = 'relative';
        this.cover = this.canvas.getContext('2d');
        this.cover.canvas.height = this.height;
        this.cover.canvas.width = this.width;

        this.imageContainer = document.createElement('div');
        this.imageContainer.style.height = this.height + 'px';
        this.imageContainer.style.width = this.width + 'px';
        this.imageContainer.style.position = 'absolute';
        this.imageContainer.style.top = 0;
        this.imageContainer.style.overflow = 'hidden';

        this.image = document.createElement('img');
        this.image.style.width = '100%';
        this.image.style.height = '100%';
        this.image.style.position = 'absolute';
    },

    // Appends the image, image container and canvas html elements to the container on 
    // the page. Also modifies the container's style. 
    append: function(url) {
        this.container.style.position = 'relative';
        this.container.style.overflowX = 'auto';
        this.container.style.border = '1px dashed black';
        this.container.style.boxSizing = 'content-box';

        this.container.appendChild(this.canvas);
        this.container.appendChild(this.imageContainer);
        this.imageContainer.appendChild(this.image);
        this.reset(url);
    },

    // Removes the image, image container and canvas elements from the container and resets
    // the containers style.
    remove: function() {
        this.container.removeAttribute('style');
        this.container.removeChild(this.canvas);
        this.container.removeChild(this.imageContainer);
        this.imageContainer.removeChild(this.image);
    },

    // Reset the canvas element to cover the whole image and 
    // add back the blur style to the image element
    resetCover: function() {
        this.cover.fillStyle = 'white';       
        this.cover.fillRect(0, 0, this.width, this.height);
        this.cover.fillStyle = 'black';
        this.cover.font = 'italic 30px Arial';

        this.image.style['filter'] = 'blur(2px)';
        this.image.style['-webkit-filter'] = 'blur(2px)';
    },

    // Add text in the middle of the canvas to prompt the user to complete the task
    resetText: function () {
        this.cover.textAlign = 'center';
        this.cover.textBaseline = 'middle'; 
        this.cover.fillText('Find all the sounds to reveal what city this clip comes from.', this.width / 2, this.height / 2);
    },

    // Reset the cover, text and image source. It also re shuffles
    // what parts of the canvas will be cleared
    reset: function(url) {
        this.resetCover();
        this.resetText();
        this.image.src = url;
        var tiles = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        this.shuffleTitles = this.shuffle(tiles);
    },

    // Remove blur style from image and clear the canva colour to display the image hidden behind it
    showImage: function() {
        this.image.style['filter'] = 'blur(0px)';
        this.image.style['-webkit-filter'] = 'blur(0px)';
        this.cover.clearRect(0, 0, this.width, this.height);
    },

    // Write a city's name in the middle of the canvas
    writeMessage: function(city) {
        this.cover.textAlign = 'center';
        this.cover.font = 'italic 50px Arial';
        this.cover.strokeStyle = 'black';
        this.cover.lineWidth = 5;
        this.cover.strokeText(city, this.width / 2, this.height / 2);
        this.cover.fillStyle = 'white';
        this.cover.fillText(city, this.width / 2, this.height / 2);
    },

    // The canva is broken into 10 parts. The percent is the number of those parts will be uncovered
    showRandomParts: function(percent) {
        // Get integer values
        var numTilesToShow = Math.floor(percent * 10);

        var tileWidth = this.width / this.shuffleTitles.length;
        // Clear random sections of the canvas
        for (var i = 0; i < numTilesToShow; i++) {
            // shuffleTitles is an array of shuffled integers that correspond to what parts of the canva to clear
            var left = this.shuffleTitles[i] * tileWidth;
            this.cover.clearRect(left, 0, tileWidth, this.height);
        }
    },

    // Randomize the order of elements in an array
    shuffle: function(array) {
        // Algorithm to shuffle an array
        // http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
        var currentIndex = array.length;
        var temporaryValue = 0;
        var randomIndex = 0;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {
            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
        return array;
    }

};