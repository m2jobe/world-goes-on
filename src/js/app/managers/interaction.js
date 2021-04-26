import Keyboard from "../../utils/keyboard";
import Helpers from "../../utils/helpers";
import Config from "../../data/config";
import * as THREE from "three";

// Manages all input interactions
export default class Interaction {
  constructor(renderer, scene, camera, controls, targetList) {
    // Properties
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.controls = controls;
    this.targetList = targetList;
    this.raycaster = new THREE.Raycaster();
    this.takeMeToElsyium = false;

    this.timeout = null;

    // Instantiate keyboard helper
    this.keyboard = new Keyboard();

    // Listeners
    // Mouse events
    this.renderer.domElement.addEventListener(
      "mousemove",
      (event) => Helpers.throttle(this.onMouseMove(event), 250),
      false
    );
    this.renderer.domElement.addEventListener(
      "mouseleave",
      (event) => this.onMouseLeave(event),
      false
    );
    this.renderer.domElement.addEventListener(
      "pointerdown",
      (event) => this.onPointerDown(event),
      false
    );

    // Keyboard events
    this.keyboard.domElement.addEventListener("keydown", (event) => {
      // Only once
      if (event.repeat) {
        return;
      }

      if (this.keyboard.eventMatches(event, "escape")) {
        console.log("Escape pressed");
      }
    });
  }

  onPointerDown(event) {
    //event.preventDefault();

    var mouse = {};
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.targetList);
    if (intersects.length > 0) {
      const object = intersects[0].object;
      this.takeMeToElsyium = true;
      window.location.replace("elsyium.html");
      //object.layers.toggle(BLOOM_SCENE);
      //render();
    }
  }

  onMouseLeave(event) {
    event.preventDefault();

    Config.isMouseOver = false;
  }

  onMouseMove(event) {
    event.preventDefault();

    clearTimeout(this.timeout);

    this.timeout = setTimeout(function () {
      Config.isMouseMoving = false;
    }, 200);

    Config.isMouseMoving = true;
  }
}
