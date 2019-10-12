# audio-annotator

[![MIT licensed](https://img.shields.io/badge/license-BSD2-blue.svg)](https://github.com/CrowdCurio/audio-annotator/blob/master/LICENSE.txt)

Javascript web interface for annotating audio data.

Developed by [StefanieMikloska](github.com/StefanieMikloska), [CrowdLab @ Univertsity of Waterloo](http://edithlaw.ca/people.html) and [MARL @ New York University](http://steinhardt.nyu.edu/marl/).

When used in academic work please cite:

> M. Cartwright, A. Seals, J. Salamon, A. Williams, S. Mikloska, D. MacConnell, E. Law, J. Bello, and O. Nov. "Seeing sound: Investigating the effects of visualizations and complexity on crowdsourced audio annotations." In *Proceedings of the ACM on Human-Computer Interaction*, 1(1), 2017.

### Description
audio-annotator is a web interface that allows users to annotate audio recordings.

It has 3 types of audio visualizations (wavesurfer.params.visualization)
   1. invisible (appears as a blank rectangle that users can draw regions on)
   2. spectrogram (audio file is represented by a spectrogram that users can draw regions on)
   3. waveform (audio file is represented by a waveform that users can draw regions on)

Screenshot:
<kbd>
![audio-annotator screenshot](https://github.com/CrowdCurio/audio-annotator/blob/master/static/img/task-interface.png)
</kbd>

### Feedback mechanisms
audio-annotator also provides mechanisms for providing real-time feedback to the user based on their annotations: (wavesurfer.params.feedback)
   1. none (There is no feedback provided. Solution set is not needed)
   2. silent (Annotation score is calculated and recorded with each action the user takes. Solution set is required)
   3. notify (Annotation score is calculated and recorded with each action the user takes. A message will appear telling the user if they are improving or not. Solution set is required)
   4. hiddenImage (Annotation score is calculated and recorded with each action the user takes. A message will appear telling the user if they are improving or not. Also parts of a hidden image will be revealed to the user. Solution set and image src are required)
   
### To Demo
1. In the audio-annotator/ directory run `python -m SimpleHTTPServer`
2. Visit <http://localhost:8000/examples> in your browser to see the verison with annotation and proximity tags. This demo also uses the spectrogram visualization, and does not provide the user with feedback as they annotate the clip.
3. Visit <http://localhost:8000/examples/curiosity.html> in your browser to see the verison with just annotation tags. This demo also uses the spectrogram visualization, and provides the user feedback in the form of revealing a hidden image as the user correctly annotate the sound clip.

Note: In the examples, the submit annotations btn will output data to the web console, since the POST is not hooked up to the backend

### Interfacing with backends
The examples in the **examples/** do not depend on any specific backend. They make a call to json containing fake data in order to render the interface. Extra information for specific backends:

#### CrowdCurio
To view the curio versions of these files, take a look at **curio_original/audio.html** and **curio_original/main.js**. **main.js** loads and submits the task data. It contains both the GET and POST API calls. All the other JS files can be found in **static/js/**. They are not dependent on the curio system and have not been changed

### Files
* [**examples/**](examples/)
   * [index.html](examples/index.html)  
      HTML file for the normal version of the interface
   * [curiosity.html](examples/curiosity.html)  
      HTML file for the curiosity version of the interface

* [**static/css/**](static/css/)
   * [urban-ears.css](static/css/urban-ears.css)  
      Custom css for urbanears interface
   * [materialize.min.css](static/css/materialize.min.css)  
      Minified version of materlize css

* [**static/js/**](static/js/)
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
      * [annotation_stages.js](static/js/src/annotation_stages.js)  
         Defines: StageOneView (view when no region is selected), StageTwoView (online mode creation view), StageThreeView (view when region is selected, 
         it displays the tags to annotate the region), AnnotationStages (controller of the annotation work flow)
      * [components.js](static/js/src/components.js)  
         Defines: Util (helper functions for creating timestamp elements), PlayBar (play events, play button and progress time stamp), 
         WorkflowBtns (submit button and exit button)
      * [hidden_image.js](static/js/src/hidden_image.js)  
         Defines: HiddenImg (Creates elements to hide an image behind a canvas, and reveal random parts of the image)
      * [main.js](static/js/src/main.js)  
         Defines: UrbanEars (Creates and and updates all parts of the interface when a new task is loaded. Also submits task data) 
      * [message.js](static/js/src/message.js)  
         Defines: Message (helper functions that alert the user of different messages using Materlize toast)
      * [wavesurfer.drawer.extended.js](static/js/src/wavesurfer.drawer.extended.js)  
         Using the logic from the wavesurfer spectrogram plugin to override the wavesurfer drawer logic in order to have waveform visiualizations as well as spectrogram and inivisble visiualizations
      * [wavesurfer.labels.js](static/js/src/wavesurfer.labels.js)  
         Defines: WaveSurfer.Labels (creates container element for lables and controls the positioning of the labels), WaveSurfer.Label (individual label elements)
      * [wavesurfer.regions.js](static/js/src/wavesurfer.regions.js)  
         Modified version of wavesurfer regions plugin           
 (https://github.com/katspaugh/wavesurfer.js/blob/master/plugin/wavesurfer.regions.js)

* [**static/json/**](static/json/)
   * [paris.json](static/json/paris.json)  
      Solutions to paris audio clip annotations
   * [sample_curiosity_data.json](static/json/sample_curiosity_data.json)  
      Sample data for curiosity example
   * [sample_data.json](static/json/sample_data.json)  
      Sample data for normal urban ears example      

* [**curio_original/**](curio_original/)
   * [audio.html](curio_original/audio.html)  
      django view of interface from curio repo
   * [main.js](curio_original/main.js)  
      Curio repo version that makes API calls using user information provided by the django layer.
      Defines: UrbanEars (Creates and and updates all parts of the interface when a new task is loaded. Also submits task data) 
