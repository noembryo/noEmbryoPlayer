"use strict";

let _titles = ["Glassoid", "Saritan",
    "Damian", "Siren", "Memoire 2", "Beat Two", "Pianos", "Brass Beat", "Kali", "Nouvel V",
    "Ricochet", "Sissy", "The G Waltz", "Abandon", "Boringe", "Answered", "Virgo Waltz",
    "Dawn", "Ooldies", "YRU Dan", "H+Over", "Krama", "Passing", "Deep", "Harpez", "Porcelina",
    "Echoes", "Fallup", "Tracking", "Miles", "Moon Dark", "String Blocks", "Trest", "La Tenie",
    "X-Mass", "Kalinyxta"
];
// ^^^ SAME LENGTH & ORDER AS THE ABOVE !!! ^^^
let _albums = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]; // RESPECTIVE ALBUM NUMBERS

let _width = document.documentElement.clientWidth;
let _height = document.documentElement.clientHeight;
let _cover;
let _elMin;
let _elSec;
let _remainTime;
let _reMin;
let _reSec;
let _singers = [];
let _list = [];
let _launchPoint;
let _currSinger;
let _loop;
let _touchTimer;
let _helped = false;
let _proflag = false;
let _proDragged = false;
let _volDragged = false;
let _volume = 1;
const _offColor = "#400082";
const _onColor = "#a47bff"; // 9869ff
const _barColor = "#6c00d3"; // 5500aa, 2f0c53
const _exColor = "#111111";
const _txtColor = "#999999";
const _radius = Math.sqrt(_width * _width + _height * _height) / 47;
const _logoCenter = {cx: _width * .5, cy: _height * .25}; // , vx: 1};
const _logoRadius = _radius * 3.3;
const _fontHeight = _radius / 3;
const _ballFont = _fontHeight + "px tahoma";
const _barFont = _fontHeight + 2 + "px tahoma";
const _titleFont = _fontHeight * 2 + "px tahoma";

// let _music_path = "https://noembryo.github.io/noEmbryoPlayer/audio/";
// let _img_path = "https://noembryo.github.io/noEmbryoPlayer/images/";
let _music_path = "docs/audio/";
let _img_path = "docs/images/";

let _globalPlayer = document.createElement("audio");
_globalPlayer.setAttribute("crossorigin", "anonymous");
// _globalPlayer.setAttribute("preload", "auto");


// # ___ ___________________  OBJECTS  ______________________________

let Area =
    {
        canvas: document.createElement("canvas"),
        embryo: document.createElement("img"), // 8000ff
        covers: [document.createElement("img"),
            document.createElement("img"),
            document.createElement("img")],
        //timer: setTimeout(function(){}, _delay),
        make: function () {
            this.canvas.width = _width;
            this.canvas.height = _height;
            this.canvas.onmousedown = function (evt) {
                canvasTouch(evt)
            };
            this.canvas.onmouseup = function (evt) {
                canvasLet(evt)
            };
            document.body.insertBefore(this.canvas, document.body.childNodes[0]);
            this.ctx = this.canvas.getContext("2d");
            this.ctx.strokeStyle = _barColor;
            this.ctx.lineWidth = _radius * .05;
            this.ctx.font = _titleFont;
            this.ctx.textBaseline = "top";
            this.ctx.textAlign = "center";
            this.ctx.fillStyle = _txtColor;
            let that = this
            let downloadingImage = new Image();
            downloadingImage.onload = function () {
                that.embryo.src = this.src;
                that.basics();
            };
            downloadingImage.src = _img_path + "noembryo.png";
            this.embryo.src = _img_path + "noembryo.png";
            this.covers[0].src = _img_path + "Glasses.png";
            this.covers[1].src = _img_path + "Angular Blur.png";
            this.covers[2].src = _img_path + "Sole Adjustment.png";
            this.basics();
        },

        basics: function () {
            this.ctx.clearRect(0, 0, _width, _height);
            this.ctx.beginPath();
            this.ctx.arc(_logoCenter.cx, _logoCenter.cy, _logoRadius, 0, 2 * Math.PI);
            this.ctx.stroke();
            this.ctx.drawImage(this.embryo, _logoCenter.cx - _logoRadius * .65,
                _logoCenter.cy - _logoRadius * .65,
                _logoRadius * 1.3, _logoRadius * 1.3);
        },

        update: function () {
            this.basics();
            if (_currSinger) {
                this.ctx.fillText(_currSinger.title, _width * .5, _height * .4);
                this.ctx.drawImage(this.covers[_cover], _width * .5 - _logoRadius, _height
                    * .6 - _logoRadius, _logoRadius * 2, _logoRadius * 2);
            }
        },

        help: function () {
            let _message1 = "While touching, move over a piece to cross it out of the list.  "
                + "Touch on a piece to play it, pause it or put it back in the list.";
            let _message2 = "Also, use the Space key to play and pause.  Use the Arrow keys to "
                + "change the volume and seek (or skip if paused).";
            this.ctx.fillStyle = 'grey';
            this.ctx.save();
            this.ctx.globalAlpha = .1;
            this.ctx.fillRect(0, _height * .58, _width, _height * .08);
            this.ctx.restore();
            this.ctx.fillText(_message1, _width * .5, _height * .59);
            this.ctx.fillText(_message2, _width * .5, _height * .62);
            _helped = true;
            // setTimeout(this.update, 20000)
            setTimeout(this.update.bind(this), 20000);
        }
    };

