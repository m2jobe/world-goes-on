// Global imports -
import * as THREE from "three";
import TWEEN from "@tweenjs/tween.js";

// Local imports -
// Components
import Renderer from "./components/renderer";
import Camera from "./components/camera";
import Light from "./components/light";
import Animation from "./components/animation";

// Model
import Texture from "./model/texture";
import Model from "./model/model";

// Managers
import Interaction from "./managers/interaction";
import Controls from "./components/controls";

// data
import Config from "./../data/config";

import { TouchControls } from "../utils/touch-controls.js";
import Geometry from "./components/geometry";

// -- End of imports

// This class instantiates and ties all of the components together, starts the loading process and renders the main loop
export default class Main {
  constructor(container) {
    Config.isLoaded = false;

    Config.isDev = false;
    Config.isShowingStats = false;
    // Set container property to container element
    this.container = container;
    this.touchControls;
    this.intersected;
    this.stars;
    this.starGeo;
    this.giveUserBackControl = false;

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
    this.controls = new Controls(this.camera.threeCamera, container);
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

      this.orb1 = new Model(this.scene, this.manager, this.texture.textures);
      this.orb1.load(Config.models[0].type, 3);

      // onProgress callback
      this.manager.onProgress = (item, loaded, total) => {
        console.log(`${item}: ${loaded} ${total}`);
      };

      // All loaders done now
      this.manager.onLoad = async () => {
        // Set up interaction manager with the app now that the model is finished loading
        this.interactionManager = new Interaction(
          this.renderer.threeRenderer,
          this.scene,
          this.camera.threeCamera,
          this.controls.threeControls,
          [this.orb1.obj]
        );

        this.orb1Animation = new Animation(
          this.orb1.obj,
          this.orb1.animations[0]
        );

        this.orb1Text = new Geometry(this.scene);
        await this.orb1Text.createText(
          "Elysium ",
          2,
          1,
          6,
          -4.3,
          -6,
          40,
          0,
          0,
          0,
          0xffff00
        );

        Config.isLoaded = true;

        const loadingScreen = document.getElementById("loading-screen");
        loadingScreen.classList.add("fade-out");

        // optional: remove loader from DOM via event listener
        loadingScreen.addEventListener("transitionend", this.onTransitionEnd);

        this.render();
      };
    });

    this.createTheStarsFilledWithPotential();
    this.createSoundVerbs();
  }

  render() {
    // Call any vendor or module frame updates here
    TWEEN.update();
    this.controls.threeControls.update();

    if (this.orb1Animation) {
      this.orb1Animation.update(this.clock.getDelta());
    }
    // Call render function and pass in created scene and camera
    this.renderer.render(this.scene, this.camera.threeCamera);

    // Make the stars move and spin
    this.giveSpinToTheStars();

    this.rotateTheCelestials();

    requestAnimationFrame(this.render.bind(this)); // Bind the main class instead of window object
  }

  createTheStarsFilledWithPotential() {
    this.starGeo = new THREE.Geometry();
    for (let i = 0; i < 639; i++) {
      let star = new THREE.Vector3(
        Math.random() * 600 - 300,
        Math.random() * 600 - 300,
        Math.random() * 600 - 300
      );
      star.velocity = 0;
      star.acceleration = 0.001;
      this.starGeo.vertices.push(star);
    }

    let sprite = new THREE.TextureLoader().load("assets/images/sun.png");
    let starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 3,
      map: sprite,
      transparent: true,
    });

    this.stars = new THREE.Points(this.starGeo, starMaterial);
    this.scene.add(this.stars);
  }

  rotateTheCelestials() {
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
  }

  giveSpinToTheStars() {
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

  onTransitionEnd(event) {
    const element = event.target;
    element.remove();
  }
}
