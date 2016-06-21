# urbanears
### To Demo
1. git clone https://github.com/StefanieMikloska/urbanears.git
2. In the urbanears/ directory run `python -m SimpleHTTPServer`
3. Visit <http://localhost:8000> in your browser

### Files
* [**index.html**](index.html)  
   html file for urbanears

* [**urbanears/static/css/**](static/css/)
   * [annotation_style.css](static/css/annotation_style.css)  
      Custom css for urbanears interface
   * [bootstrap.min.css](static/css/bootstrap.min.css)  
      Minified version of bootstrap css

* [**urbanears/static/js/**](static/js/)
   * [colormap/](static/js/colormap/)
      * [gen_colormap.sh](static/js/colormap/gen_colormap.sh)  
         Shell script used to generate colormap.min.js. If gen_colormap.js is modified  
         run `source gen_colormap.sh` in the colormap directory to generate the new colormap.min.js
      * [gen_colormap.js](static/js/colormap/gen_colormap.js)  
         This file is used by gen_colormap.sh to generate colormap.min.js  
         It that requires colormap node module and adds it as a global variable  
         This file also defines the magma colour scheme
      * [colormap.min.js](static/js/colormap/colormap.min.js)  
         Generated JS file
   * [lib/](static/js/lib/)
      * Non modified minified external JS libraries used by the  urbanears interface
   * [src/](static/js/src/)
      * [annotation_components.js](static/js/src/annotation_components.js)  
         Definition of class associated with different components of the page.  
         * Util: Util class to create Start and End time component
         * StageOneView, StageTwoView, StageThreeView: Views for the different stages of the interface
         * AnnotationStages: controller to switch between views when as the user annotated the sound clip
         * PlayBar: the play button and time displayed below the wave visualization
         * SavedAnnotations: Class to help store which annotations have been saved
         * NextTask: logic for the submit annotations button to load the next sound clip
      * [main.js](static/js/src/main.js)  
         Definition of UrbanEars class and main function. This file also calls the main function which  
         renders the urbanears interface
      * [spectrogram.js](static/js/src/spectrogram.js)  
         Using the logic from the wavesurfer spectrogram plugin to override the wavesurfer drawer logic  
         in order to have waveform visiualizations as well as spectrogram and inivisble visiualizations  
      * [wavesurfer.regions.js](static/js/src/wavesurfer.regions.js)  
         Modified version of wavesurfer regions plugin (https://github.com/katspaugh/wavesurfer.js/blob/master/plugin/wavesurfer.regions.js) 

* [**urbanears/static/json/**](static/json/)
   * [experiment_data.json](static/json/experiment_data.json)  
      Fake data in JSON format that the urbanears makes a http GET request to

* [**urbanears/static/wav/**](static/wav/)
   * [traffic1.wav](static/wav/traffic1.wav), [traffic2.wav](static/wav/traffic2.wav)  
      Test WAV files the interface loads
