import * as THREE from "three";

export default class Animation {
  constructor(obj, clip = null) {
    // Scene that the clip will be applied to
    this.obj = obj;

    // Initialize animation mixer
    this.mixer = new THREE.AnimationMixer(this.obj);

    this.playClip(clip);
  }

  playClip(clip) {
    this.action = this.mixer.clipAction(clip);

    this.action.play();
  }

  // Call update in loop
  update(delta) {
    if (this.mixer) {
      this.mixer.update(delta);
    }
  }
}
