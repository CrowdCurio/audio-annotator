'use strict';

/*
 * Purpose:
 *   Used to notify user of hints on how to use the interface and if they are improving or not. 
 *   Materialize toast makes the text appear in a message box in the top right hand corner for a specified 
 *   amount of time.
 * Dependencies:
 *   Materlize, Font Awesome, audio-annotator.css
 */

var Message = {
    notifyPositive: function() {
        Materialize.toast('<i class="fa fa-thumbs-up"></i>You are getting warmer!', 3000);
    },

    notifyNegative: function() {
        Materialize.toast('<i class="fa fa-frown-o"></i>You are getting colder.', 3000);
    },

    notifyCompletion: function(city) {
        Materialize.toast('Congrats! You discovered ' + city + '!', 3000);
    },

    notifyAlert: function(message) {
        // Add class red, materlialize's built css will make the box appear red
        Materialize.toast('<i class="fa fa-exclamation-triangle"></i>' + message , 5000, 'red');
    },

    notifyHint: function(message) {
        // Add class toastHint (css defined in audio-annotator.css) 
        Materialize.toast('<i class="fa fa-lightbulb-o"></i>' + message, 3000, 'toastHint');
    }
};
