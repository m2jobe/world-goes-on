// Global imports -
import * as THREE from "three";

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

// data
import Config from "../data/config";

import { TouchControls } from "../utils/touch-controls.js";
import Geometry from "./components/geometry";

// -- End of imports

// This class instantiates and ties all of the components together, starts the loading process and renders the main loop
export default class Elysium {
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
    this.renderer.threeRenderer.setClearColor(0xf5fafa, 1);

    // Components instantiations
    this.camera = new Camera(this.renderer.threeRenderer);
    this.light = new Light(this.scene);
    this.light.ambientLight = new THREE.AmbientLight("#eeafcf");

    // Create and place lights in scene

    const lights = ["ambient"];
    lights.forEach((light) =>  this.light.place(light));

    // Instantiate texture class
    this.texture = new Texture();

    // Start loading the textures and then go on to load the model after the texture Promises have resolved
    this.texture.load().then(() => {
      this.manager = new THREE.LoadingManager();

      // Textures loaded, load model
      this.elsyium = new Model(this.scene, this.manager, this.texture.textures);
      this.elsyium.load("gltf", 4);

      // All loaders done now
      this.manager.onLoad = async () => {
        // Set up interaction manager with the app now that the model is finished loading
        this.interactionManager = new Interaction(
          this.renderer.threeRenderer,
          this.scene,
          this.camera.threeCamera,
          this.touchControls,
        );

        Config.isLoaded = true;

        const loadingScreen = document.getElementById("loading-screen");
        loadingScreen.classList.add("fade-out");

        // optional: remove loader from DOM via event listener
        loadingScreen.addEventListener("transitionend", this.onTransitionEnd);

        this.render();
      };
    });

    //this.createTheStarsFilledWithPotential();
    this.createSoundVerbs();
    this.addControls();
  }

  onTransitionEnd(event) {
    const element = event.target;
    element.remove();
  }

  render() {
    this.touchControls.update();
    if (this.orb1Animation) {
      this.orb1Animation.update(this.clock.getDelta());
    }
    // Call render function and pass in created scene and camera
    this.renderer.render(this.scene, this.camera.threeCamera);

  

    if (
      this.interactionManager &&
      this.interactionManager.takeMeToElsyium == true
    ) {
      // const container = document.getElementById("appContainer");
      //return new Main(container);
      /*this.touchControls.setPosition(
        this.touchControls.fpsBody.position.x,
        this.touchControls.fpsBody.position.y,
        this.touchControls.fpsBody.position.z - 1
      );

      this.touchControls.setRotation(-Math.PI / 2, -Math.PI / 2 - 10);

      this.interactionManager.takeMeToElsyium = false;*/
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
      speedFactor: 3,
      delta: 1,
      rotationFactor: 0.006,
      maxPitch: 100,
      hitTest: false,
      hitTestDistance: 40,
    };
    this.touchControls = new TouchControls(
      container,
      this.camera.threeCamera,
      options
    );
    this.touchControls.setPosition(5, 59, 1500);
    this.touchControls.addToScene(this.scene);
    // controls.setRotation(0.15, -0.15);
  }
}
