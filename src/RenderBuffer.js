import * as THREE from 'three';
import _ from 'lodash';

export default class RenderBuffer {

  constructor(renderer, fragmentShader, vertexShader, uniforms, resolution, camera, isFeedback, renderToScreen) {
    this.renderer = renderer;
    this.vertexShader = vertexShader;
    this.fragmentShader = fragmentShader;
    this.uniforms = uniforms;
    this.resolution = resolution;
    this.camera = camera;
    this.isFeedback = isFeedback || false;
    this.renderToScreen = renderToScreen || false;
    this.init();
  }

  init() {
    this.bufferScene = new THREE.Scene();

    this.bufferTexture = new THREE.WebGLRenderTarget( this.resolution.x, this.resolution.y, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });
    this.bufferTexture.texture.type = THREE.FloatType;

    let defaultUniforms = {
      iResolution: { type: 'v2', value: this.resolution },
      iFrame: { type: 'i', value: 0 },
      iGlobalTime: { type: 'f', value: 0.0 },
      iMouse: { type: 'v3', value: new THREE.Vector3(0.0, 0.0, 0.0) }
    };

    this.uniforms = _.assign(defaultUniforms, this.uniforms);

    if (this.isFeedback) {
      this.bufferTexture2 = new THREE.WebGLRenderTarget( this.resolution.x, this.resolution.y, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });
      this.bufferTexture2.texture.type = THREE.FloatType;

      this.uniforms['iChannel0'] = { type: 't', value: this.bufferTexture.texture };
    }

    this.bufferMaterial = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      fragmentShader: this.fragmentShader
    });

    if (this.vertexShader) this.bufferMaterial.vertexShader = this.vertexShader;

    let plane = new THREE.PlaneBufferGeometry( this.resolution.x, this.resolution.y );
    this.bufferObject = new THREE.Mesh(plane, this.bufferMaterial);
    this.bufferScene.add(this.bufferObject);
  }

  swap() {
    if (!this.isFeedback) return;
    let swap = this.bufferTexture;
    this.bufferTexture = this.bufferTexture2;
    this.bufferTexture2 = swap;
    this.uniforms.iChannel0.value = this.bufferTexture.texture;
  }

  render() {
    let texture = this.isFeedback ? this.bufferTexture2 : this.bufferTexture;
    if (this.renderToScreen) {
      this.renderer.render(this.bufferScene, this.camera);
    } else {
      this.renderer.render(this.bufferScene, this.camera, texture, true);
    }
    if (this.isFeedback) this.swap();
  }

  updateResolution(resolution) {
    this.resolution = resolution;

    this.updateUniforms({
      iResolution: { type: 'v2', value: resolution }
    });
  }

  renderToScreen() {
    this.renderer.render(this.bufferScene, this.camera);
  }

  updateUniforms(uniforms) {
    _.assign(this.uniforms, uniforms);
  }

  getTexture() {
    if (this.isFeedback) {
      return this.bufferTexture2.texture;
    } else {
      return this.bufferTexture.texture;
    }
  }
}
