import * as THREE from 'three';
import glsl from 'glslify';
import domready from 'domready';
import SCPlayer from './scPlayer.js';

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
    'src/images/album/0. Album Art*.jpg',
    'src/images/album/1. Intro*.jpg',
    'src/images/album/2. The Roman Call.jpg',
    'src/images/album/2.5 Interlude*.jpg'
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
  document.body.appendChild( renderer.domElement );
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

let fragmentShader = glsl`
  uniform vec2 resolution;
  uniform vec3 mouse;
  uniform int frame;
  uniform float time;
  uniform sampler2D bufferTexture;
  uniform sampler2D imageTexture;

  varying vec2 vUv;

  void main()
  {
    // convert uv from screen size to 0 to 1
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    uv = -1.0 + 2.0 * uv;

    float sinFactor = sin(time*0.00001);
    float cosFactor = cos(time*0.00001);
    if (mouse.x > 0.0) {
      uv = vec2(uv.x, uv.y) * mat2(cosFactor, sinFactor, -sinFactor, cosFactor);
    } else {
      uv = vec2(uv.x, uv.y) * mat2(cosFactor, -sinFactor, sinFactor, cosFactor);
    }

    vec4 imagePixel = texture2D(imageTexture, uv*0.5 + 0.5);
    vec4 bufferPixel = texture2D(bufferTexture, uv*0.5 + 0.5);

    if (frame < 100) {
      float frameFloat = float(frame);
      gl_FragColor = mix(vec4(1.0), imagePixel, 0.01*frameFloat);
    } else if (mouse.z > 0.0) {
      // gl_FragColor = texture2D(imageTexture, uv*0.5 + 0.5);

      vec3 i = texture2D(imageTexture, uv*0.5 + 0.5).rgb;
      vec3 b = texture2D(bufferTexture, uv*0.5 + 0.5).rgb;
      gl_FragColor = vec4(mix(b, vec3(0.95), 0.005), 1.0);
    } else {
      // UVs start at 0.0 and move from -1 to 1
      uv *= 0.995;
      uv.y += 0.001;
      vec3 r = texture2D(bufferTexture, uv*0.5 + 0.5).rgb;

      // r += 0.001;
      // r.r += r.g*0.001;
      // r.g += r.b*0.001;
      // r.b += r.r*0.001;
      r.r += (max(r.g*0.001, 0.0001));
      r.g += (max(r.b*0.001, 0.0001));
      r.b += (max(r.r*0.001, 0.0001));
      r = mod(abs(r), vec3(1.0));

      gl_FragColor = vec4(vec3(r), 1.0);
    }
  }
  `;

let fragmentShader2 = glsl`
    precision highp float;
    uniform vec2 resolution;
    uniform int frame;
    uniform sampler2D bufferTexture;
    uniform sampler2D imageTexture;
    varying vec2 vUv;

    void main()
    {
      vec2 uv = gl_FragCoord.xy / resolution.xy;
      vec4 bufferPixel = texture2D(bufferTexture, uv);
      vec4 imagePixel = texture2D(imageTexture, uv);
      gl_FragColor = texture2D(imageTexture, uv * bufferPixel.rg);
  }
`

let gaussianBlurHorizontalPass = glsl`

`

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
let textureA;
let textureB;
let bufferMaterial;
let plane;
let bufferObject;
let finalMaterial;
let quad;
let uniforms;

function bufferTextureSetup(image){
  //Create buffer scene
  bufferScene = new THREE.Scene();

  //Create 2 buffer textures
  textureA = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });
  textureB = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });
  textureA.type = THREE.FloatType;
  textureB.type = THREE.FloatType;

  // let imageTexture = THREE.ImageUtils.loadTexture( "./src/images/ali_knockout.jpg" );
  // imageTexture.wrapS = THREE.RepeatWrapping;
  // imageTexture.wrapT = THREE.RepeatWrapping;
  let imageTexture = images[0];

  uniforms = {
    bufferTexture: { type: "t", value: textureA.texture },
    imageTexture: { type: "t", value: imageTexture },
    frame: {type: "i", value: 0 },
    time: { type: "f", value: 0.0},
    resolution: { type: "v2", value: new THREE.Vector2(window.innerWidth,window.innerHeight) },
    mouse: {type: "v3", value: mouse}
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

  finalMaterial = new THREE.ShaderMaterial( {
    uniforms: {
      imageTexture: {type: "t", value: imageTexture},
      resolution: { type: "v2", value: new THREE.Vector2(window.innerWidth,window.innerHeight) },
      bufferTexture: {type: "t", value: textureA},
      frame: {type: "i", value: 0}
    },
    fragmentShader: fragmentShader2,
    vertexShader: vertexShader
  } );

  //Draw textureB to screen
  quad = new THREE.Mesh( plane, finalMaterial);
  scene.add(quad);
}

function update () {
  // Schedule the next frame.
  requestAnimationFrame(update);

  //Draw to textureB to bufferScene
  renderer.render(bufferScene,camera,textureB,true);

  //Swap textureA and B
  var t = textureA;
  textureA = textureB;
  textureB = t;
  bufferMaterial.uniforms.bufferTexture.value = textureA.texture;

  bufferMaterial.uniforms.frame.value += 1;
  bufferMaterial.uniforms.time.value = window.performance.now() / 1000;
  bufferMaterial.uniforms.mouse.value = mouse;
  finalMaterial.uniforms.frame.value += 1;

  //Finally, draw to the screen
  renderer.render( scene, camera );

}

function updateImageTextureForTrack(trackIndex, player) {
  if (!images[trackIndex]) return;
  bufferMaterial.uniforms.imageTexture.value = images[trackIndex];
  finalMaterial.uniforms.imageTexture.value = images[trackIndex];
}

domready(function () {
  sceneSetup();
  bufferTextureSetup();
  update();
  scPlayer = new SCPlayer('83f4f6ade6ed22a7213d4441feea15f6', updateImageTextureForTrack);
  scPlayer.init();
})
