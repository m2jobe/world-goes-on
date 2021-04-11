import * as THREE from "three";

import Material from "./material";
import Config from "../../data/config";

// This helper class can be used to create and then place geometry in the scene
export default class Geometry {
  constructor(scene) {
    this.scene = scene;
    this.geo = null;
    this.type = "";
  }

  async make(type) {
    if (type === "plane") {
      return async (width, height, widthSegments = 1, heightSegments = 1) => {
        this.geo = new THREE.PlaneGeometry(
          width,
          height,
          widthSegments,
          heightSegments
        );
      };
    }

    if (type === "sphere") {
      return async (radius, widthSegments = 32, heightSegments = 32) => {
        this.geo = new THREE.SphereGeometry(
          radius,
          widthSegments,
          heightSegments
        );
      };
    }

    if (type === "text") {
      return async (size = 32, text = "hi") => {
        const loader = new THREE.FontLoader();
        this.type = "text";
        const that = this;

        await loader.load(
          "./assets/fonts/helvetiker_regular.typeface.json",
          function (font) {
            console.log(font);
            that.geo = new THREE.TextBufferGeometry(text, {
              font: font,
              size: size,
              height: 5,
              curveSegments: 12,
              bevelEnabled: true,
              bevelThickness: 10,
              bevelSize: 8,
              bevelOffset: 0,
              bevelSegments: 5,
            });
          }
        );
      };
    }
  }

  async createText(
    text = null,
    size = 80,
    height = 5,
    curveSegments = 12,
    px,
    py,
    pz,
    rx,
    ry,
    rz,
    color = 0xffffff
  ) {
    const loader = new THREE.FontLoader();
    this.type = "text";
    const that = this;

    await loader.load(
      "./assets/fonts/helvetiker_regular.typeface.json",
      function (font) {
        console.log(font);
        that.geo = new THREE.TextBufferGeometry(text, {
          font: font,
          size: size,
          height: height,
          curveSegments: curveSegments,
        });

        that.place([px, py, pz], [rx, ry, rz], color);
      }
    );
  }

  place(position, rotation, color = 0xffffff) {
    const material =
      this.type == "text"
        ? [
            new THREE.MeshPhongMaterial({ color: color, flatShading: true }), // front
            new THREE.MeshPhongMaterial({ color: color }), // side
          ]
        : new Material(0xeeeeee).standard;

    console.log(this.geo);
    const mesh = new THREE.Mesh(this.geo, material);

    // Use ES6 spread to set position and rotation from passed in array
    mesh.position.set(...position);
    mesh.rotation.set(...rotation);

    if (Config.shadow.enabled) {
      mesh.receiveShadow = true;
    }

    this.scene.add(mesh);
  }
}
