"use strict";

let titles = ["Glassoid", "Saritan", "Damian", "Siren", "Memoire 2", "Beat Two",
    "Pianos", "Brass Beat", "Kali", "Nouvel V", "Ricochet", "Sissy", "The G Waltz",
    "Abandon", "Boringe", "Answered", "Virgo Waltz", "Dawn", "Ooldies", "YRU Dan", "H+Over",
    "Krama", "Passing", "Deep", "Harpez", "Porcelina", "Echoes", "Fallup", "Tracking",
    "Miles", "Moon Dark", "String Blocks", "Trest", "La Tenie", "X-Mass", "Kalinyxta"
];
// ^^^ SAME LENGTH & ORDER AS THE ABOVE !!! ^^^
let album_ids = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]; // RESPECTIVE ALBUM NUMBERS
let albums = ["Glasses", "Angular Blur", "Sole Adjustment"];
let isSortedByAlbum = false;

let width = document.documentElement.clientWidth;
let height = document.documentElement.clientHeight;
let cover;
let elMin;
let elSec;
let remainTime;
let reMin;
let reSec;
let singers = [];
let launchPoint;
let currSinger;
let loop;
let touchTimer;
let proFlag = false;
let proDragged = false;
let volDragged = false;
let volume = 1;
let draggedTitle = null;
let globalPlayer = document.createElement("audio");
globalPlayer.setAttribute("crossorigin", "anonymous");
globalPlayer.onended = skip; // When track ends, call skip

const offColor = "#400082";
const onColor = "#a47bff"; // 9869ff
const barColor = "#6c00d3"; // 5500aa, 2f0c53
const exColor = "#111111";
const txtColor = "#999999";
const radius = Math.sqrt(width * width + height * height) / 47;
const logoCenter = {cx: width * .5, cy: height * .25}; // , vx: 1};
const logoRadius = radius * 3.3;
const fontHeight = radius / 3;
const ballFont = fontHeight + "px tahoma";
const barFont = fontHeight + 2 + "px tahoma";
const titleFont = fontHeight * 2 + "px tahoma";

const musicPath = "https://noembryo.github.io/noEmbryoPlayer/audio/";
const imgPath = "https://noembryo.github.io/noEmbryoPlayer/images/";
// const musicPath = "docs/audio/";
// const imgPath = "docs/images/";
const listButton = document.createElement("button");
const listBox = document.createElement("div");
const helpButton = document.createElement("button");
const helpText = document.createElement("div");


// # ___ ___________________  OBJECTS  ______________________________

let Area =
    {
        canvas: document.createElement("canvas"),
        noEmbryo: document.createElement("img"), // 8000ff
        covers: [document.createElement("img"),
            document.createElement("img"),
            document.createElement("img")],
        //timer: setTimeout(function(){}, _delay),
        make: function () {
            this.canvas.width = width;
            this.canvas.height = height;
            this.canvas.onmousedown = function (evt) {
                canvasMouseDown(evt)
            };
            this.canvas.onmouseup = function (evt) {
                canvasMouseUp(evt)
            };
            document.body.insertBefore(this.canvas, document.body.childNodes[0]);
            this.ctx = this.canvas.getContext("2d");
            this.ctx.strokeStyle = barColor;
            this.ctx.lineWidth = radius * .05;
            this.ctx.font = titleFont;
            this.ctx.textBaseline = "top";
            this.ctx.textAlign = "center";
            this.ctx.fillStyle = txtColor;
            let that = this
            let downloadingImage = new Image();
            downloadingImage.onload = function () {
                that.noEmbryo.src = this.src;
                that.basics();
            };
            downloadingImage.src = imgPath + "noembryo.png";
            this.noEmbryo.src = imgPath + "noembryo.png";
            albums.forEach((album, idx) => {
                this.covers[idx].src = imgPath + album + ".png";
            })
            this.basics();
        },

        basics: function () {
            this.ctx.clearRect(0, 0, width, height);
            this.ctx.beginPath();
            this.ctx.arc(logoCenter.cx, logoCenter.cy, logoRadius, 0, 2 * Math.PI);
            this.ctx.stroke();
            this.ctx.drawImage(this.noEmbryo, logoCenter.cx - logoRadius * .65,
                logoCenter.cy - logoRadius * .65,
                logoRadius * 1.3, logoRadius * 1.3);
        },

        update: function () {
            this.basics();
            if (currSinger) {
                this.ctx.fillText(currSinger.title, width * .5, height * .4);
                this.ctx.drawImage(this.covers[cover], width * .5 - logoRadius, height
                    * .6 - logoRadius, logoRadius * 2, logoRadius * 2);
            }
        },
    };


function canvasMouseDown() {
    // touchTimer = setTimeout(startCross, 100)
}

function canvasMouseUp() {
    if (helpText.style.display === "block")
        helpText.style.display = "none";
    if (listBox.style.display === "block")
        listBox.style.display = "none";
    if (touchTimer) {
        clearTimeout(touchTimer);
    }
}

