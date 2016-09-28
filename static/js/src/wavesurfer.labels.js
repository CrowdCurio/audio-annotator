'use strict';

/**
 * Purpose:
 *   Add labels of the annotation above the corresponding regions
 * Dependencies:
 *   WaveSurfer (lib/wavesurfer.min.js), WaveSurfer.Regions (src/wavesurfer.regions.js)
 */

WaveSurfer.Labels = {
    style: WaveSurfer.Drawer.style,

    init: function (params) {
        this.params = params;
        var wavesurfer = this.wavesurfer = params.wavesurfer;

        if (!this.wavesurfer) {
            throw Error('No WaveSurfer intance provided');
        }

        var drawer = this.drawer = this.wavesurfer.drawer;

        this.container = 'string' == typeof params.container ?
            document.querySelector(params.container) : params.container;

        if (!this.container) {
            throw Error('No container for WaveSurfer timeline');
        }

        this.width = drawer.width;
        this.pixelRatio = this.drawer.params.pixelRatio;
        this.height = this.params.height || 40;
        this.labelsElement = null;
        this.labels = {};

        // Create & append wrapper element to container
        this.createWrapper();
        // Create & append label container element to wrapper element
        this.render();

        // When the user scrolls in the wavesurfer, make the labels scroll with it
        drawer.wrapper.addEventListener('scroll', function (e) {
            this.updateScroll(e);
        }.bind(this));

        // Replace the label container with a empty one when the wavesurfer is redrawn
        wavesurfer.on('redraw', this.render.bind(this));
        // Destory the wrapper when the wavesurfer is destroyed
        wavesurfer.on('destroy', this.destroy.bind(this));
        // Add a label when a region is created
        wavesurfer.on('region-created', this.add.bind(this));
        // Update a label when its region is updated
        wavesurfer.on('region-updated', this.rearrange.bind(this));
    },

    // Remove the wrapper element
    destroy: function () {
        this.unAll();
        if (this.wrapper && this.wrapper.parentNode) {
            this.wrapper.parentNode.removeChild(this.wrapper);
            this.wrapper = null;
        }
    },

    // Create & append the wrapper element
    createWrapper: function () {
        var prevWrapper = this.container.querySelector('label_container');
        if (prevWrapper) {
            this.container.removeChild(prevWrapper);
        }

        this.wrapper = this.container.appendChild(
            document.createElement('label_container')
        );
        this.style(this.wrapper, {
            display: 'block',
            position: 'relative',
            height: this.height + 'px'
        });

        if (this.wavesurfer.params.fillParent || this.wavesurfer.params.scrollParent) {
            this.style(this.wrapper, {
                width: '100%',
                overflow: 'hidden',
            });
        }
    },

    // Remove the label container element
    clear: function () {
        if (this.labelsElement) {
            this.labelsElement.parentElement.removeChild(this.labelsElement);
            this.labelsElement = null;
        }
    },

    // Create and append the label container element
    render: function () {
        this.clear();
        this.labelsElement = this.wrapper.appendChild(document.createElement('div'));
        this.style(this.labelsElement, {
            height: this.height + 'px',
            width: this.drawer.wrapper.scrollWidth * this.pixelRatio + 'px',
            left: 0
        });
    },

    updateScroll: function () {
        this.wrapper.scrollLeft = this.drawer.wrapper.scrollLeft;
    },

    // Create & append a label element that is associated with the given region
    add: function (region) {
        var label = Object.create(WaveSurfer.Label);
        label.init(region, this.labelsElement);

        this.labels[region.id] = label;

        region.on('remove', (function () {
            this.labels[region.id].remove();
            delete this.labels[region.id];
        }).bind(this));

        return label;
    },

    // Rearrange the labels to reduce overlap
    rearrange: function () {
        // First place all label elements in bottom row
        for (var id in this.labels) {
            // 2 px above wavesurfer canvas
            this.labels[id].updateRender(2);
        }

        // If a label overlaps with another, move it up to the top row
        for (var id in this.labels) {
            if (this.doesItOverlap(this.labels[id])) {
                // 22 px above wavesurfer canvas
                this.labels[id].updateRender(22);
            }
        }
    },

    // Calcuates if a label overlaps with any other label elements
    doesItOverlap: function(label) {
        for (var id in this.labels) {
            var otherLabel = this.labels[id];
            if (otherLabel === label) {
                continue;
            }
            if ((label.left() <=  otherLabel.right() && label.left() >=  otherLabel.left()) ||
                (label.right() >=  otherLabel.left() && label.right()  <= otherLabel.right()) ||
                (label.right() >=  otherLabel.right() && label.left()  <= otherLabel.left())) {
                return label.region.element.offsetWidth < otherLabel.region.element.offsetWidth;
            }
        }
        return false;
    }
};

