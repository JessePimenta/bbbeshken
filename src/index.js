import domready from 'domready';
import { Vector2, Vector3 } from 'three';
import AlbumVisual from './AlbumVisual.js';
import SCPlayer from './SCPlayer.js';

let container;
let trackImagePaths;
let albumVisual;
let scPlayer;
let renderSize;
let mouse;

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
                           'https://soundcloud.com/beshkenmusic/sets/for-time-is-the-longest-distance-between-two-places/s-KqrgS',
                           's-KqrgS');
}

function addListeners() {
  document.onmousemove = onMouseMove;
  document.onmousedown = onMouseDown;
  document.onmouseup = onMouseUp;
  window.onresize = onResize;
}

function onMouseMove(event) {
  if (!mouse) mouse = new Vector3(0);
  event.preventDefault();
  mouse.x = (event.clientX / renderSize.x) * 2 - 1;
  mouse.y = -(event.clientY / renderSize.y) * 2 + 1;
  albumVisual.updateMouse(mouse);
}

function onMouseDown(event) {
  event.preventDefault();
  mouse.z = 1.0;
  albumVisual.updateMouse(mouse);
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

function updateImageTextureForTrack(trackIndex, player) {
  if (!trackImagePaths[trackIndex]) return;
  albumVisual.onTrackChanged(trackIndex);
}

domready(function () {
  setup();
  scPlayer = new SCPlayer('83f4f6ade6ed22a7213d4441feea15f6',
                           updateImageTextureForTrack,
                           'https://soundcloud.com/beshkenmusic/sets/for-time-is-the-longest-distance-between-two-places/s-KqrgS',
                           's-KqrgS');
  scPlayer.init();
})
