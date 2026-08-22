import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RubixMega } from "./RubixMega.js";
import { PieceNormalsDebugger } from "./PieceNormalsDebugger.js";

export const INITIAL_CAMERA_POSITION = Object.freeze([14.4, 11.4, 17.4]);
export const MIN_CAMERA_DISTANCE = 4;
export const MAX_CAMERA_DISTANCE = 48;

export class RubixWaiScene {
  constructor(canvasHost) {
    this.canvasHost = canvasHost;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xe0f2fe);

    this.camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
    this.camera.position.set(...INITIAL_CAMERA_POSITION);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.canvasHost.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.minDistance = MIN_CAMERA_DISTANCE;
    this.controls.maxDistance = MAX_CAMERA_DISTANCE;
    this.controls.target.set(0, 0, 0);

    this.rubixMega = new RubixMega();
    this.rubixMega.rotation.set(-0.18, 0.5, 0.08);
    this.scene.add(this.rubixMega);
    this.normalsDebugger = new PieceNormalsDebugger(this.rubixMega.piece);

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

  setNormalsVisible(visible) {
    this.normalsDebugger.visible = Boolean(visible);
  }

  dispose() {
    window.cancelAnimationFrame(this.animationFrameId);
    this.resizeObserver.disconnect();
    this.controls.dispose();
    this.normalsDebugger.dispose();
    this.rubixMega.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
