// Global imports -
import * as THREE from "three";
import TWEEN from "@tweenjs/tween.js";

// Local imports -
// Components
import Renderer from "./components/renderer";
import Camera from "./components/camera";
import Light from "./components/light";
import Controls from "./components/controls";
import Geometry from "./components/geometry";

// Helpers
import Stats from "./helpers/stats";
import MeshHelper from "./helpers/meshHelper";

// Model
import Texture from "./model/texture";
import Model from "./model/model";

// Managers
import Interaction from "./managers/interaction";
import DatGUI from "./managers/datGUI";

// data
import Config from "./../data/config";

import { TouchControls } from "../utils/touch-controls.js";
// -- End of imports

// This class instantiates and ties all of the components together, starts the loading process and renders the main loop
export default class Main {
  constructor(container) {
    Config.isDev = false;
    Config.isShowingStats = false;
    // Set container property to container element
    this.container = container;
    this.touchControls;
    this.intersected;
    this.stars;
    this.starGeo;

    // Start Three clock
    this.clock = new THREE.Clock();

    // Main scene creation
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(Config.fog.color, Config.fog.near);

    // Get Device Pixel Ratio first for retina
    if (window.devicePixelRatio) {
      Config.dpr = window.devicePixelRatio;
    }

    // Main renderer constructor
    this.renderer = new Renderer(this.scene, container);
    this.renderer.threeRenderer.setClearColor(0x000000, 0);

    // Components instantiations
    this.camera = new Camera(this.renderer.threeRenderer);
    this.light = new Light(this.scene);

    // Create and place lights in scene
    const lights = ["ambient", "point", "hemi"];
    lights.forEach((light) => this.light.place(light));

    // Instantiate texture class
    this.texture = new Texture();

    // Start loading the textures and then go on to load the model after the texture Promises have resolved
    this.texture.load().then(() => {
      this.manager = new THREE.LoadingManager();

      // Textures loaded, load model
      this.earth = new Model(this.scene, this.manager, this.texture.textures);
      this.earth.load(Config.models[0].type, 0);

      // Textures loaded, load model
      this.moon = new Model(this.scene, this.manager, this.texture.textures);
      this.moon.load(Config.models[1].type, 1);

      this.portal = new Model(this.scene, this.manager, this.texture.textures);
      this.portal.load(Config.models[1].type, 2);

      // onProgress callback
      this.manager.onProgress = (item, loaded, total) => {
        console.log(`${item}: ${loaded} ${total}`);
      };

      // All loaders done now
      this.manager.onLoad = () => {
        // Set up interaction manager with the app now that the model is finished loading
        new Interaction(
          this.renderer.threeRenderer,
          this.scene,
          this.camera.threeCamera,
          this.touchControls,
          [this.earth.obj]
        );

        this.sphere1 = new Geometry(this.scene);
        this.sphere1.make("sphere")(2);
        this.sphere1.place(
          [
            this.earth.obj.position.x - 100,
            this.earth.obj.position.y,
            this.earth.obj.position.z,
          ],
          [0, 0, 0]
        );

        // Everything is now fully loaded
        Config.isLoaded = true;
        this.container.querySelector("#loading").style.display = "none";
      };
    });

    this.createTheStarsFilledWithPotential();
    this.createSoundVerbs();
    this.addControls();

    // Start render which does not wait for model fully loaded
    this.render();
  }

  render() {
    // Render rStats if Dev
    if (Config.isDev && Config.isShowingStats) {
      //Stats.start();
    }

    this.touchControls.update();

    var vector = new THREE.Vector3(
      this.touchControls.mouse.x,
      this.touchControls.mouse.y,
      1
    );
    vector.unproject(this.camera.threeCamera);

    var raycaster = new THREE.Raycaster(
      this.touchControls.fpsBody.position,
      vector.sub(this.touchControls.fpsBody.position).normalize()
    );

    var intersects = raycaster.intersectObjects(this.scene.children);
    if (intersects.length > 0) {
      if (this.intersected != intersects[0].object) {
        if (this.intersected)
          this.intersected.material.emissive.setHex(
            this.intersected.currentHex
          );
        this.intersected = intersects[0].object;
        // console.log(intersects);
        //this.intersected.currentHex = this.intersected.material.emissive.getHex();
        //this.intersected.material.emissive.setHex(0xdd0090);
      }
    } else {
      if (this.intersected)
        //this.intersected.material.emissive.setHex(this.intersected.currentHex);
        this.intersected = null;
    }

    // Call render function and pass in created scene and camera
    this.renderer.render(this.scene, this.camera.threeCamera);

    // rStats has finished determining render call now
    if (Config.isDev && Config.isShowingStats) {
      //Stats.end();
    }

    this.starGeo.vertices.forEach((p) => {
      p.velocity += p.acceleration;
      p.y -= p.velocity;

      if (p.y < -200) {
        p.y = 200;
        p.velocity = 0;
      }
    });
    this.starGeo.verticesNeedUpdate = true;
    this.stars.rotation.y += 0.002;

    //Making certain objects spin
    if (this.earth && this.earth.obj) {
      this.earth.obj.rotation.z += 0.002;
    }
    if (this.moon && this.moon.obj) {
      this.moon.obj.rotation.z -= 0.002;
    }
    if (this.portal && this.portal.obj) {
      this.portal.obj.rotation.z += 0.02;
    }

    // RAF
    requestAnimationFrame(this.render.bind(this)); // Bind the main class instead of window object
  }

  createTheStarsFilledWithPotential() {
    this.starGeo = new THREE.Geometry();
    for (let i = 0; i < 333; i++) {
      let star = new THREE.Vector3(
        Math.random() * 600 - 300,
        Math.random() * 600 - 300,
        Math.random() * 600 - 300
      );
      star.velocity = 0;
      star.acceleration = 0.001;
      this.starGeo.vertices.push(star);
    }

    let sprite = new THREE.TextureLoader().load("assets/images/star.png");
    let starMaterial = new THREE.PointsMaterial({
      color: 0xaaaaaa,
      size: 0.7,
      map: sprite,
    });

    this.stars = new THREE.Points(this.starGeo, starMaterial);
    this.scene.add(this.stars);
  }

  createSoundVerbs() {
    const listener = new THREE.AudioListener();
    this.camera.threeCamera.add(listener);

    // create a global audio source
    const sound = new THREE.Audio(listener);

    // load a sound and set it as the Audio object's buffer
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load("assets/images/ggway.wav", function (buffer) {
      sound.setBuffer(buffer);
      sound.setLoop(true);
      sound.setVolume(0.5);
      sound.play();
    });
  }

  addControls() {
    // Controls
    var container = $("#appContainer");

    var options = {
      speedFactor: 0.57,
      delta: 1,
      rotationFactor: 0.0034,
      maxPitch: 10000,
      hitTest: true,
      hitTestDistance: 40,
    };
    this.touchControls = new TouchControls(
      container,
      this.camera.threeCamera,
      options
    );
    this.touchControls.setPosition(0, 35, 400);
    this.touchControls.addToScene(this.scene);
    // controls.setRotation(0.15, -0.15);
  }
}
