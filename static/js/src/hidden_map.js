'use strict';

/*
 * Purpose:
 *   Create a map that will slowly reveal the location
 *   of the audio file
 * Dependencies:
 *   Google Maps API
 */

function HiddenMap(container, height, width, latitude, longitude) {
    this.container = document.querySelector(container);
    this.map = null;
    this.mapOptions = null;
    this.height = height;
    this.width = this.container.offsetWidth;
    this.latitude = latitude;
    this.longitude = longitude;
    this.zoomLevel = 0;
    this.maxZoom = 20;
}

HiddenMap.prototype = {

    // Create the map
    create: function() {
        
        this.container.style.height = this.height + 'px'
        this.container.style.width = this.width;


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

    shiftCoordinates: function() {
        var latLng = new google.maps.LatLng(this.latitude,this.longitude);
        var projection = this.map.getProjection();
        var bounds = this.map.getBounds();
        var topRight = projection.fromLatLngToPoint(bounds.getNorthEast());
        var bottomLeft = projection.fromLatLngToPoint(bounds.getSouthWest());
        var scale = Math.pow(2,this.map.getZoom());
        var worldPoint = projection.fromLatLngToPoint(latLng);
        var pixelX = Math.floor((worldPoint.x - bottomLeft.x) * scale)
        var pixelY = Math.floor((worldPoint.y - topRight.y) * scale)
        
    },

    navigateToSolution: function(f1Score) {
        var zoomToLevel = Math.floor(f1Score * this.maxZoom);
        var shiftedLat = 0;
        var shiftedLng = 0;
        if (zoomToLevel < 1){
            zoomToLevel = 0;
        }
        else {
            shiftedLat = this.latitude
            shiftedLng = this.longitude
        }
        
        var newLocation = new google.maps.LatLng(shiftedLat,shiftedLng)

        this.map.setZoom(zoomToLevel);
        this.map.panTo(newLocation);
    }
};