let Progress =
    {
        barcanvas: document.createElement("canvas"),
        numcanvas: document.createElement("canvas"),
        barbody: document.createElement("div"),
        numbody: document.createElement("div"),

        make: function () {
            this.barcanvas.id = "probarcanvas";
            this.barcanvas.width = _width * .02;
            this.barcanvas.height = _height;
            this.barctx = this.barcanvas.getContext("2d");
            this.barctx.strokeStyle = _barColor;
            this.barctx.lineWidth = _radius * .05;
            this.barctx.moveTo(this.barcanvas.width * .5, 0);
            this.barctx.lineTo(this.barcanvas.width * .5, _height);
            this.barctx.stroke();
            this.barbody.id = "probar";
            this.barbody.style.position = "absolute";
            this.barbody.style.width = _width * .02 + "px";
            this.barbody.style.height = _height + "px";
            this.barbody.style.left = -_width * .01 + "px";
            this.barbody.style.top = 0 + "px";
            this.barbody.appendChild(this.barcanvas);
            document.body.appendChild(this.barbody);
            dragDrop.initElement(this.barbody.id);

            this.numcanvas.id = "pronumcanvas";
            this.numcanvas.width = _width * .08;
            this.numcanvas.height = _height * .03;
            this.numctx = this.numcanvas.getContext("2d");
            //this.numctx.translate(0.5, 0.5); //for aa?
            this.numctx.font = _barFont;
            this.numctx.textBaseline = "top";
            this.numctx.textAlign = "center";
            this.numctx.fillStyle = _txtColor;
            this.numbody.id = "pronum";
            this.numbody.style.position = "absolute";
            this.numbody.style.width = _width * .08 + "px";
            this.numbody.style.height = _height * .03 + "px";
            this.numbody.style.left = -_width * .03 + "px";
            this.numbody.style.top = _height * .95 + "px";
            this.numbody.appendChild(this.numcanvas);
            document.body.appendChild(this.numbody);
        },

        update: function () {
            this.barbody.style.left = String(Math.round(_width * .97
                * _globalPlayer.currentTime / _globalPlayer.duration) + "px");
            this.numbody.style.left = this.barbody.offsetLeft + this.barcanvas.width * .5
                - this.numcanvas.width * .5 + "px";
            _remainTime = _globalPlayer.duration - _globalPlayer.currentTime;
            _elMin = Math.floor(_globalPlayer.currentTime / 60);
            _elSec = Math.floor(_globalPlayer.currentTime % 60);
            _reMin = Math.floor(_remainTime / 60);
            _reSec = Math.floor(_remainTime % 60);
            this.numctx.clearRect(0, 0, _width, _height);
            this.numctx.fillText(String(_elMin) + this.fix(_elSec) + String(_elSec)
                + "    " + String(_reMin) + this.fix(_reSec) + String(_reSec),
                this.numcanvas.width * .5, this.numcanvas.height * .3);
        },

        fix: function (sec) {
            if (sec < 10)
                return ":0";
            else
                return ":";
        },

        set: function () {
            if (this.barbody.offsetLeft < -_width * .02) this.barbody.style.left = -_width * .02 + "px";
            else if (this.barbody.offsetLeft > _width * 1.02) this.barbody.style.left = _width * 1.02 + "px";
            _globalPlayer.currentTime = _globalPlayer.duration * this.barbody.offsetLeft / _width;
            if (_globalPlayer.paused) playControl();
        }
    };

