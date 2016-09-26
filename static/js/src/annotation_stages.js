'use strict';

function StageOneView() {
    this.dom = null;
}

StageOneView.prototype = {
    create: function() {
        var my = this;
        var container = $('<div>');
        var button = $('<button>', {
            class: 'btn btn_start',
            text: 'CLICK TO START A NEW ANNOTATION',
        });
        button.click(function () {
            $(my).trigger('start-annotation');
        });

        var hint = $('<div>', {
            html: 'Click and drag to create a new annotation',
            class: 'hint'
        });

        var time = Util.createSegmentTime();

        this.dom = container.append([hint, time]);
    },

    update: function(start, end, enableCreate) {
        $('.start', this.dom).val(Util.secondsToString(start));
        $('.end', this.dom).val(Util.secondsToString(end));
        $('.btn_start', this.dom).prop('disabled', !enableCreate);
    },
};

function StageTwoView() {
    this.dom = null;
}

StageTwoView.prototype = {
    create: function() {
        var my = this;
        var container = $('<div>');
        var button = $('<button>', {
            class: 'btn btn_stop',
            text: 'CLICK TO END ANNOTATION',
        });
        button.click(function () {
            $(my).trigger('stop-annotation');
        });

        var time = Util.createSegmentTime();
        
        this.dom = container.append([button, time]);
    },

    update: function(region) {
        $('.start', this.dom).val(Util.secondsToString(region.start));
        $('.end', this.dom).val(Util.secondsToString(region.end));
        $('.duration', this.dom).val(Util.secondsToString(region.end - region.start));
    },
};

function StageThreeView() {
    this.dom = null;
    this.editOptionsDom = null;
    this.colors = ['rgba(236,0,251,0.4)', 'rgba(39,117,243,0.4)', 'rgba(33,177,4,0.4)'];
}

StageThreeView.prototype = {
    create: function() {
        var my = this;
        var container = $('<div>');

        var message = $('<div>', {
            class: 'stage_3_message'
        });

        var time = Util.createSegmentTime();

        var tagContainer = $('<div>', {
            class: 'tag_container',
        });
        
        this.dom = container.append([message, time, tagContainer]);
    },

    updateTagContents: function(proximityTags, annotationTags) {
        $('.tag_container', this.dom).empty();
        var proximity = this.createProximityTags(proximityTags);
        var annotation = this.createAnnotationTags(annotationTags);
        $('.tag_container', this.dom).append([annotation, proximity]);
    },

    createProximityTags: function(proximityTags) {
        if (proximityTags.length === 0) { return; }
        var my = this;

        var proximity = $('<div>');
        var proximityLabel = $('<div>', {
            class: 'stage_3_label',
            text: 'The sound is:',
        });

        var proximityContainer = $('<div>', {
            class: 'proximity_tags'
        });

        proximityTags.forEach(function (tagName, index) {
            var tag = $('<button>', {
                class: 'proximity_tag btn',
                text: tagName,
            });
            tag.click(function () {
                $(my).trigger(
                    'change-tag', 
                    [{proximity: tagName, color: my.colors[index]}]
                );
            });
            proximityContainer.append(tag);
        });

        return proximity.append([proximityLabel, proximityContainer]);
    },

    createAnnotationTags: function(annotationTags) {
        var my = this;

        var annotation = $('<div>');
        var annotationLabel = $('<div>', {
            class: 'stage_3_label',
            text: 'Tag:',
        });

        var annotationContainer = $('<div>', {
            class: 'annotation_tags'
        });

        annotationTags.forEach(function (tagName) {
            var tag = $('<button>', {
                class: 'annotation_tag btn',
                text: tagName,
            });
            tag.click(function () {
                $(my).trigger('change-tag', [{annotation: tagName}]);
            });
            annotationContainer.append(tag);
        });

        return annotation.append([annotationLabel, annotationContainer]);
    },

    update: function(region) {
        this.updateTime(region);
        this.updateSelectedTags(region);
    },

    updateTime: function(region) {
        $('.start', this.dom).val(Util.secondsToString(region.start));
        $('.end', this.dom).val(Util.secondsToString(region.end));
        $('.duration', this.dom).val(Util.secondsToString(region.end - region.start));
    },

    updateSelectedTags: function(region) {
        $('.annotation_tag', this.dom).removeClass('selected');
        $('.proximity_tag', this.dom).removeClass('selected');
        $('.custom_tag input', this.dom).val('');

        if (region.annotation) {
            var selectedTags = $('.annotation_tag', this.dom).filter(function () {
                return this.innerHTML === region.annotation;
            });
            if (selectedTags.length > 0) {
                selectedTags.addClass('selected');       
            } else {
                $('.custom_tag input', this.dom).val(region.annotation); 
            }
        }

        if (region.proximity) {
            var selectedTags = $('.proximity_tag', this.dom).filter(function () {
                return this.innerHTML === region.proximity;
            });
            selectedTags.addClass('selected');
        }
    }
};


