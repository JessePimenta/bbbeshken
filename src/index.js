import domready from 'domready';
import { Vector2, Vector3 } from 'three';
import AlbumVisual from './AlbumVisual.js';
import SCPlayer from './SCPlayer.js';
import DOMUtils from './DOMUtils.js';

let container;
let trackImagePaths;
let albumVisual;
let scPlayer;
let renderSize;
let mouse;
let controlsExpanded = true;
let started = false;
let paused = false;

function setup() {
  container = document.getElementById('album-container');
  renderSize = new Vector2(container.clientWidth, container.clientHeight);
  addListeners();

  trackImagePaths = [
    'src/images/album/2. The Roman Call.jpg',
    'src/images/album/3. Lightning By The Sea.jpg',
    'src/images/album/4. Fantom Pain.jpg',
    'src/images/album/5. Nina.jpg',
    'src/images/album/6. Force Of Evil.jpg',
    'src/images/album/7. Purlieu.jpg',
  ];

  albumVisual = new AlbumVisual(trackImagePaths, container);
  albumVisual.sceneSetup();
  albumVisual.setupBuffers();
  albumVisual.update();


  scPlayer = new SCPlayer('83f4f6ade6ed22a7213d4441feea15f6',
                           updateImageTextureForTrack,
                           onPlayStatusChanged,
                           'https://soundcloud.com/beshkenmusic/sets/for-time-is-the-longest');
}

function addListeners() {
  document.onmousemove = onMouseMove;
  document.onmousedown = onMouseDown;
  document.onmouseup = onMouseUp;
  window.onresize = onResize;

  document.getElementById('player-controls').onclick = showPlayerControls;
  document.getElementById('close').onclick = hidePlayerControls;
  document.getElementById('info').onclick = flipToInfo;
  document.getElementById('unflip').onclick = flipToControls;
  document.querySelector('.player-controls-container').onmousedown = preventClickThroughControls;
}

function flipToInfo(event) {
  DOMUtils.addClass(document.querySelector('.player-controls'), 'flip');
}

function flipToControls(event) {
  DOMUtils.removeClass(document.querySelector('.player-controls'), 'flip');
}

function onMouseMove(event) {
  if (!mouse) mouse = new Vector3(0);
  event.preventDefault();
  mouse.x = (event.clientX / renderSize.x) * 2 - 1;
  mouse.y = -(event.clientY / renderSize.y) * 2 + 1;
  albumVisual.updateMouse(mouse);
}

function onMouseDown(event) {
  if (!isRightMouseButton(event)) {
    event.preventDefault();
    if (event.target)
    mouse.z = 1.0;
    albumVisual.updateMouse(mouse);
  }
}

function isRightMouseButton(event) {
  return event.which == 3 || event.button == 2;
}

function onMouseUp(event) {
    event.preventDefault();
    mouse.z = 0.0;
    albumVisual.updateMouse(mouse);
}

function onResize(event) {
  renderSize = new Vector2(container.clientWidth, container.clientHeight);
  albumVisual.updateRenderSize(renderSize);
}

function showPlayerControls(event) {
  if (DOMUtils.hasClass(event.target, 'player-controls')) {
    event.preventDefault();
    event.stopPropagation();
    let playerContainer = document.querySelector('.player-controls-container');
    if (!DOMUtils.hasClass(playerContainer, 'expanded')) {
      controlsExpanded = true;
      DOMUtils.addClass(playerContainer, 'expanded');
    }
  }
}

function hidePlayerControls(event) {
  let playerContainer = document.querySelector('.player-controls-container');
  let albumCover = document.querySelector('.album-cover');
  if (!started) {
    started = true;
    scPlayer.init();
    DOMUtils.addClass(albumCover, 'hidden');
    setTimeout(function() {
      DOMUtils.removeClass(playerContainer, 'not-started');
    }, 500);
  }

  if (DOMUtils.hasClass(playerContainer, 'expanded')) {
    controlsExpanded = false;
    DOMUtils.removeClass(playerContainer, 'expanded');
  }
}

function preventClickThroughControls(event) {
  if (controlsExpanded) {
    event.stopPropagation();
  }
}

function updateImageTextureForTrack(trackIndex, trackTitle) {
  if (!trackImagePaths[trackIndex]) return;
  albumVisual.onTrackChanged(trackIndex);
  setTrackTitle(trackTitle);
}

function onPlayStatusChanged(playing) {
  if (playing) {
    albumVisual.paused = false;
  } else {
    albumVisual.paused = true;
  }
}

function setTrackTitle(title) {
  document.querySelector('.track-name span').textContent = title;
}

domready(function () {
  setup();
})