let Volume =
    {
        canvas: document.createElement("canvas"),
        body: document.createElement("div"),

        make: function () {
            window.AudioContext = window.AudioContext || window.webkitAudioContext
                || window.mozAudioContext || window.msAudioContext;
            try {
                this.audioCtx = new window.AudioContext();
            } catch (e) {
                console.log(e);
            }
            this.analyser = this.audioCtx.createAnalyser();
            this.bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(this.bufferLength);
            this.analyser.smoothingTimeConstant = 0;
            this.analyser.fftSize = 2048;
            this.gainNode = this.audioCtx.createGain();

            // Connect _globalPlayer to the audio context
            this.source = this.audioCtx.createMediaElementSource(_globalPlayer);
            this.source.connect(this.analyser);
            this.analyser.connect(this.gainNode);
            this.gainNode.connect(this.audioCtx.destination);

            this.canvas.id = "volbarcanvas";
            this.canvas.width = _width;
            this.canvas.height = _width * .1;
            this.ctx = this.canvas.getContext("2d");
            this.ctx.strokeStyle = _barColor;
            this.ctx.lineWidth = _radius * .05;
            this.ctx.font = _barFont;
            this.ctx.textBaseline = "bottom";
            this.ctx.textAlign = "right";
            this.ctx.fillStyle = _txtColor;
            this.body.id = "volbar";
            this.body.style.position = "absolute";
            this.body.style.width = _width + "px";
            this.body.style.height = _width * .02 + "px";
            this.body.style.left = "0px";
            this.body.style.top = _height * .05 + "px";
            this.body.appendChild(this.canvas);
            document.body.appendChild(this.body);
            dragDrop.initElement(this.body.id);
            this.update();
        },

        draw: function () {// we grab the time domain data and copy it into our array
            this.analyser.getByteTimeDomainData(this.dataArray);
            this.ctx.beginPath();
            //Determine the width of each segment of the line to be drawn.
            let sliceWidth = this.canvas.width / this.bufferLength;
            let x = 0;
            let i;
            let v;
            let y;
            // Now we run through a loop, defining the position of a small segment of the wave
            // for each point in the buffer at a certain height based on the data point value
            // form the array, then moving the line across to the place where the next wave
            // segment should be drawn:
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // for (i = 0; i < this.bufferLength; i++) {
            for (i = 0; i < this.bufferLength; i++) {
                v = this.dataArray[i] / 128.0;
                y = v * this.canvas.height - this.canvas.height * .5;

                if (i === 0)
                    this.ctx.moveTo(x, y);
                else
                    this.ctx.lineTo(x, y);

                x += sliceWidth;
            }
            // Finally, we finish the line in the middle of the right hand side of the canvas,
            // then draw the stroke we've defined:
            this.ctx.lineTo(this.canvas.width, this.canvas.height * .5);
            this.ctx.stroke();

            this.ctx.fillText("vol  " + Math.round(_volume * 100) + " %",
                Math.round(this.canvas.width * .98),
                Math.round(this.canvas.height * .45));
        },

        update: function () {
            _volume = Math.round(((_height * .8 - this.body.offsetTop) / _height * 1.52) * 100 + 10) / 100;
            if (_volume > 1) _volume = 1;
            else if (_volume < 0) _volume = 0;
            this.gainNode.gain.value = _volume; // Set gain instead of song.volume
            if (this.body.offsetTop < _height * .21) this.body.style.top = _height * .21 + "px";
            else if (this.body.offsetTop > _height * .87) this.body.style.top = _height * .87 + "px";
        },
    };

