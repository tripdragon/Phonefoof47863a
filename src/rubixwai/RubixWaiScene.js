import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RubixMega } from "./RubixMega.js";

export class RubixWaiScene {
  constructor(canvasHost) {
    this.canvasHost = canvasHost;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x090d18);

    this.camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
    this.camera.position.set(4.8, 3.8, 5.8);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.canvasHost.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.minDistance = 4;
    this.controls.maxDistance = 12;
    this.controls.target.set(0, 0, 0);

    this.rubixMega = new RubixMega();
    this.rubixMega.rotation.set(-0.18, 0.5, 0.08);
    this.scene.add(this.rubixMega);

    this.faceLights = [
      [6, 0, 0], [-6, 0, 0],
      [0, 6, 0], [0, -6, 0],
      [0, 0, 6], [0, 0, -6],
    ].map((position, index) => {
      const light = new THREE.PointLight(0xffffff, 18, 18, 2);
      light.name = `FaceLight-${index + 1}`;
      light.position.set(...position);
      this.scene.add(light);
      return light;
    });

    this.animationFrameId = null;
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.canvasHost);
    this.resize();
    this.animate();
  }

  resize() {
    const width = this.canvasHost.clientWidth;
    const height = this.canvasHost.clientHeight;
    if (!width || !height) return;
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  animate() {
    this.animationFrameId = window.requestAnimationFrame(() => this.animate());
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    window.cancelAnimationFrame(this.animationFrameId);
    this.resizeObserver.disconnect();
    this.controls.dispose();
    this.rubixMega.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
