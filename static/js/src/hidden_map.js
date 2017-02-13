'use strict';

/*
 * Purpose:
 *   Create a map that will slowly reveal the location
 *   of the audio file
 * Dependencies:
 *   Google Maps API
 */

function HiddenMap(container, height) {
    this.container = document.querySelector(container);
    this.map = null;
    this.mapOptions = null;
    this.height = height;
    this.width = this.container.offsetWidth;
    this.latitude = 0;
    this.longitude = 0;
    this.answer = null;
    this.zoomLevel = 0;
    this.maxZoom = 20;
    this.prevF1Score = 0;
}

HiddenMap.prototype = {

    // Create the map
    create: function() {
        
        this.container.style.height = this.height + 'px'

        // Disable user interaction with map.
        // Make the default starting location the prime
        // meridian.
        this.mapOptions = {
            zoom: this.zoomLevel,
            // Center around 0,0 when the zoom level is 1.
            // Default mercator projection makes Antartica look huge but this
            // is the case even on the regular Google Maps website.
            center: {lat: 0, lng: 0},
            clickableIcons: false,
            disableDoubleClickZoom: true,
            disableDefaultUI: true,
            draggable: false,
            fullscreenControl: false,
            keyboardShortcuts: false,
            panControl: false,
            rotateControl: false,
            scaleControl: false,
            scrollwheel: false,
            zoomControl: false
        }
        
        this.map = new google.maps.Map(this.container, this.mapOptions);
    },

    addSolution: function(latitude,longitude) {
        this.latitude = latitude;
        this.longitude = longitude;

        // Create google maps answer LatLng
        this.answer = new google.maps.LatLng(this.latitude,this.longitude);
    },

    shiftCoordinates: function() {
        var xBoundary = Math.floor(this.width / 2);
        var yBoundary = Math.floor(this.height / 2);
        var xShift = Math.floor(Math.random() * (xBoundary*1.5 + 1)) - xBoundary/1.5;
        var yShift = Math.floor(Math.random() * (yBoundary*1.5 + 1)) - yBoundary/1.5;
        return [xShift,yShift]
    },

    navigateToSolution: function(f1Score) {
        console.log(f1Score);
        var zoomToLevel = Math.floor(f1Score * this.maxZoom);
        var newCenter = null;
        var shifted = null;
        var xShift = 0;
        var yShift = 0;
        if (this.prevF1Score == f1Score){
            return;
        }
        if (zoomToLevel < 1){
            zoomToLevel = 0;
            newCenter = new google.maps.LatLng(0,0);
        } else {
            newCenter = this.answer;
            shifted = this.shiftCoordinates();
            xShift = shifted[0];
            yShift = shifted[1];
        }

        this.map.setZoom(zoomToLevel);
        this.map.panTo(newCenter);

        if (zoomToLevel > 3 && f1Score < 1){
            this.map.panBy(xShift,yShift)
        }

        this.prevF1Score = f1Score;
    }
};