function AnnotationStages(wavesurfer, hiddenImage) {
    this.currentStage = 0;
    this.currentRegion = null;
    this.usingProximity = false;
    this.stageOneView = new StageOneView();
    this.stageTwoView = new StageTwoView();
    this.stageThreeView = new StageThreeView();
    this.wavesurfer = wavesurfer;
    this.hiddenImage = hiddenImage;
    this.deletedAnnotations = [];
    this.annotationSolutions = [];
    this.city = '';
    this.previousF1Score = 0;
    this.events = [];

    // These are not reset, since they should only be shown for the first clip
    this.shownTagHint = false;
    this.shownSelectHint = false;
}

AnnotationStages.prototype = {
    create: function() {
        // Add events
        this.addStageOneEvents();
        this.addStageTwoEvents();
        this.addStageThreeEvents();
        this.addWaveSurferEvents();

        // Create dom
        this.stageOneView.create();
        this.stageTwoView.create();
        this.stageThreeView.create();

    },

    getAnnotationData: function(region) {
        var regionData = {
            'id': region.id,
            'start': region.start,
            'end': region.end,
            'annotation': region.annotation
        };
        if (this.usingProximity) {
            regionData.proximity = region.proximity;
        }
        return regionData;
    },

    getAnnotations: function() {
        var annotationData = [];
        if (this.wavesurfer.regions) {
            for (var region_id in this.wavesurfer.regions.list) {
                var region = this.wavesurfer.regions.list[region_id];
                annotationData.push(this.getAnnotationData(region));
            }
        }
        return annotationData;
    },

    getDeletedAnnotations: function() {
        var annotationData = [];
        var length = this.deletedAnnotations.length;
        for (var i = 0; i < length; ++i) {
            annotationData.push(this.getAnnotationData(this.deletedAnnotations[i]));
        }
        return annotationData;
    },

    annotationDataValidationCheck: function() {
        if (this.wavesurfer.regions) {
            for (var region_id in this.wavesurfer.regions.list) {
                var region = this.wavesurfer.regions.list[region_id];
                if (region.annotation === '' || (this.usingProximity && region.proximity === '')) {
                    if (this.usingProximity) {
                        Message.notifyAlert('Make sure all your annotations have an annotation tag and a proximity tag!'); 
                    } else {
                        Message.notifyAlert('Make sure all your annotations have a tag!'); 
                    }
                    return false;
                }
            }
        }
        return true;
    },

    swapRegion: function(newStage, region) {
        if (this.currentRegion) {
            this.currentRegion.update({drag: false, resize: false});
            $(this.currentRegion.element).removeClass('current_region');
            $(this.currentRegion.annotationLabel.element).removeClass('current_label');
        }
        if (region) {
            if (newStage === 2) {
                region.update({drag: false, resize: false});
            } else if (newStage === 3) {
                region.update({drag: true, resize: true});
                $(region.element).addClass('current_region');
                $(region.annotationLabel.element).addClass('current_label');
            }
        }
        this.currentRegion = region;
    },

    updateStage: function(newStage, region) {
        this.swapRegion(newStage, region);

        var newContent = null;
        if (newStage === 1) {
            this.stageOneView.update(null, null, this.wavesurfer.isPlaying());
            newContent = this.stageOneView.dom;
        } else if (newStage === 2) {
            this.stageTwoView.update(region);
            newContent = this.stageTwoView.dom;
        } else if (newStage === 3) {
            this.stageThreeView.update(region);
            newContent = this.stageThreeView.dom;
        }

        if (newContent) {
            // update current stage
            this.currentStage = newStage;

            // update dom of page
            var container = $('.creation_stage_container');
            container.fadeOut(10, function(){
                container.children().detach();
                container.append(newContent).fadeIn();
            });
        }
        this.hint();
    },

    hint: function() {
        if (this.wavesurfer.regions && Object.keys(this.wavesurfer.regions.list).length === 1) {
            if (this.currentStage === 1 && !this.shownSelectHint) {
                Message.notifyHint('Double click on a segment to select or deselect it.');
                this.shownSelectHint = true;
            }
            if (this.currentStage === 3 && !this.shownTagHint) {
                Message.notifyHint('Select a tag to annotation the segment.');
                this.shownTagHint = true;
            }
        }
    },

    clear: function() {
        this.currentStage = 0;
        this.currentRegion = null;
        this.usingProximity = false;
        this.annotationSolutions = [];
        this.city = '';
        this.previousF1Score = 0;
        this.wavesurfer.clearRegions();
        this.events = [];
        this.deletedAnnotations = [];
    },

    reset: function(proximityTags, annotationTags, solution) {
        this.clear();
        // Update all Tags' Contents
        this.updateContentsTags(proximityTags, annotationTags);
        this.usingProximity = proximityTags.length > 0;
        // Update solution set
        this.annotationSolutions = solution.annotations || [];
        this.city = solution.city || '';
    },

    updateContentsTags: function(proximityTags, annotationTags) {
        this.stageThreeView.updateTagContents(
            proximityTags,
            annotationTags
        );
    },

    updateEndOfRegion: function() {
        var current = this.wavesurfer.getCurrentTime();
        if (this.currentStage === 2 && current > this.currentRegion.end) {
            this.currentRegion.update({
                end: current
            });
            this.stageTwoView.update(this.currentRegion);
        }
    },

    createRegionSwitchToStageThree: function(region) {
        if (region !== this.currentRegion) {
            this.trackEvent('offline-create', region.id);
            this.updateStage(3, region);
        }
    },

    switchToStageThree: function(region) {
        if (region !== this.currentRegion) {
            this.trackEvent('select-for-edit', region.id);
            this.updateStage(3, region);
        } else {
            this.trackEvent('deselect', region.id);
            this.updateStage(1);
        }
    },

    updateStartEndStageThree: function() {
        if (this.currentStage === 3) {
            this.stageThreeView.updateTime(this.currentRegion);
        }
    },

    trackMovement: function(region, event, type) {
        if (this.currentStage === 3) {
            this.giveFeedback();
            this.trackEvent('region-moved-' + type, this.currentRegion.id);
        }
    },

    updateStageOne: function() {
        if (this.currentStage === 1) {
            this.stageOneView.update(
                null,
                null, 
                this.wavesurfer.isPlaying()
            );
        }
    },

    updateStageOneWhileCreating: function(region) {
        if (this.currentStage === 1) {
            this.stageOneView.update(
                region.start,
                region.end,
                this.wavesurfer.isPlaying()
            );
        }
    },

    startAnnotation: function() {
        var region = this.wavesurfer.addRegion({
            start: this.wavesurfer.getCurrentTime(),
            end: this.wavesurfer.getCurrentTime(),
        });
        this.updateStage(2, region);
    },

    stopAnnotation: function() {
        if (this.wavesurfer.isPlaying()) {
            this.wavesurfer.pause();
        }
        this.trackEvent('online-create', this.currentRegion.id);
        this.updateStage(3, this.currentRegion);
    },

    deleteAnnotation: function(region) {
        this.giveFeedback();
        this.trackEvent('delete', region.id);
        this.deletedAnnotations.push(region);
        if (region === this.currentRegion) {
            this.updateStage(1);
        }
    },

    updateRegion: function(event, data) {
        var annotationEventType = null;
        var proximityEventType = null;
        if (data.annotation && data.annotation !== this.currentRegion.annotation) {
            annotationEventType = this.currentRegion.annotation ? 'change' : 'add';
        }
        if (data.proximity && data.proximity !== this.currentRegion.proximity) {
            proximityEventType = this.currentRegion.proximity ? 'change' : 'add';
        }

        this.currentRegion.update(data);
        this.giveFeedback();

        if (annotationEventType) {
            this.trackEvent(
                annotationEventType + '-annotation-label',
                this.currentRegion.id,
                this.currentRegion.annotation
            );
        }
        if (proximityEventType) {
            this.trackEvent(
                proximityEventType + '-proximity-label',
                this.currentRegion.id,
                this.currentRegion.proximity
            );
        }

        if (this.currentRegion.annotation && (!this.usingProximity || this.currentRegion.proximity)) {
            this.updateStage(1);
        }
    },

    giveFeedback: function() {
        if (this.wavesurfer.params.feedback !== 'none') {
            var newF1Score = this.computeF1Score();
            if (this.wavesurfer.params.feedback === 'notify') {
                this.notify(newF1Score);
            } else if (this.wavesurfer.params.feedback === 'hiddenImage') {
                this.hiddenImage.resetCover();
                this.notify(newF1Score);
                this.showImage(newF1Score);
            }
            // After we checked if the user has improved and recieved feedback, replace f1 score
            this.previousF1Score = newF1Score;
        }
    },

    computeF1Score: function() {
        if (this.annotationSolutions.length === 0) { return 0; }
        var segmentLength = 1; // Each segment is one second long
        var gridSize = Math.ceil(this.wavesurfer.getDuration()) / segmentLength;
        var solutionGrid = [];
        var userGrid = [];

        for (var i = 0; i < gridSize; ++i) {
            solutionGrid.push([]);
            userGrid.push([]);
        }

        // Slice up solution set events into segments
        for (var i = 0; i < this.annotationSolutions.length; i++) {
            var event = this.annotationSolutions[i];

            // Find first and last segments that overlap with the event
            var firstSegment = Math.floor(event.start / segmentLength);
            var lastSegment = Math.floor(event.end / segmentLength);

            // Handle corner case where event ends exaclty on grid boundary
            if (event.end % segmentLength === 0) {
                lastSegment -= 1;
            }

            // Add label to all overlapping segments
            for (var j = firstSegment; j < lastSegment + 1; j++) {
                solutionGrid[j].push(event.annotation);
            }
        }

        for (var region_id in this.wavesurfer.regions.list) {
            var event = this.wavesurfer.regions.list[region_id];

            // Find first and last segments that overlap with the event
            var firstSegment = Math.floor(event.start / segmentLength);
            var lastSegment = Math.floor(event.end / segmentLength);

            // Handle corner case where event ends exaclty on grid boundary
            if (event.end % segmentLength === 0) {
                lastSegment -= 1;
            }

            // Add label to all overlapping segments
            for (var j = firstSegment; j < lastSegment + 1; j++) {
                if (event.annotation !== '') {
                    userGrid[j].push(event.annotation);
                }
            }
        }

        // Make sure each segment label lists are unique
        for (var i = 0; i < gridSize; i++) {
            solutionGrid[i] = $.unique(solutionGrid[i]);
            userGrid[i] = $.unique(userGrid[i]);
        }

        var tpTotal = 0; // total number of true positives
        var fpTotal = 0; // total number of false positives
        var fnTotal = 0; // total number of false negatives

        for (var i = 0; i < gridSize; i++) {
            var solutionSegmentLabels = solutionGrid[i];
            var userSegmentLabels = userGrid[i];
            var intersection = $(solutionSegmentLabels).filter(userSegmentLabels);

            // True positives are labels that appear in both lists
            var tp = intersection.length;
            // False positives are labels that appear in est but not in ref
            var fp = solutionSegmentLabels.length - tp;
            // False negatives are labels that appear in ref but not in est
            var fn = userSegmentLabels.length - tp;

            tpTotal += tp;
            fpTotal += fp;
            fnTotal += fn;
        }

        var f1Score = 2 * tpTotal / (2 * tpTotal + fpTotal + fnTotal);
        return f1Score;
    },

    notify: function(f1Score) {
        if (f1Score > this.previousF1Score) {
            Message.notifyPositive();
        } else if (f1Score < this.previousF1Score) {
            Message.notifyNegative();
        }
    },

    showImage: function(f1Score) {
        this.hiddenImage.showRandomParts(f1Score);
    },

    aboveThreshold: function() {
        var hasFeedback = this.wavesurfer.params.feedback === 'hiddenImage' ||
                          this.wavesurfer.params.feedback === 'notify';
        return hasFeedback && this.previousF1Score >= 0.65;
    },

    displaySolution: function() {
        Message.notifyCompletion(this.city);
        if (this.wavesurfer.params.feedback === 'hiddenImage') {
            this.hiddenImage.showImage();
            this.hiddenImage.writeMessage(this.city);
        }
    },

    trackBeginingOfRegionCreation: function(region) {
        this.trackEvent('start-to-create', region.id);
    },

    switchToStageOneOnCreate: function() {
        if (this.currentStage !== 1) {
            this.updateStage(1);
        }
    },

    trackEvent: function(eventString, regionId, regionLabel) {
        var eventData = {
            event: eventString,
            time: new Date().getTime(),
            region_id: regionId
        };
        if (regionLabel) {
            eventData.region_label = regionLabel;
        }
        if (this.wavesurfer.params.feedback !== 'none') {
            eventData.f1 = this.previousF1Score;
            eventData.number_tiles = (this.wavesurfer.params.feedback === 'hiddenImage') ?
                                        Math.floor(this.previousF1Score * 10) : 0;
        }
        this.events.push(eventData);
    },

    getEvents: function() {
        // Return shallow copy
        return this.events.slice();
    },

    trackPlayRegion: function(region) {
        this.trackEvent('play-region', region.id);
    },

    addWaveSurferEvents: function() {
        this.wavesurfer.enableDragSelection();
        this.wavesurfer.on('audioprocess', this.updateEndOfRegion.bind(this));
        this.wavesurfer.on('audioprocess', this.updateStageOne.bind(this));
        this.wavesurfer.on('pause', this.updateEndOfRegion.bind(this));
        this.wavesurfer.on('region-play', this.trackPlayRegion.bind(this));
        this.wavesurfer.on('region-dblclick', this.switchToStageThree.bind(this));
        this.wavesurfer.on('label-dblclick', this.switchToStageThree.bind(this));
        this.wavesurfer.on('region-update-end', this.trackMovement.bind(this));
        this.wavesurfer.on('region-update-end', this.createRegionSwitchToStageThree.bind(this));
        this.wavesurfer.on('region-update-end', this.updateStartEndStageThree.bind(this));
        this.wavesurfer.on('region-updated', this.updateStartEndStageThree.bind(this));
        this.wavesurfer.on('region-updated', this.updateStageOneWhileCreating.bind(this));
        this.wavesurfer.on('region-updated', this.stageThreeView.updateSelectedTags.bind(this));
        this.wavesurfer.on('region-created', this.trackBeginingOfRegionCreation.bind(this));
        this.wavesurfer.on('region-created', this.switchToStageOneOnCreate.bind(this));
        this.wavesurfer.on('region-removed', this.deleteAnnotation.bind(this));
    },

    addStageOneEvents: function() {
        $(this.stageOneView).on('start-annotation', this.startAnnotation.bind(this));
    },

    addStageTwoEvents: function() {
        $(this.stageTwoView).on('stop-annotation', this.stopAnnotation.bind(this));
    },

    addStageThreeEvents: function() {
        $(this.stageThreeView).on('change-tag', this.updateRegion.bind(this));
    },   
};