function Singer(id) {   // Singer object constructor
    this.id = id;
    this.speed = 2;
    this.friction = 0.97;
    this.color = _offColor;
    this.selected = false;
    // this.out = false;

    this.title = _titles[id];
    this.cover = _albums[id];

    this.canvas = document.createElement("canvas");
    this.canvas.id = id;
    this.canvas.width = 2.2 * _radius;
    this.canvas.height = 2.2 * _radius;
    this.ctx = this.canvas.getContext("2d");
    //this.ctx.translate(0.5, 0.5); //for aa?

    this.body = document.createElement("div");
    this.body.id = id;
    this.body.singer = this;
    this.body.style.position = "absolute";
    this.body.style.width = 2.2 * _radius + "px";
    this.body.style.height = 2.2 * _radius + "px";
    this.body.onmousedown = dragDrop.startDragMouse;
    this.body.onclick = function() {
        if (!dragDrop.wasDragged) {
            setCurrent.call(this);
        }
        dragDrop.wasDragged = false; // Reset flag after handling
    };
    this.body.appendChild(this.canvas);
    document.body.appendChild(this.body);
    this.cx = this.body.offsetLeft + _radius * 1.1;
    this.cy = this.body.offsetTop + _radius * 1.1;

    this.make = function () {
        this.draw();
        this.move();
    };
    // circle
    this.draw = function () {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.beginPath();
        this.ctx.arc(_radius * 1.1, _radius * 1.1, _radius, 0, 2 * Math.PI);
        this.ctx.strokeStyle = this.color;
        this.ctx.fillStyle = 'black';
        this.ctx.save();
        this.ctx.globalAlpha = .5;
        this.ctx.fill();
        this.ctx.restore();
        this.ctx.lineWidth = _radius * 0.07;
        this.ctx.stroke();
        this.write();
    };
    // text
    this.write = function () {
        this.ctx.font = _ballFont;
        this.ctx.textBaseline = "middle";
        this.ctx.textAlign = "center";
        this.ctx.fillStyle = _txtColor;

        let center = Math.floor(this.title.length / 2);
        let re = / /g;
        let match;
        let dist;
        let closest = [center, 0];

        while ((match = re.exec(this.title)) != null) {
            dist = Math.abs(center - match.index);
            if (dist < closest[0])
                closest = [dist, match.index];
        }
        if (closest[0] !== center) {
            this.ctx.fillText(this.title.slice(0, closest[1]), _radius * 1.1, _radius
                * 1.1 - _radius * 0.15);
            this.ctx.fillText(this.title.slice(closest[1] + 1), _radius * 1.1, _radius
                * 1.1 - _radius * 0.15 + _fontHeight)
        } else
            this.ctx.fillText(this.title, _radius * 1.1, _radius * 1.1);
    };

    this.move = function () {
        this.vx = (Math.random() * 2 - 1) * this.speed;
        this.vy = (Math.random() * 2 - 1) * this.speed;
    };

    this.update = function () {
        if (this.body.className !== "dragged") {
            this.checkBounds();
            this.updateMotion();
        }
    };

    this.checkBounds = function () {
        if (Math.abs(this.vx) > Math.abs(this.speed))
            this.vx *= this.friction;

        if (Math.abs(this.vy) > Math.abs(this.speed))
            this.vy *= this.friction;

        if (this.cx + _radius > _width) {
            this.cx = _width - _radius;
            this.vx *= -1;
        } else if (this.cx - _radius < 0) {
            this.cx = _radius;
            this.vx *= -1;
        }

        if (this.cy + _radius > _height) {
            this.cy = _height - _radius;
            this.vy *= -1;
        } else if (this.cy - _radius < 0) {
            this.cy = _radius;
            this.vy *= -1;
        }
    };

    this.updateMotion = function () {
        this.cx += this.vx;
        this.cy += this.vy;
        this.body.style.left = Math.round(this.cx - _radius * 1.1) + 'px';
        this.body.style.top = Math.round(this.cy - _radius * 1.1) + 'px';
    };

    this.toggleSelect = function () {
        this.selected = Boolean(!this.selected);
        if (this.selected)
            this.color = _onColor;
        else
            this.color = _offColor;
        this.draw()
    };
}

