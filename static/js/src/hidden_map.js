'use strict';

/*
 * Purpose:
 *   Create a map that will slowly reveal the location
 *   of the audio file
 * Dependencies:
 *   Google Maps API
 */

function HiddenMap(container, height, latitude, longitude) {
    this.container = document.querySelector(container);
    this.map = null;
    this.mapOptions = null;
    this.height = height;
    this.latitude = latitude;
    this.longitude = longitude;
    this.zoomLevel = 3;
}

HiddenMap.prototype = {

    // Create the map
    create: function() {
        
        this.container.style.height = this.height + 'px'
        this.container.style.width = this.container.offsetWidth;


        // Disable user interaction with map.
        // Make the default starting location the prime
        // meridian.
        this.mapOptions = {
            zoom: 1,
            //center: {lat: this.getVariedLatitude(this.latitude), lng: this.getVariedLongitude(this.longitude)},
            center: {lat: 51.4779, lng: 0.0014},
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
        this.answer = new google.maps.Marker({
            position: {lat: this.latitude, lng: this.longitude},
            map: this.map
        });
    }
};