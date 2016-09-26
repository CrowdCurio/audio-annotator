'use strict';

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

        this.createWrapper();
        this.render();

        drawer.wrapper.addEventListener('scroll', function (e) {
            this.updateScroll(e);
        }.bind(this));
        wavesurfer.on('redraw', this.render.bind(this));
        wavesurfer.on('destroy', this.destroy.bind(this));
        wavesurfer.on('region-created', this.add.bind(this));
        wavesurfer.on('region-updated', this.rearrange.bind(this));
    },

    destroy: function () {
        this.unAll();
        if (this.wrapper && this.wrapper.parentNode) {
            this.wrapper.parentNode.removeChild(this.wrapper);
            this.wrapper = null;
        }
    },

    createWrapper: function () {
        var prevTimeline = this.container.querySelector('label_container');
        if (prevTimeline) {
            this.container.removeChild(prevTimeline);
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

    clear: function () {
        if (this.labelsElement) {
            this.labelsElement.parentElement.removeChild(this.labelsElement);
            this.labelsElement = null;
        }
    },

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

    rearrange: function () {
        for (var id in this.labels) {
            this.labels[id].updateRender(2);
        }

        for (var id in this.labels) {
            if (this.doesItOverlap(this.labels[id])) {
                this.labels[id].updateRender(22);
            }
        }
    },

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
        this.playBtn = this.element.appendChild(document.createElement('i'));
        this.playBtn.className = 'fa fa-play-circle';
        this.style(this.playBtn, {
            marginRight: '5px',
            cursor: 'pointer'
        });
        this.text = this.element.appendChild(document.createElement('span'));
        this.text.innerHTML = '?';
        this.updateRender(1);
        this.bindEvents();
    },

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

    bindEvents: function() {
        var my = this;
        this.playBtn.addEventListener('click', function (e) {
            my.region.play();
        });
        this.element.addEventListener('dblclick', function (e) {
            my.region.wavesurfer.fireEvent('label-dblclick', my.region, e);
        });
    }
};

WaveSurfer.util.extend(WaveSurfer.Label, WaveSurfer.Observer);
