import TWEEN from "@tweenjs/tween.js";

// This object contains the state of the app
export default {
  isDev: false,
  isShowingStats: false,
  isLoaded: false,
  isTweening: false,
  isRotating: true,
  isMouseMoving: false,
  isMouseOver: false,
  maxAnisotropy: 1,
  dpr: 1,
  easing: TWEEN.Easing.Quadratic.InOut,
  duration: 500,
  model: {
    selected: 0,
    initialTypes: ["gltf", "object"],
    type: "gltf",
  },
  models: [
    {
      path: "./assets/models/earth.gltf",
      scale: 0.25,
      type: "gltf",
      position: {
        x: 0,
        y: 0,
        z: 0,
      },
    },
    {
      path: "./assets/models/moon.gltf",
      scale: 0.1,
      type: "gltf",
      position: {
        x: 75,
        y: 0,
        z: 0,
      },
      rotation: {
        x: 0,
        y: -Math.PI,
        z: 0,
      },
    },
    {
      path: "./assets/models/portal.gltf",
      scale: 0.1,
      type: "gltf",
      position: {
        x: -100,
        y: -100,
        z: 0,
      },
    },
    {
      path: "./assets/models/orb.gltf",
      scale: 1,
      type: "gltf",
      position: {
        x: 0,
        y: 0,
        z: 40,
      },
    },
    {
        path: "./assets/models/elsyium.gltf",
        scale: 1,
        type: "gltf",
        position: {
          x: 0,
          y: 0,
          z: 0,
        }
    },
  ],
  texture: {
    path: "./assets/textures/",
    imageFiles: [{ name: "UV", image: "UV_Grid_Sm.jpg" }],
  },
  mesh: {
    enableHelper: false,
    wireframe: false,
    translucent: false,
    material: {
      color: 0xffffff,
      emissive: 0xffffff,
    },
  },
  fog: {
    color: 0xffffff,
    near: 0.0008,
  },
  camera: {
    fov: 140,
    near: 1,
    far: 500,
    aspect: 1,
    posX: 0,
    posY: 69,
    posZ: 234,
  },
  controls: {
    autoRotate: true,
    autoRotateSpeed: -0.5,
    rotateSpeed: 0.5,
    zoomSpeed: 0.8,
    minDistance: 0,
    maxDistance: 600,
    minPolarAngle: Math.PI / 5,
    maxPolarAngle: Math.PI / 2,
    minAzimuthAngle: -Infinity,
    maxAzimuthAngle: Infinity,
    enableDamping: true,
    dampingFactor: 0.5,
    enableZoom: true,
    target: {
      x: 0,
      y: 0,
      z: 0,
    },
  },
  ambientLight: {
    enabled: true,
    color: 0xffffff,
  },
  directionalLight: {
    enabled: true,
    color: 0xf0f0f0,
    intensity: 1.2,
    x: -75,
    y: 280,
    z: 150,
  },
  shadow: {
    enabled: true,
    helperEnabled: true,
    bias: 0,
    mapWidth: 2048,
    mapHeight: 2048,
    near: 250,
    far: 400,
    top: 100,
    right: 100,
    bottom: -100,
    left: -100,
  },
  pointLight: {
    enabled: true,
    color: 0xffffff,
    intensity: 1.2,
    distance: 115,
    x: 0,
    y: 0,
    z: 0,
  },
  hemiLight: {
    enabled: true,
    color: 0xc8c8c8,
    groundColor: 0xffffff,
    intensity: 1.2,
    x: 0,
    y: 0,
    z: 0,
  },
};