// # ___ ___________________  DRAG & DROP  __________________________


function canvasTouch() {
    _touchTimer = setTimeout(startCross, 100)
}

function canvasLet() {
    if (_touchTimer) {
        clearTimeout(_touchTimer);
        if (_helped) {
            _helped = false;
            Area.update();
        } else
            Area.help();
    }
}

function startCross() {
    _touchTimer = 0;

    const length = _list.length;

    let i;
    for (i = 0; i < length; i++)
        addEventSimple(_list[i].body, 'mouseenter', exclude);

    addEventSimple(document, 'mouseup', endCross);
    return true
}

function endCross() {
    const length = _list.length;

    let i;
    for (i = 0; i < length; i++)
        removeEventSimple(_list[i].body, 'mouseenter', exclude);
    removeEventSimple(document, 'mouseup', endCross);
}

let dragDrop =
    {   // Drag and drop object by Peter-Paul Koch
        initialMouseX: undefined,
        initialMouseY: undefined,
        startX: undefined,
        startY: undefined,
        draggedObject: undefined,
        wasDragged: false,

        initElement: function (element) {
            if (typeof element == 'string')
                element = document.getElementById(element);
            element.onmousedown = dragDrop.startDragMouse;
        },
        startDragMouse: function (e) {
            if (!isNaN(parseInt(this.id)) || this.id === "volbar"
                || (this.id === "probar" && _currSinger)) {
                dragDrop.startDrag(this);
                let evt = e || window.event;
                dragDrop.initialMouseX = evt.clientX;
                dragDrop.initialMouseY = evt.clientY;
                addEventSimple(document, 'mousemove', dragDrop.dragMouse);
                addEventSimple(document, 'mouseup', dragDrop.releaseElement);
                return false;
            }
        },
        startDrag: function (obj) {
            if (dragDrop.draggedObject)
                dragDrop.releaseElement();
            dragDrop.startX = obj.offsetLeft;
            dragDrop.startY = obj.offsetTop;
            dragDrop.draggedObject = obj;
            obj.className += 'dragged';
        },
        dragMouse: function (e) {
            let evt = e || window.event;
            let dX = evt.clientX - dragDrop.initialMouseX;
            let dY = evt.clientY - dragDrop.initialMouseY;
            dragDrop.setPosition(dX, dY);
            return false;
        },
        setPosition: function (dx, dy) {
            if (dragDrop.draggedObject.id === "volbar") {
              dragDrop.draggedObject.style.top = dragDrop.startY + dy + 'px';
            } else if (dragDrop.draggedObject.id === "probar") {
              dragDrop.draggedObject.style.left = dragDrop.startX + dx + 'px';
            } else {
              // For singer balls
              dragDrop.draggedObject.style.left = dragDrop.startX + dx + 'px';
              dragDrop.draggedObject.style.top = dragDrop.startY + dy + 'px';
            }
        },
        releaseElement: function (e) {
            let evt = e || window.event;
            let dx = evt.clientX - dragDrop.initialMouseX;
            let dy = evt.clientY - dragDrop.initialMouseY;
            let distance = Math.sqrt(dx * dx + dy * dy);
            dragDrop.wasDragged = distance > 5;

            // Remove drag event listeners
            removeEventSimple(document, 'mousemove', dragDrop.dragMouse);
            removeEventSimple(document, 'mouseup', dragDrop.releaseElement);
            dragDrop.draggedObject.className =
              dragDrop.draggedObject.className.replace(/dragged/, '');

            // Update the ball’s position and velocity
            if (dragDrop.draggedObject.singer) {
              dragDrop.draggedObject.singer.cx = dragDrop.draggedObject.offsetLeft + _radius * 1.1;
              dragDrop.draggedObject.singer.cy = dragDrop.draggedObject.offsetTop + _radius * 1.1;
              if (dragDrop.wasDragged) {
                // Set velocity based on drag distance only if it was dragged
                dragDrop.draggedObject.singer.vx = dx * 0.1;
                dragDrop.draggedObject.singer.vy = dy * 0.1;
              }
            }

            dragDrop.draggedObject = null;
        }
    };