let Progress =
    {
        barCanvas: document.createElement("canvas"),
        numCanvas: document.createElement("canvas"),
        barBody: document.createElement("div"),
        numBody: document.createElement("div"),

        make: function () {
            this.barCanvas.id = "probarcanvas";
            this.barCanvas.width = width * .02;
            this.barCanvas.height = height;
            this.barctx = this.barCanvas.getContext("2d");
            this.barctx.strokeStyle = barColor;
            this.barctx.lineWidth = radius * .05;
            this.barctx.moveTo(this.barCanvas.width * .5, 0);
            this.barctx.lineTo(this.barCanvas.width * .5, height);
            this.barctx.stroke();
            this.barBody.id = "probar";
            this.barBody.style.position = "absolute";
            this.barBody.style.width = width * .02 + "px";
            this.barBody.style.height = height + "px";
            this.barBody.style.left = -width * .01 + "px";
            this.barBody.style.top = 0 + "px";
            this.barBody.appendChild(this.barCanvas);
            document.body.appendChild(this.barBody);
            dragDrop.initElement(this.barBody.id);

            this.numCanvas.id = "pronumcanvas";
            this.numCanvas.width = width * .08;
            this.numCanvas.height = height * .03;
            this.numCtx = this.numCanvas.getContext("2d");
            //this.numCtx.translate(0.5, 0.5); //for aa?
            this.numCtx.font = barFont;
            this.numCtx.textBaseline = "top";
            this.numCtx.textAlign = "center";
            this.numCtx.fillStyle = txtColor;
            this.numBody.id = "pronum";
            this.numBody.style.position = "absolute";
            this.numBody.style.width = width * .08 + "px";
            this.numBody.style.height = height * .03 + "px";
            this.numBody.style.left = -width * .03 + "px";
            this.numBody.style.top = height * .95 + "px";
            this.numBody.appendChild(this.numCanvas);
            document.body.appendChild(this.numBody);
        },

        update: function () {
            this.barBody.style.left = String(Math.round(width * .97
                * globalPlayer.currentTime / globalPlayer.duration) + "px");
            this.numBody.style.left = this.barBody.offsetLeft + this.barCanvas.width * .5
                - this.numCanvas.width * .5 + "px";
            remainTime = globalPlayer.duration - globalPlayer.currentTime;
            elMin = Math.floor(globalPlayer.currentTime / 60);
            elSec = Math.floor(globalPlayer.currentTime % 60);
            reMin = Math.floor(remainTime / 60);
            reSec = Math.floor(remainTime % 60);
            this.numCtx.clearRect(0, 0, width, height);
            this.numCtx.fillText(String(elMin) + this.fix(elSec) + String(elSec)
                + "    " + String(reMin) + this.fix(reSec) + String(reSec),
                this.numCanvas.width * .5, this.numCanvas.height * .3);
        },

        fix: function (sec) {
            if (sec < 10)
                return ":0";
            else
                return ":";
        },

        set: function () {
            if (this.barBody.offsetLeft < -width * .02) this.barBody.style.left = -width * .02 + "px";
            else if (this.barBody.offsetLeft > width * 1.02) this.barBody.style.left = width * 1.02 + "px";
            globalPlayer.currentTime = globalPlayer.duration * this.barBody.offsetLeft / width;
            // if (globalPlayer.paused) playControl();
        }
    };

let Volume =
    {
        canvas: document.createElement("canvas"),
        body: document.createElement("div"),

        make: function () {
            // noinspection JSUnresolvedReference
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

            // Connect globalPlayer to the audio context
            this.source = this.audioCtx.createMediaElementSource(globalPlayer);
            this.source.connect(this.analyser);
            this.analyser.connect(this.gainNode);
            this.gainNode.connect(this.audioCtx.destination);

            this.canvas.id = "volbarcanvas";
            this.canvas.width = width;
            this.canvas.height = width * .1;
            this.ctx = this.canvas.getContext("2d");
            this.ctx.strokeStyle = barColor;
            this.ctx.lineWidth = radius * .05;
            this.ctx.font = barFont;
            this.ctx.textBaseline = "bottom";
            this.ctx.textAlign = "right";
            this.ctx.fillStyle = txtColor;
            this.body.id = "volbar";
            this.body.style.position = "absolute";
            this.body.style.width = width + "px";
            this.body.style.height = width * .02 + "px";
            this.body.style.left = "0px";
            this.body.style.top = height * .05 + "px";
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

            this.ctx.fillText("vol  " + Math.round(volume * 100) + " %",
                Math.round(this.canvas.width * .98),
                Math.round(this.canvas.height * .45));
        },

        update: function () {
            volume = Math.round(((height * .8 - this.body.offsetTop) / height * 1.52) * 100 + 10) / 100;
            if (volume > 1) volume = 1;
            else if (volume < 0) volume = 0;
            this.gainNode.gain.value = volume; // Set gain instead of song.volume
            if (this.body.offsetTop < height * .21) this.body.style.top = height * .21 + "px";
            else if (this.body.offsetTop > height * .87) this.body.style.top = height * .87 + "px";
        },
    };

