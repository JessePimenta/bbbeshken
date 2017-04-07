import * as THREE from 'three';
import * as shaders from './shaders.js';
import glsl from 'glslify';
import domready from 'domready';
import SCPlayer from './scPlayer.js';
import RenderBuffer from './RenderBuffer.js';

let scene;
let camera;
let renderSize;
let renderer;
let clock;
let mouse;
let images;
let scPlayer;

function sceneSetup(){

  let imageFiles = [
    'src/images/album/2. The Roman Call.jpg',
    'src/images/album/3. Lightning By The Sea.jpg',
    'src/images/album/4. Fantom Pain.jpg',
    'src/images/album/5. Nina.jpg',
    'src/images/album/6. Force Of Evil.jpg',
    'src/images/album/7. Purlieu.jpg',
  ];

  images = [];
  let loader = new THREE.TextureLoader();
  for (let imageFile of imageFiles) {
    let image = loader.load(imageFile);
    images.push(image);
  }

  //This is the basic scene setup
  scene = new THREE.Scene();
  let width = window.innerWidth;
  let height = window.innerHeight;

  clock = new THREE.Clock();

  mouse = new THREE.Vector3(0.0, 0.0, 0.0);
  document.onmousemove = onMouseMove;
  document.onmousedown = onMouseDown;
  document.onmouseup = onMouseUp;

  //Note that we're using an orthographic camera here rather than a prespective
  camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 1, 1000 );
  camera.position.z = 2;

  renderer = new THREE.WebGLRenderer({
    preserveDrawingBuffer: true,
    antialias: true,
    alpha: true
  });
  renderer.setSize( width, height );
  let frame = document.getElementById("frame");
  frame.appendChild(renderer.domElement);
  // document.body.appendChild( renderer.domElement );
}

function setRenderSize() {
  let frame = document.getElementById("frame");
  renderSize = new Vector2(frame.innerWidth, frame.innerHeight);
}

function onMouseMove(event) {
  event.preventDefault();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onMouseDown(event) {
  event.preventDefault();
  mouse.z = 1.0;
}

function onMouseUp(event) {
  event.preventDefault();
  mouse.z = 0.0;
}

let fragmentShader = shaders.main;
let fragmentShader2 = shaders.final;
let gaussianBlurHorizontal = shaders.gaussianHorizontal;
let gaussianBlurVertical = shaders.gaussianVertical;

let vertexShader = glsl`
precision highp float;
varying vec2 vUv;
void main()
{
  vUv = uv;

  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0 );
  gl_Position = projectionMatrix * mvPosition;
}
`

let bufferScene;
let bufferScene2;
let bufferScene3;
let textureA;
let textureB;
let textureC;
let textureD;
let bufferMaterial;
let bufferMaterial2;
let bufferMaterial3;
let plane;
let bufferObject;
let bufferObject2;
let bufferObject3;
let finalMaterial;
let quad;
let uniforms;

let gaussianPassHorizontal;
let gaussianPassVertical;
let finalPass;

function bufferTextureSetup(image){
  // Create buffer scene
  bufferScene = new THREE.Scene();

  // //Create 2 buffer textures
  textureA = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });
  textureB = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });
  textureA.type = THREE.FloatType;
  textureB.type = THREE.FloatType;

  // let imageTexture = THREE.ImageUtils.loadTexture( "./src/images/ali_knockout.jpg" );
  // imageTexture.wrapS = THREE.RepeatWrapping;
  // imageTexture.wrapT = THREE.RepeatWrapping;
  let imageTexture = images[0];

  uniforms = {
    iChannel0: { type: "t", value: textureA.texture },
    iChannel1: { type: "t", value: imageTexture },
    iFrame: {type: "i", value: 0 },
    iGlobalTime: { type: "f", value: 0.0},
    iResolution: { type: "v2", value: new THREE.Vector2(window.innerWidth,window.innerHeight) },
    iMouse: {type: "v3", value: mouse}
  }

  //Pass textureA to shader
  bufferMaterial = new THREE.ShaderMaterial( {
    uniforms: uniforms,
    fragmentShader: fragmentShader,
    vertexShader: vertexShader
  } );

  plane = new THREE.PlaneBufferGeometry( window.innerWidth, window.innerHeight );
  bufferObject = new THREE.Mesh( plane, bufferMaterial );
  bufferScene.add(bufferObject);

  gaussianPassHorizontal = new RenderBuffer(renderer, gaussianBlurHorizontal, vertexShader, [textureB.texture], new THREE.Vector2(window.innerWidth, window.innerHeight));
  gaussianPassHorizontal.init();

  gaussianPassVertical = new RenderBuffer(renderer, gaussianBlurVertical, vertexShader, [gaussianPassHorizontal.getTexture()], new THREE.Vector2(window.innerWidth, window.innerHeight));
  gaussianPassVertical.init();

  finalPass = new RenderBuffer(renderer, fragmentShader2, vertexShader, [gaussianPassVertical.getTexture(), imageTexture], new THREE.Vector2(window.innerWidth, window.innerHeight));
  finalPass.init();
}

let startShader = false;

function update () {
  // Schedule the next frame.
  requestAnimationFrame(update);

  // Draw to textureB to bufferScene
  renderer.render(bufferScene,camera,textureB,true);

  // Swap textureA and B
  var t = textureA;
  textureA = textureB;
  textureB = t;
  bufferMaterial.uniforms.iChannel0.value = textureA.texture;

  if (startShader) bufferMaterial.uniforms.iFrame.value += 1;
  bufferMaterial.uniforms.iGlobalTime.value = window.performance.now() / 1000;
  bufferMaterial.uniforms.iMouse.value = mouse;
  finalPass.updateUniforms({iMouse: {type: 'v3', value: mouse}});
  gaussianPassHorizontal.renderToBuffer();
  gaussianPassVertical.renderToBuffer();
  finalPass.renderToScreen();
}

function updateImageTextureForTrack(trackIndex, player) {
  if (!images[trackIndex]) return;
  startShader = true;
  bufferMaterial.uniforms.iFrame.value = 0;
  bufferMaterial.uniforms.iChannel1.value = images[trackIndex];
  finalPass.updateUniforms({iChannel1: {type: 't', value: images[trackIndex]}});
}

domready(function () {
  sceneSetup();
  bufferTextureSetup();
  update();
  scPlayer = new SCPlayer('83f4f6ade6ed22a7213d4441feea15f6',
                           updateImageTextureForTrack,
                           'https://soundcloud.com/beshkenmusic/sets/for-time-is-the-longest-distance-between-two-places/s-KqrgS',
                           's-KqrgS');
  scPlayer.init();
})