WaveSurfer.util.extend(WaveSurfer.Labels, WaveSurfer.Observer);

/**
 * Purpose:
 *   Individual label elements
 * Dependencies:
 *   WaveSurfer (lib/wavesurfer.min.js), WaveSurfer.Region (src/wavesurfer.regions.js), Font Awesome
 */
WaveSurfer.Label = {
    style: WaveSurfer.Drawer.style,

    init: function (region, container, wavesurfer) {
        this.container = container;
        this.wavesurfer = region.wavesurfer;
        this.element = null;
        this.playBtn = null;
        this.text = null;
        region.annotationLabel = this;
        this.region = region;
        this.render();
    },

    // Create and append individual label element
    render: function() {
        var labelEl = document.createElement('tag');

        this.element = this.container.appendChild(labelEl);
        this.style(this.element, {
            position: 'absolute',
            whiteSpace: 'nowrap',
            backgroundColor: '#7C7C7C',
            color: '#ffffff',
            padding: '0px 5px',
            borderRadius: '2px',
            fontSize: '12px',
            textTransform: 'uppercase'
        });

        // Add play button inside the label
        this.playBtn = this.element.appendChild(document.createElement('i'));
        this.playBtn.className = 'fa fa-play-circle'; // Font Awesome Icon
        this.style(this.playBtn, {
            marginRight: '5px',
            cursor: 'pointer'
        });

        this.text = this.element.appendChild(document.createElement('span'));
        this.text.innerHTML = '?';

        // Place the label on the bottom row
        this.updateRender(2);
        this.bindEvents();
    },

    // Update the label element with it's corresponding region's annotation. Also update the label elements position.
    // The bottom parameter is how many pixels away from the label container's bottom the label element will be placed
    updateRender: function(bottom) {
        this.text.innerHTML = (this.region.annotation || '?');
        var offset = (this.region.element.offsetWidth - this.element.offsetWidth) / 2
        this.style(this.element, {
            left: Math.max(this.region.element.offsetLeft + offset, 0) + 'px',
            bottom: bottom + 'px',
            zIndex: this.wavesurfer.drawer.wrapper.scrollWidth - this.element.offsetWidth
        });
    },

    left: function() {
        return this.element.offsetLeft;
    },

    right: function() {
        return this.element.offsetLeft + this.element.offsetWidth;
    },

    remove: function() {
        this.container.removeChild(this.element);
    },

    // Add event handlers for when the user clicks the labels play btn or double clicks the label
    bindEvents: function() {
        var my = this;
        // If the user click the play button in the label, play the sound for the associated region
        this.playBtn.addEventListener('click', function (e) {
            my.region.play();
        });
        // If the user dbl clicks the label, trigger the dblclick event for the assiciated region
        this.element.addEventListener('dblclick', function (e) {
            my.region.wavesurfer.fireEvent('label-dblclick', my.region, e);
        });
    }
};

WaveSurfer.util.extend(WaveSurfer.Label, WaveSurfer.Observer);
