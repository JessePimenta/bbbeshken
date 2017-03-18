import * as THREE from 'three';

export default class FrameBuffer {

  constructor(scene, vertexShader,fragmentShader, uniforms) {
    this.scene = scene;
    this.vertexShader = vertexShader;
    this.fragmentShader = fragmentShader;
    this.uniforms = uniforms;
  }

  init() {
    this.bufferScene = new THREE.scene;
    this.textureA = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter});
    this.textureB = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter} );

    this.uniforms = Object.assign(this.uniforms, {bufferTexture: {type: "t", value: this.textureA}});

    let bufferMaterial = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      fragmentShader: this.fragmentShader,
      vertexShader: this.vertexShader
    })

    plane = new THREE.PlaneBufferGeometry( window.innerWidth, window.innerHeight );
    bufferObject = new THREE.Mesh( plane, bufferMaterial );
    bufferScene.add(bufferObject);
  }
}


function bufferTextureSetup(){
  //Create buffer scene
  bufferScene = new THREE.Scene();

  //Create 2 buffer textures
  textureA = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter});
  textureB = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter} );

  let imageTexture = THREE.ImageUtils.loadTexture( "./src/images/imageTexture.jpg" );
  imageTexture.wrapS = THREE.RepeatWrapping;
  imageTexture.wrapT = THREE.RepeatWrapping;

  uniforms = {
    bufferTexture: { type: "t", value: textureA },
    imageTexture: { type: "t", value: imageTexture },
    time: { type: "f", value: 0.1 },
    res : { type: "v2", value: new THREE.Vector2(window.innerWidth,window.innerHeight) }
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

  //Draw textureB to screen
  finalMaterial =  new THREE.MeshBasicMaterial({map: textureB});
  quad = new THREE.Mesh( plane, finalMaterial );
  scene.add(quad);

}
