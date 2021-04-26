import * as THREE from "three";

import Material from "../components/material";
import Helpers from "../../utils/helpers";
import { BufferGeometryUtils } from "../../utils/bufferGeometryUtils";
import { GLTFLoader } from "../loaders/GLTFLoader";
import Config from "../../data/config";

// Loads in a single object from the config file
export default class Model {
  constructor(scene, manager, textures) {
    this.scene = scene;
    this.textures = textures;
    this.manager = manager;

    this.obj = null;
    this.ref = null;
    this.animations = null;
  }

  load(type, modelIndex = null) {
    // Manager is passed in to loader to determine when loading done in main

    const model = Config.models[modelIndex || Config.model.selected];

    switch (type) {
      case "gltf":
        // Load model with selected loader
        new GLTFLoader(this.manager).load(
          Config.models[modelIndex || Config.model.selected].path,
          (gltf) => {
            const scene = gltf.scene;

            if (model.position) {
              scene.position.x = model.position.x;
              scene.position.y = model.position.y;
              scene.position.z = model.position.z;
            }
            if (model.rotation) {
              scene.rotation.x = model.rotation.x;
              scene.rotation.y = model.rotation.y;
              scene.rotation.z = model.rotation.z;
            }

            let mesh;

            if (Config.shadow.enabled) {
              scene.traverse(function (node) {
                if (node.isMesh || node.isLight) node.castShadow = true;
                if (node.isMesh) {
                  node.material.wireframe = Config.mesh.wireframe;
                  mesh = node;
                }
              });
            }

            if (gltf.animations) {
              this.animations = gltf.animations;
            }

            this.obj = mesh;

            BufferGeometryUtils.computeTangents(mesh.geometry);

            var group = new THREE.Group();
            group.scale.multiplyScalar(
              Config.models[modelIndex || Config.model.selected].scale
            );
            this.scene.add(group);

            this.ref = group;

            scene.scale.multiplyScalar(
              Config.models[modelIndex || Config.model.selected].scale
            );
            
            // Add to scene
            this.scene.add(scene);
          },
          Helpers.logProgress(),
          Helpers.logError()
        );
        break;

      case "object":
        // Load model with ObjectLoader
        new THREE.ObjectLoader(this.manager).load(
          Config.models[Config.model.selected].path,
          (obj) => {
            obj.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                // Create material for mesh and set its map to texture by name from preloaded textures
                const material = new Material(0xffffff).standard;
                material.map = this.textures.UV;
                child.material = material;

                // Set to cast and receive shadow if enabled
                if (Config.shadow.enabled) {
                  child.receiveShadow = true;
                  child.castShadow = true;
                }
              }
            });

            // Set prop to obj so it can be accessed from outside the class
            this.obj = obj;
            this.ref = obj;

            obj.scale.multiplyScalar(
              Config.models[Config.model.selected].scale
            );
            this.scene.add(obj);
          },
          Helpers.logProgress(),
          Helpers.logError()
        );
        break;
    }
  }

  unload() {
    this.scene.remove(this.ref);
  }
}