// # ___ ___________________  SETUP  ________________________________

function startApp() {
    Area.make();
    Volume.make();
    // makeSong(_random_ids[0]);
    populate();
    setTimeout(() => Area.basics(), 1000);  // 2check: Why this delay?

    window.onkeydown = function (event) {
        keyStart(event)
    };
    window.onkeyup = function (event) {
        keyEnd(event)
    };
    embryoLoop()
}

function populate() {
    let _random_ids = Array.from({length: _titles.length},
        (_, i) => i);
    _random_ids.sort(() => Math.random() - 0.5);
    _random_ids.forEach(idx => create_singer(idx));
}

function calcLaunch() { // puts ball in random unoccupied place
    let point = {x: Math.random() * _width, y: Math.random() * _height};

    if ((point.x + _radius > _width * .5 - _logoRadius && point.x - _radius
            < _width * .5 + _logoRadius)
        || (point.y + _radius > _height * .5 - _logoRadius && point.y - _radius
            < _height * .5 + _logoRadius))
        calcLaunch();
    else
        _launchPoint = point;
}

function create_singer(id) {
    if (!_singers[id]) {
        calcLaunch();
        let singer = new Singer(id);
        singer.cx = _launchPoint.x;
        singer.cy = _launchPoint.y;
        singer.make();
        _singers[id] = singer;
        _list.unshift(singer);
    }
}

// # ___ ___________________  PLAYER'S  _____________________________

function playControl(stop) {
    if (stop) {
        _globalPlayer.pause();
        _globalPlayer.currentTime = 0;
    } else if (_globalPlayer.paused) {
        _globalPlayer.play();
    } else {
        _globalPlayer.pause();
    }
}

function setCurrent() {
    let singer = _singers[this.id];
    if (singer.out) {
        singer.color = _offColor;
        singer.draw();
        _list.unshift(singer);
        singer.out = false;
        return;
    }
    if (_currSinger) {
        if (_currSinger === singer) {
            playControl();
            return;
        } else {
            _currSinger.toggleSelect();
            _globalPlayer.pause();
            _globalPlayer.currentTime = 0;
        }
    } else {
        Progress.make();
    }
    singer.toggleSelect();
    _currSinger = singer;

    _globalPlayer.src = _music_path + singer.title + ".mp3";
    _globalPlayer.load(); // Ensure the new source is loaded
    _globalPlayer.onended = skip; // When track ends, call skip
    _globalPlayer.oncanplaythrough = function() {
        _globalPlayer.play();
        _globalPlayer.oncanplaythrough = null; // Reset to avoid repeated triggers
    };
    _cover = singer.cover;
    _list.splice(_list.indexOf(singer), 1);
    _list.push(singer);
    Area.update();
}

function skip() {
    if (_currSinger) {
        let currentIndex = _list.indexOf(_currSinger);       // Find current track’s position
        let nextIndex = (currentIndex + 1) % _list.length;   // Get next track, loop if needed
        setCurrent.apply(_list[nextIndex]);                  // Play the next track
    } else {
        setCurrent.apply(_list[0]);                          // If no current track, play first
    }
}

function exclude() {
    if (this.singer !== _currSinger) {
        this.singer.color = _exColor;
        this.singer.draw();
        _list.splice(_list.indexOf(this.singer), 1);
        this.singer.out = true;
    }
    removeEventSimple(this, 'mouseenter', exclude);
}

// # ___ ___________________  EVENTS  _______________________________