function Singer(id) {   // Singer object constructor
    this.id = id;
    this.speed = 2;
    this.friction = 0.97;
    this.color = offColor;
    this.selected = false;
    // this.disabled = false;

    this.title = titles[id];
    this.cover = album_ids[id];
    this.album = albums[this.cover];

    this.canvas = document.createElement("canvas");
    this.canvas.id = id;
    this.canvas.width = 2.2 * radius;
    this.canvas.height = 2.2 * radius;
    this.ctx = this.canvas.getContext("2d");

    this.body = document.createElement("div");
    this.body.id = id;
    this.body.singer = this;
    this.body.style.position = "absolute";
    this.body.style.width = 2.2 * radius + "px";
    this.body.style.height = 2.2 * radius + "px";
    this.body.onmousedown = dragDrop.startDragMouse;
    this.body.onclick = function() {
        if (!dragDrop.wasDragged) {
            setCurrent.call(this.singer);
        }
        dragDrop.wasDragged = false; // Reset flag after handling
    };
    this.body.appendChild(this.canvas);
    document.body.appendChild(this.body);
    this.cx = this.body.offsetLeft + radius * 1.1;
    this.cy = this.body.offsetTop + radius * 1.1;

    this.make = function () {
        this.draw();
        this.move();
    };
    // circle
    this.draw = function () {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.beginPath();
        this.ctx.arc(radius * 1.1, radius * 1.1, radius, 0, 2 * Math.PI);
        this.ctx.strokeStyle = this.color;
        this.ctx.fillStyle = 'black';
        this.ctx.save();
        this.ctx.globalAlpha = .5;
        this.ctx.fill();
        this.ctx.restore();
        this.ctx.lineWidth = radius * 0.07;
        this.ctx.stroke();
        this.write();
    };
    // text
    this.write = function () {
        this.ctx.font = ballFont;
        this.ctx.textBaseline = "middle";
        this.ctx.textAlign = "center";
        this.ctx.fillStyle = txtColor;

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
            this.ctx.fillText(this.title.slice(0, closest[1]), radius * 1.1, radius
                * 1.1 - radius * 0.15);
            this.ctx.fillText(this.title.slice(closest[1] + 1), radius * 1.1, radius
                * 1.1 - radius * 0.15 + fontHeight)
        } else
            this.ctx.fillText(this.title, radius * 1.1, radius * 1.1);
    };

    this.move = function () {
        this.vx = (Math.random() * 2 - 1) * this.speed;
        this.vy = (Math.random() * 2 - 1) * this.speed;
    };

    this.isStopped = function() {
        return this.vx === 0 && this.vy === 0;
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

        if (this.cx + radius > width) {
            this.cx = width - radius;
            this.vx *= -1;
        } else if (this.cx - radius < 0) {
            this.cx = radius;
            this.vx *= -1;
        }

        if (this.cy + radius > height) {
            this.cy = height - radius;
            this.vy *= -1;
        } else if (this.cy - radius < 0) {
            this.cy = radius;
            this.vy *= -1;
        }
    };

    this.updateMotion = function () {
        this.cx += this.vx;
        this.cy += this.vy;
        this.body.style.left = Math.round(this.cx - radius * 1.1) + 'px';
        this.body.style.top = Math.round(this.cy - radius * 1.1) + 'px';
    };

    this.toggleSelect = function () {
        this.selected = Boolean(!this.selected);
        if (this.selected)
            this.color = onColor;
        else
            this.color = offColor;
        this.draw()
    };
}

function createHelpButton() {
    // Create the help button
    helpButton.setAttribute("title", "Help");
    helpButton.setAttribute("aria-label", "Show help information");

    // Style the button with the image
    helpButton.style.position = "fixed";
    helpButton.style.top = "10px";
    helpButton.style.left = "60px";
    helpButton.style.width = "40px";  // Match your image’s width
    helpButton.style.height = "40px"; // Match your image’s height
    helpButton.style.borderRadius = "50%"; // Keeps it round if the image has transparency
    helpButton.style.backgroundColor = "rgba(0, 0, 0, 0.1)";
    helpButton.style.backgroundImage = `url('${imgPath}help_btn.png')`; // Path to your image
    helpButton.style.backgroundSize = "cover"; // Ensures the image fills the button
    helpButton.style.backgroundPosition = "center"; // Centers the image
    helpButton.style.border = "none"; // No border, assuming the image defines it
    helpButton.style.cursor = "pointer"; // Hand cursor on hover
    helpButton.style.zIndex = "1000"; // Ensures it stays on top

    // Create the help text container
    helpText.innerHTML = `<p>Click a ball to play or pause a song.</br>
        Arrow keys to adjust volume or seek.</br>
        Ctrl + Left/Right arrow keys to skip.</br>
        The Space key toggles play/pause.</br>
        Drag a ball to move or stop it.
        </p>`;
    helpText.style.display = "none";

    // Style the help text
    helpText.style.position = "fixed";
    helpText.style.top = "40px";
    helpText.style.left = "10px";
    helpText.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    helpText.style.color = "#808080";
    // helpText.style.padding = "10px";
    // helpText.style.borderRadius = "5px";
    helpText.style.maxWidth = "280px";
    helpText.style.zIndex = "1000";
    // helpText.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.3)";

    // Toggle help text visibility on button click
    helpButton.addEventListener("click", () => {
    if (listBox.style.display === "block")
        listBox.style.display = "none";
        helpText.style.display = helpText.style.display === "none" ? "block" : "none";
    });

    // Append elements to the DOM
    document.body.appendChild(helpButton);
    document.body.appendChild(helpText);
}

