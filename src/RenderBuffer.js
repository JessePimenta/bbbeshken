import * as THREE from 'three';
import _ from 'lodash';

export default class RenderBuffer {

  constructor(renderer, fragShader, vertShader, channels, resolution) {
    this.renderer = renderer;
    this.vertShader = vertShader;
    this.fragShader = fragShader;
    this.channels = channels;
    this.resolution = resolution;
    this.camera = new THREE.OrthographicCamera( resolution.x / - 2, resolution.x / 2, resolution.y / 2, resolution.y / - 2, 1, 1000 );
    this.camera.position.z = 2;
  }

  init() {
    this.bufferScene = new THREE.Scene();

    this.bufferTexture = new THREE.WebGLRenderTarget( this.resolution.x, this.resolution.y, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });
    this.bufferTexture.texture.type = THREE.FloatType;

    let uniforms = {
      iResolution: { type: 'v2', value: this.resolution },
      iFrame: { type: 'i', value: 0 },
      iGlobalTime: { type: 'f', value: 0.0 },
      iMouse: { type: 'v3', value: new THREE.Vector3(0.0, 0.0, 0.0) }
    };

    for (let i = 0; i < this.channels.length; i++) {
      uniforms['iChannel'+i] = { type: 't', value: this.channels[i] };
    }

    this.bufferMaterial = new THREE.ShaderMaterial({
      uniforms: uniforms,
      fragmentShader: this.fragShader,
      vertexShader: this.vertShader
    });

    let plane = new THREE.PlaneBufferGeometry( this.resolution.x, this.resolution.height );
    let bufferObject = new THREE.Mesh(plane, this.bufferMaterial);

    this.bufferScene.add(bufferObject)
  }

  update(frame, mouse, resolution) {
    this.bufferMaterial.uniforms.iFrame.value = frame;
    this.bufferMaterial.uniforms.iMouse.value = mouse;
    this.bufferMaterial.uniforms.iResolution.value = resolution;
  }

  renderToBuffer() {
    this.renderer.render(this.bufferScene, this.camera, this.bufferTexture, true);
  }

  renderToScreen() {
    this.renderer.render(this.bufferScene, this.camera);
  }

  updateUniforms(uniforms) {
    _.assign(this.bufferMaterial.uniforms, uniforms);
    console.log(this.bufferMaterial.uniforms);
  }

  getTexture() {
    return this.bufferTexture.texture;
  }
}
