import * as THREE from 'three';
import glsl from 'glslify';
import domready from 'domready';

let scene;
let camera;
let renderSize;
let renderer;
let clock;
let mouse;

function sceneSetup(){
  //This is the basic scene setup
  scene = new THREE.Scene();
  let width = window.innerWidth;
  let height = window.innerHeight;

  clock = new THREE.Clock();

  mouse = new THREE.Vector3(0.0, 0.0, 0.0);
  document.onmousemove = onMouseMove;
  document.onmousedown = onMouseDown;
  document.onmouseup = onMouseUp;

  let canvas = document.querySelector('canvas');
  if (canvas && canvas.length) {
    canvas = canvas[0];
    canvas.addEventListener('onmousemove', function (event) {console.log("HALSKDJFLAKSDJFL")});

  }

  //Note that we're using an orthographic camera here rather than a prespective
  camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 1, 1000 );
  camera.position.z = 2;

  renderer = new THREE.WebGLRenderer();
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
  precision highp sampler2D;
  precision highp float;
  uniform vec2 resolution;
  uniform vec3 mouse;
  uniform int frame;
  uniform float time;
  uniform sampler2D bufferTexture;
  uniform sampler2D imageTexture;

  varying vec2 vUv;

  void main()
  {
     vec2 uv = gl_FragCoord.xy / resolution.xy;

     float sin_factor = sin(time*0.00001);
     float cos_factor = cos(time*0.00001);
     uv = vec2(uv.x-0.5, uv.y-0.5) * mat2(cos_factor, sin_factor, -sin_factor, cos_factor);

     uv += 0.5;

    if(frame < 10 || mouse.z > 0.0) {
      gl_FragColor = texture2D(imageTexture, uv);
    } else {
      uv = -1.0 + 2.0 * uv;
      uv *= 0.995;
      uv.y += 0.001;
      vec3 r = texture2D(bufferTexture, uv*0.5 + 0.5).rgb;

      r.r += r.g*0.001;
      r.g += r.b*0.001;
      r.b += r.r*0.001;
      r = mod(r, vec3(1.0));

      gl_FragColor = vec4(vec3(r), 1.0);
    }
  }
`;

let fragmentShader2 = glsl`
    precision highp float;
    uniform vec2 resolution;
    uniform sampler2D bufferTexture;
    uniform sampler2D imageTexture;
    varying vec2 vUv;

    void main()
    {
      vec2 uv = gl_FragCoord.xy / resolution.xy;
      vec4 fb = texture2D(bufferTexture, vUv);
      gl_FragColor = vec4(fb.rgb, 1.0);
  }
`

let vertexShader = glsl`
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
let textureA;
let textureB;
let textureC;
let bufferMaterial;
let bufferMaterial2;
let plane;
let bufferObject;
let finalMaterial;
let finalfinalMaterial;
let quad;
let quad2;
let uniforms;

function bufferTextureSetup(image){
  //Create buffer scene
  bufferScene = new THREE.Scene();
  bufferScene2 = new THREE.Scene();

  //Create 2 buffer textures
  textureA = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter});
  textureB = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter} );
  textureC = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter} );

  // let imageTexture = THREE.ImageUtils.loadTexture( "./src/images/ali_knockout.jpg" );
  // imageTexture.wrapS = THREE.RepeatWrapping;
  // imageTexture.wrapT = THREE.RepeatWrapping;
  let imageTexture = new THREE.TextureLoader().load('src/images/road.jpg');

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

  bufferMaterial2 = new THREE.ShaderMaterial( {
    uniforms: {
      imageTexture: {type: "t", value: imageTexture.texture},
      resolution: { type: "v2", value: new THREE.Vector2(window.innerWidth,window.innerHeight) },
      bufferTexture: {type: "t", value: textureA.texture}
    },
    fragmentShader: fragmentShader2,
    vertexShader: vertexShader
  } );

  plane = new THREE.PlaneBufferGeometry( window.innerWidth, window.innerHeight );
  bufferObject = new THREE.Mesh( plane, bufferMaterial );
  bufferScene.add(bufferObject);

  //Draw textureB to screen
  quad = new THREE.Mesh( plane, bufferMaterial );
  bufferScene2.add(quad);

  quad2 = new THREE.Mesh( plane, bufferMaterial2 );
  scene.add(quad2);
}

function update () {
  // Schedule the next frame.
  requestAnimationFrame(update);

  //Draw to textureB
  renderer.render(bufferScene,camera,textureB,true);
  //Swap textureA and B
  var t = textureA;
  textureA = textureB;
  textureB = t;
  uniforms.bufferTexture.value = textureA.texture;

  uniforms.frame.value += 1;
  uniforms.time.value += clock.getDelta();;
  uniforms.mouse.value = mouse;

  renderer.render(bufferScene2,camera,textureC,true);

  //Finally, draw to the screen
  renderer.render( scene, camera );

}

domready(function () {
  sceneSetup();
  bufferTextureSetup();
  update();
})