// # ___ ___________________  PLAYLIST  _____________________________

function createListButton() {
    listButton.setAttribute("title", "Playlist");
    listButton.setAttribute("aria-label", "Show the Player's Playlist");

    listButton.style.position = "fixed";
    listButton.style.top = "10px";
    listButton.style.left = "10px";
    listButton.style.width = "40px";  // Match your image’s width
    listButton.style.height = "40px"; // Match your image’s height
    listButton.style.borderRadius = "20%"; // Keeps it round if the image has transparency
    listButton.style.backgroundColor = "rgba(0, 0, 0, 0.1)";
    listButton.style.backgroundImage = `url('${imgPath}list_btn.png')`; // Path to your image
    listButton.style.backgroundSize = "cover"; // Ensures the image fills the button
    listButton.style.backgroundPosition = "center"; // Centers the image
    listButton.style.border = "none"; // No border, assuming the image defines it
    listButton.style.cursor = "pointer"; // Hand cursor on hover
    listButton.style.zIndex = "1000"; // Ensures it stays on top

    listBox.id = "listBox";  // Ensure the id matches the CSS selector
    listBox.style.position = "fixed";
    listBox.style.top = "50px";
    listBox.style.left = "10px";
    listBox.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    listBox.style.color = "#808080";
    // listBox.style.maxWidth = "200px";
    listBox.style.zIndex = "1000";
    listBox.style.maxHeight = (height - 70) + "px"; // Leave space for button and padding
    listBox.style.overflowY = "auto"; // Enable vertical scrolling
    // listBox.style.padding = "10px"; // Add padding for aesthetics
    // listBox.style.borderRadius = "5px";
    listBox.style.display = "none";

    // Toggle help text visibility on button click
    listButton.addEventListener("click", () => {
        if (listBox.style.display === "none" || !listBox.children.length) {
            createListBox(); // Populate list on first open or if empty
            updateListBox(); // Highlight active track
        }
        if (helpText.style.display === "block")
            helpText.style.display = "none";
        listBox.style.display = listBox.style.display === "none" ? "block" : "none";
    });

    document.body.appendChild(listButton);
    document.body.appendChild(listBox);
}

function createListBox() {
    listBox.innerHTML = ''; // Clear existing content

    // Add controls div with buttons
    const controlsDiv = document.createElement('div');
    controlsDiv.style.marginBottom = '10px';
    const sortButton = document.createElement('button');
    sortButton.textContent = 'Albums';
    sortButton.addEventListener('click', sortByAlbum);
    controlsDiv.appendChild(sortButton);
    const shuffleButton = document.createElement('button');
    shuffleButton.textContent = 'Shuffle';
    shuffleButton.addEventListener('click', shuffleList);
    controlsDiv.appendChild(shuffleButton);
    listBox.appendChild(controlsDiv);

    // Create the track list (ul)
    const ul = document.createElement('ul');
    ul.style.listStyle = "none";
    ul.style.padding = "0";
    ul.style.margin = "0";

    if (isSortedByAlbum) {
        let previousAlbum = null;
            singers.forEach((singer, index) => {
                if (isSortedByAlbum && singer.album !== previousAlbum) {
                    const albumLi = document.createElement('li');
                    albumLi.classList.add('album-label');
                    albumLi.textContent = singer.album;
                    albumLi.addEventListener('click', () => toggleAlbumTracks(singer.album));
                    ul.appendChild(albumLi);
                    previousAlbum = singer.album;
                }

                const li = createSingerListItem(singer, index);
                ul.appendChild(li);
            });
    }
    listBox.appendChild(ul);
    updateListBox(); // Assuming this refreshes the list
}

