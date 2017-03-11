import * as THREE from 'three';

// Set the scene size.
const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

// Set some camera attributes.
const VIEW_ANGLE = 90;
const ASPECT = WIDTH / HEIGHT;
const NEAR = 0.1;
const FAR = 10000;

// Get the DOM element to attach to
const container = document.querySelector('#container');

// Create a WebGL renderer, camera
// and a scene
const renderer = new THREE.WebGLRenderer();
const scene = new THREE.Scene();

// Set up an OrthographicCamera so we can fill the entire canvas
const camera = new THREE.OrthographicCamera(window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / -2, 1, 100000);

// create the sphere's material
const planeMaterial =
  new THREE.MeshLambertMaterial(
    {
      color: 0xCC0000
    });

const planeGeometry = new THREE.PlaneBufferGeometry( window.innerWidth, window.innerHeight );
const plane = new THREE.Mesh(planeGeometry, planeMaterial);

// create an AmbientLight
const ambientLight =
  new THREE.AmbientLight(0xFFFFFF);

// add to the scene
scene.add(ambientLight);

// Move the Plane back in Z so we
// can see it.
//sphere.position.z = -300;
plane.position.z = -500;

// Finally, add the plane to the scene.
scene.add(plane);

// Add the camera to the scene.
scene.add(camera);

// Start the renderer.
renderer.setSize(WIDTH, HEIGHT);

// Attach the renderer-supplied
// DOM element.
container.appendChild(renderer.domElement);

function update () {
  // Draw!
  renderer.render(scene, camera);

  // Schedule the next frame.
  requestAnimationFrame(update);
}

// Schedule the first frame.
requestAnimationFrame(update);