function embryoLoop() {
    let i;
    let l = _singers.length;
    let singer;
    let j;
    let other;
    let dx;
    let dy;
    let dist;
    let mindist;
    let pointofcontactx;
    let pointofcontacty;
    let coursecorrectionx;
    let coursecorrectiony;

    //for (i = 0; i < l - 1; i++)
    for (i = 0; i < l; i++) {
        if (!_singers[i] || !_singers[i].vx)
            continue;
        singer = _singers[i];

        for (j = i + 1; j < l; j++) {
            if (!_singers[j] || !_singers[j].vx)
                continue;
            other = _singers[j];
            dx = other.cx - singer.cx;
            dy = other.cy - singer.cy;
            dist = Math.sqrt(dx * dx + dy * dy);
            mindist = _radius * 2;
            //mindist = (j === l - 1) ? _radius + _logoRadius : _radius * 2;

            if (dist < mindist) {
                pointofcontactx = singer.cx + dx / dist * mindist;
                pointofcontacty = singer.cy + dy / dist * mindist;
                coursecorrectionx = (pointofcontactx - other.cx);
                coursecorrectiony = (pointofcontacty - other.cy);
                singer.vx -= coursecorrectionx;
                singer.vy -= coursecorrectiony;
                other.vx += coursecorrectionx;
                other.vy += coursecorrectiony;
            }
        }
        singer.update();
    }

    if (_proDragged || Progress.barbody.className === "dragged") {
            Progress.numbody.style.visibility = "hidden";
            _proflag = true;
        } else if (_proflag) {
            _proflag = false;
            Progress.set();
            Progress.numbody.style.visibility = "visible";
        } else if (_currSinger && !_globalPlayer.paused)
            Progress.update();

    if (_volDragged || Volume.body.className === "dragged")
        Volume.update();

    if (_currSinger)
        Volume.draw();

    _loop = window.requestAnimationFrame(embryoLoop);
}

function keyStart(evt) {
    let keycode = evt.key || evt.keyCode;
    if (evt.defaultPrevented) return;
    if (keycode === "ArrowUp" || keycode === 38) {
        if (_volume < 1) {
            _volDragged = true;
            Volume.body.style.top = Volume.body.offsetTop - 10 + "px";
            evt.preventDefault();
        }
    } else if (keycode === "ArrowDown" || keycode === 40) {
        if (_volume > 0) {
            _volDragged = true;
            Volume.body.style.top = Volume.body.offsetTop + 10 + "px";
            evt.preventDefault();
        }
    } else if (_currSinger) {
        if (keycode === "ArrowRight" || keycode === 39) {
            if (_globalPlayer.paused) skip();
            else if (_globalPlayer.currentTime < _globalPlayer.duration) {
                _proDragged = true;
                Progress.barbody.style.left = Progress.barbody.offsetLeft + 50 + "px";
            }
            evt.preventDefault();
        } else if (keycode === "ArrowLeft" || keycode === 37) {
            if (_globalPlayer.paused) skip(true);
            else if (_globalPlayer.currentTime > 0) {
                _proDragged = true;
                Progress.barbody.style.left = Progress.barbody.offsetLeft - 30 + "px";
            }
            evt.preventDefault();
        } else if (keycode === " " || keycode === 32) {
            playControl();
            evt.preventDefault();
        }
    } else if ((keycode === " " || keycode === 32) && _list) {
        skip();
        evt.preventDefault();
    } else {
        _volDragged = false;
    }
}

function keyEnd(evt) {
    let keycode = evt.key || evt.keyCode;

    if (evt.defaultPrevented)
        return; // Should do nothing if the key event was already consumed.

    if (keycode === "ArrowRight" || keycode === 39 ||
        keycode === "ArrowLeft" || keycode === 37) {
        _proDragged = false;
        evt.preventDefault();
    } else if (keycode === "ArrowUp" || keycode === 38 ||
        keycode === "ArrowDown" || keycode === 40) {
        _volDragged = false;
        evt.preventDefault();
    }
}

function addEventSimple(obj, evt, fn) {
    if (obj.addEventListener)
        obj.addEventListener(evt, fn, false);
    else if (obj.attachEvent)
        obj.attachEvent('on' + evt, fn);
}

function removeEventSimple(obj, evt, fn) {
    if (obj.removeEventListener)
        obj.removeEventListener(evt, fn, false);
    else if (obj.detachEvent)
        obj.detachEvent('on' + evt, fn);
}