function createSingerListItem(singer, index) {
    const li = document.createElement('li');
    // noinspection JSValidateTypes
    li.dataset.index = index;
    li.draggable = true;
    li.style.padding = "1px";
    li.style.cursor = "pointer";
    li.style.display = "flex"; // Align image and text horizontally
    li.style.alignItems = "center"; // Center vertically

    // Add custom image
    const stateImg = document.createElement('img');
    stateImg.src = singer.disabled ? `${imgPath}radio_unchecked.png` : `${imgPath}radio_checked.png`;
    stateImg.style.width = "16px";
    stateImg.style.height = "16px";
    stateImg.style.marginRight = "8px"; // Space between image and text
    stateImg.style.cursor = "pointer"; // Indicate clickable
    stateImg.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent li click handler from firing
        if (singer === currSinger && !singer.disabled) {
            return; // Prevent disabling the current track
        }
        singer.disabled = !singer.disabled;
        stateImg.src = singer.disabled ? `${imgPath}radio_unchecked.png` : `${imgPath}radio_checked.png`;
        updateSingerState(singer);
    });
    li.appendChild(stateImg);

    // Add track title
    const trackSpan = document.createElement('span');
    trackSpan.textContent = singer.title;
    li.appendChild(trackSpan);

    // Click handler for selecting track
    li.addEventListener('click', (e) => {
        if (e.target !== stateImg) {
            setCurrent.call(singer);
        }
    });

    // Dragging event listeners
    li.addEventListener('dragstart', handleDragStart);
    li.addEventListener('dragover', handleDragOver);
    li.addEventListener('drop', handleDrop);
    li.addEventListener('dragend', handleDragEnd);

    // Apply disabled styling
    if (singer.disabled) {
        li.classList.add('disabled');
    }

    return li;
}

function updateListBox() {
    const listItems = listBox.querySelectorAll('li');
    let activeItem = null;

    // Highlight the active track and find its <li> element
    listItems.forEach(li => {
        const index = parseInt(li.dataset.index);
        if (singers[index] === currSinger) {
            li.classList.add('active');
            activeItem = li;  // Store the active <li> for scrolling
        } else {
            li.classList.remove('active');
        }
    });

    // Scroll to the active track if it exists
    if (activeItem) {
        activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

function handleDragStart(e) {
    draggedTitle = this;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
    this.style.opacity = '0.4'; // Visual feedback during drag
}

function handleDragOver(e) {
    e.preventDefault(); // Required to allow dropping
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDrop(_) {
    if (draggedTitle !== this) {
        const draggedIndex = parseInt(draggedTitle.dataset.index);
        const targetIndex = parseInt(this.dataset.index);

        // Reorder the singers array
        const [movedSinger] = singers.splice(draggedIndex, 1); // Remove from old position
        singers.splice(targetIndex, 0, movedSinger); // Insert at new position
        isSortedByAlbum = false; // Set flag to false

        // Update dataset indices by re-rendering
        createListBox();

        // Update currentTrack reference if necessary
        if (currSinger) {
            const newCurrentIndex = singers.indexOf(currSinger);
            if (newCurrentIndex === -1) {
                console.error('Current singer lost during reorder');
            }
            // Note: currSinger remains the same object; no need to update playback
        }
    }
    return false;
}

function handleDragEnd() {
    this.style.opacity = '1'; // Reset opacity
    draggedTitle = null;
}

function toggleAlbumTracks(album) {
    const albumSingers = singers.filter(s => s.album === album);
    const allDisabled = albumSingers.every(s => s.disabled);
    if (allDisabled) {
        // Enable all tracks
        albumSingers.forEach(s => {
            s.disabled = false;
            updateSingerState(s);
        });
    } else {
        // Disable all tracks
        albumSingers.forEach(s => {
            s.disabled = true;
            updateSingerState(s);
        });
        // If current track is disabled, skip to next enabled track
        if (currSinger && albumSingers.includes(currSinger)) {
            skip();
        }
    }
    updateListBox();
}

function sortByAlbum() {
    singers.sort((a, b) => {
        if (a.cover !== b.cover) {
            return a.cover - b.cover; // Sort by album number
        } else {
            return a.id - b.id; // Within album, sort by original order
        }
    });
    isSortedByAlbum = true; // Set flag to true
    createListBox();
    updateListBox();
}

function shuffleList() {
    singers.sort(() => Math.random() - 0.5);
    isSortedByAlbum = false; // Set flag to false
    createListBox();
    updateListBox();
}

function updateSingerState(singer) {
    const index = singers.indexOf(singer);
    const li = listBox.querySelector(`li[data-index="${index}"]`);
    const stateImg = li.querySelector('img');

    if (singer.disabled) {
        li.classList.add('disabled');
        singer.color = '#111111'; // Gray for disabled ball
        stateImg.src = `${imgPath}radio_unchecked.png`;
    } else {
        li.classList.remove('disabled');
        singer.color = '#400082'; // Default color
        stateImg.src = `${imgPath}radio_checked.png`;
    }
    singer.draw(); // Redraw the ball
}

// # ___ _________________  DRAG & DROP BALLS  ______________________

let dragDrop =
    {   // Drag and drop object by Peter-Paul Koch
        initialMouseX: undefined,
        initialMouseY: undefined,
        startX: undefined,
        startY: undefined,
        draggedObject: undefined,
        wasDragged: false,
        startTime: 0,
        recentMovements: [],

        initElement: function (element) {
            if (typeof element == 'string')
                element = document.getElementById(element);
            element.onmousedown = dragDrop.startDragMouse;
        },
        startDragMouse: function (e) {
            if (!isNaN(parseInt(this.id)) || this.id === "volbar" || (this.id === "probar" && currSinger)) {
                dragDrop.startDrag(this);
                // noinspection JSDeprecatedSymbols
                let evt = e || window.event;
                dragDrop.initialMouseX = evt.clientX;
                dragDrop.initialMouseY = evt.clientY;
                dragDrop.startTime = Date.now();         // Initialize start time
                dragDrop.recentMovements = [];           // Reset movement history

                document.addEventListener('mousemove', dragDrop.dragMouse, false);
                document.addEventListener('mouseup', dragDrop.releaseElement, false);
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
            // noinspection JSDeprecatedSymbols
            let evt = e || window.event;
            let dX = evt.clientX - dragDrop.initialMouseX;
            let dY = evt.clientY - dragDrop.initialMouseY;
            dragDrop.setPosition(dX, dY);

            // Record the current mouse position and timestamp
            dragDrop.recentMovements.push({
                x: evt.clientX,
                y: evt.clientY,
                time: Date.now()
            });
            // Keep only the last 3 movements to track recent activity
            if (dragDrop.recentMovements.length > 3) {
                dragDrop.recentMovements.shift();
            }
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
            // noinspection JSDeprecatedSymbols
            let evt = e || window.event;
            let dx = evt.clientX - dragDrop.initialMouseX;
            let dy = evt.clientY - dragDrop.initialMouseY;
            let distance = Math.sqrt(dx * dx + dy * dy);
            dragDrop.wasDragged = distance > 5;

            document.removeEventListener('mousemove', dragDrop.dragMouse, false);
            document.removeEventListener('mouseup', dragDrop.releaseElement, false);
            dragDrop.draggedObject.className =
                dragDrop.draggedObject.className.replace(/dragged/, '');

            if (dragDrop.draggedObject.singer) {
                dragDrop.draggedObject.singer.cx = dragDrop.draggedObject.offsetLeft + radius * 1.1;
                dragDrop.draggedObject.singer.cy = dragDrop.draggedObject.offsetTop + radius * 1.1;

                let duration = (Date.now() - dragDrop.startTime) / 1000; // Duration in seconds

                if (duration < 0.2 && distance < 5) {
                    // Quick click: Do not change velocity (playback toggled by onclick)
                } else if (dragDrop.recentMovements.length >= 2) {
                    // Analyze recent movements
                    let xs = dragDrop.recentMovements.map(m => m.x);
                    let ys = dragDrop.recentMovements.map(m => m.y);
                    let meanX = xs.reduce((a, b) => a + b, 0) / xs.length;
                    let meanY = ys.reduce((a, b) => a + b, 0) / ys.length;
                    let varX = xs.reduce((a, b) => a + (b - meanX) ** 2, 0) / xs.length;
                    let varY = ys.reduce((a, b) => a + (b - meanY) ** 2, 0) / ys.length;

                    if (varX < 1 && varY < 1) {
                        // Mouse was stationary: Set velocity to 0
                        dragDrop.draggedObject.singer.vx = 0;
                        dragDrop.draggedObject.singer.vy = 0;
                    } else {
                        // Mouse was moving: Calculate velocity from last two points
                        let p1 = dragDrop.recentMovements[dragDrop.recentMovements.length - 2];
                        let p2 = dragDrop.recentMovements[dragDrop.recentMovements.length - 1];
                        let dt = (p2.time - p1.time) / 1000; // Time difference in seconds
                        if (dt > 0) {
                            let vx = (p2.x - p1.x) / dt / 60; // Velocity per frame (assuming 60 fps)
                            let vy = (p2.y - p1.y) / dt / 60;
                            dragDrop.draggedObject.singer.vx = vx;
                            dragDrop.draggedObject.singer.vy = vy;

                            // Cap velocity to prevent excessive speed
                            let max_v = 5;
                            let v_mag = Math.sqrt(vx * vx + vy * vy);
                            if (v_mag > max_v) {
                                dragDrop.draggedObject.singer.vx = vx / v_mag * max_v;
                                dragDrop.draggedObject.singer.vy = vy / v_mag * max_v;
                            }
                        }
                    }
                } else {
                    // Insufficient movement data (e.g., very short hold): Set velocity to 0
                    dragDrop.draggedObject.singer.vx = 0;
                    dragDrop.draggedObject.singer.vy = 0;
                }
            }

            dragDrop.draggedObject = null;
        }
    };

// # ___ ___________________  SETUP  ________________________________

function startApp() {
    Area.make();
    Volume.make();

    let ids_list = Array.from({length: titles.length},
        (_, i) => i); // Sort by album
    // ids_list.sort(() => Math.random() - 0.5); // shuffle
    ids_list.forEach(idx => create_singer(idx));
    sortByAlbum();
    setTimeout(() => Area.basics(), 1000);

    window.onkeydown = function (event) {
        keyStart(event)
    };
    window.onkeyup = function (event) {
        keyEnd(event)
    };
    embryoLoop()
    createListButton()
    createHelpButton();


    // Add styles for active state
    const style = document.createElement('style');
    style.textContent = `
        #listBox li {
            padding: 5px;
        }
        #listBox li.active {
            font-weight: bold;
            text-decoration: underline;
        }
        // #listBox li:hover {
        //     text-decoration: underline;
        // }
        #listBox li.disabled {
            color: gray;
            text-decoration: line-through;
        }
        #listBox button {
            margin-right: 10px;
            padding: 5px 10px;
            background-color: #333;
            color: #fff;
            border: none;
            cursor: pointer;
        }
        #listBox li img {
            vertical-align: middle;
            transition: opacity 0.2s; /* Smooth toggle effect */
        }
        #listBox li.disabled img {
            opacity: 0.5; /* Dim disabled state */
        }
        #listBox li.album-label {
            font-weight: bold;
            // padding: 10px 5px;
            cursor: pointer;
        }
    `;
    document.head.appendChild(style);
}

function calcLaunch() { // puts ball in random unoccupied place
    let point = {x: Math.random() * width, y: Math.random() * height};

    if ((point.x + radius > width * .5 - logoRadius && point.x - radius
            < width * .5 + logoRadius)
        || (point.y + radius > height * .5 - logoRadius && point.y - radius
            < height * .5 + logoRadius))
        calcLaunch();
    else
        launchPoint = point;
}

function create_singer(id) {
    if (!singers[id]) {
        calcLaunch();
        let singer = new Singer(id);
        singer.cx = launchPoint.x;
        singer.cy = launchPoint.y;
        singer.make();
        singers[id] = singer;
        // singers.unshift(singer); // put new singer at the top
        // singers.push(singer); // put new singer at the end
    }
}

// # ___ ___________________  PLAYER'S  _____________________________

function playControl(stop) {
    if (stop) {
        globalPlayer.pause();
        globalPlayer.currentTime = 0;
    } else if (globalPlayer.paused) {
        globalPlayer.play().then(_ => {
            // console.log(`Playing "${currSinger.title}"`);
        });
    } else {
        globalPlayer.pause();
    }
}

function setCurrent() {
    // let singer = _singers[this.id];
    // let singer = this;
    if (this.disabled) {
        this.color = offColor;
        this.draw();
        this.disabled = false;
        return; // Exit if track is disabled
    }
    if (currSinger) {
        if (currSinger === this) {
            playControl();
            updateListBox(); // Update on play/pause toggle
            return;
        } else {
            currSinger.toggleSelect();
            globalPlayer.pause();
            globalPlayer.currentTime = 0;
        }
    } else {
        Progress.make();
    }
    this.toggleSelect();
    currSinger = this;

    // Resume AudioContext if suspended
    if (Volume.audioCtx.state === 'suspended') {
        Volume.audioCtx.resume().then(() => {
            // console.log('AudioContext resumed');
        });
    }

    globalPlayer.src = musicPath + this.title + ".mp3";
    globalPlayer.load(); // Ensure the new source is loaded

    // Try to play immediately within the click handler
    let playPromise = globalPlayer.play();
    if (playPromise !== undefined) {
        playPromise.then(() => {
            // console.log(`Autoplay started, playing "${currSinger.title}"`);
        }).catch(error => {
            console.log('Autoplay failed:', error);
            // Fallback: play when audio is ready
            globalPlayer.oncanplaythrough = function() {
                globalPlayer.play().then(_ => {
                    // console.log(`Playing "${currSinger.title}"`);
                });
                globalPlayer.oncanplaythrough = null; // Prevent multiple triggers
            };
        });
    }

    cover = this.cover;
    // singers.splice(singers.indexOf(singer), 1);
    // singers.push(singer);
    Area.update();
    updateListBox(); // Update when switching tracks
}

function skip(prev = false) {
    if (currSinger) {
        let currentIndex = singers.indexOf(currSinger);
        prev = typeof prev === 'boolean' ? prev : false;
        let step = prev ? -1 : 1;
        let nextIndex = (currentIndex + step + singers.length) % singers.length;

        // Loop until an enabled track is found
        while (singers[nextIndex].disabled) {
            nextIndex = (nextIndex + step + singers.length) % singers.length;
            if (nextIndex === currentIndex) {
                // All tracks disabled: stop playback
                playControl(true);
                currSinger.toggleSelect();
                currSinger = null;
                Area.update();
                return;
            }
        }
        setCurrent.call(singers[nextIndex]);
    } else {
        // Find first enabled track
        for (let singer of singers) {
            if (!singer.disabled) {
                setCurrent.call(singer);
                break;
            }
        }
    }
}

// # ___ ___________________  EVENTS  _______________________________

function embryoLoop() {
    let i, j, singer, other, dx, dy, dist, minDist, pointOfContactX,
        pointOfContactY, courseCorrectionX, courseCorrectionY;
    let l = singers.length;

    for (i = 0; i < l; i++) {
        if (!singers[i]) continue; // Skip if singer does not exist
        singer = singers[i];

        for (j = i + 1; j < l; j++) {
            if (!singers[j]) continue; // Skip if other does not exist
            other = singers[j];

            // Calculate distance between ball centers
            dx = other.cx - singer.cx;
            dy = other.cy - singer.cy;
            dist = Math.sqrt(dx * dx + dy * dy);
            minDist = radius * 2; // Assuming _radius is the ball radius

            // Check for collision
            if (dist < minDist) {
                // Calculate point of contact and correction vector
                pointOfContactX = singer.cx + (dx / dist) * minDist;
                pointOfContactY = singer.cy + (dy / dist) * minDist;
                courseCorrectionX = pointOfContactX - other.cx;
                courseCorrectionY = pointOfContactY - other.cy;

                // Handle collision based on ball states
                if (singer.isStopped() && other.isStopped()) {
                    // Both stopped: do nothing
                    // continue;
                } else if (singer.isStopped()) {
                    // Singer stopped, other moving: bounce other off singer
                    other.vx += courseCorrectionX * 2;
                    other.vy += courseCorrectionY * 2;
                } else if (other.isStopped()) {
                    // Other stopped, singer moving: bounce singer off other
                    singer.vx -= courseCorrectionX * 2;
                    singer.vy -= courseCorrectionY * 2;
                } else {
                    // Both moving: bounce both off each other
                    singer.vx -= courseCorrectionX;
                    singer.vy -= courseCorrectionY;
                    other.vx += courseCorrectionX;
                    other.vy += courseCorrectionY;
                }
            }
        }
        singer.update(); // Update position based on velocity
    }

    if (proDragged || Progress.barBody.className === "dragged") {
            Progress.numBody.style.visibility = "hidden";
            proFlag = true;
        } else if (proFlag) {
            proFlag = false;
            Progress.set();
            Progress.numBody.style.visibility = "visible";
        } else if (currSinger && !globalPlayer.paused)
            Progress.update();

    if (volDragged || Volume.body.className === "dragged")
        Volume.update();

    // if (currSinger)
    Volume.draw();

    loop = window.requestAnimationFrame(embryoLoop);
}

function keyStart(evt) {
    let keycode = evt.key || evt.keyCode;
    if (evt.defaultPrevented) return;
    if ((keycode === "Escape")) {
        helpText.style.display = "none";
        listBox.style.display = "none";
        evt.preventDefault();
    } else if (keycode === "ArrowUp" || keycode === 38) {
        if (volume < 1) {
            volDragged = true;
            Volume.body.style.top = Volume.body.offsetTop - 10 + "px";
            evt.preventDefault();
        }
    } else if (keycode === "ArrowDown" || keycode === 40) {
        if (volume > 0) {
            volDragged = true;
            Volume.body.style.top = Volume.body.offsetTop + 10 + "px";
            evt.preventDefault();
        }
    } else if (currSinger) {
        if (keycode === "ArrowRight" || keycode === 39) {
            if (evt.ctrlKey) skip();
            else if (globalPlayer.currentTime < globalPlayer.duration) {
                proDragged = true;
                Progress.barBody.style.left = Progress.barBody.offsetLeft + 50 + "px";
            }
            evt.preventDefault();
        } else if (keycode === "ArrowLeft" || keycode === 37) {
            if (evt.ctrlKey) skip(true);
            else if (globalPlayer.currentTime > 0) {
                proDragged = true;
                Progress.barBody.style.left = Progress.barBody.offsetLeft - 30 + "px";
            }
            evt.preventDefault();
        } else if (keycode === " " || keycode === 32) {
            playControl();
            evt.preventDefault();
        }
    } else if ((keycode === " " || keycode === 32) && singers) {
        skip();
        evt.preventDefault();
    } else {
        volDragged = false;
    }
}

function keyEnd(evt) {
    let keycode = evt.key || evt.keyCode;

    if (evt.defaultPrevented)
        return; // Should do nothing if the key event was already consumed.

    if (keycode === "ArrowRight" || keycode === 39 ||
        keycode === "ArrowLeft" || keycode === 37) {
        proDragged = false;
        evt.preventDefault();
    } else if (keycode === "ArrowUp" || keycode === 38 ||
        keycode === "ArrowDown" || keycode === 40) {
        volDragged = false;
        evt.preventDefault();
    }
}

// noinspection JSUnusedGlobalSymbols
function startCross() {
    touchTimer = 0;

    const length = singers.length;

    let i;
    for (i = 0; i < length; i++)
        singers[i].body.addEventListener('mouseenter', exclude, false);

    document.addEventListener('mouseup', endCross, false);
    return true
}

function endCross() {
    const length = singers.length;

    let i;
    for (i = 0; i < length; i++)
        singers[i].body.removeEventListener('mouseenter', exclude, false);
    document.removeEventListener('mouseup', endCross, false);
}

function exclude() {
    if (this.singer !== currSinger) {
        this.singer.color = exColor;
        this.singer.draw();
        // singers.splice(singers.indexOf(this.singer), 1);
        this.singer.disabled = true;
    }
    this.removeEventListener('mouseenter', exclude, false);
}
