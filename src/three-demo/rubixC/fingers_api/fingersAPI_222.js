
// V: 2

// import * as THREE from "three";
import { 
  Vector2, Vector3, Raycaster, Matrix3, Matrix4, Box3, Group, 
  PlaneGeometry, MeshBasicMaterial, 
  SphereGeometry, Mesh, BoxGeometry, GridHelper  } from "three";

import { SlightlyPriceyPool } from '../slightlyPriceyPool.js';
import { DebugSelectionDownLine } from "../DebugSelectionDownLine.js";
import { ThickArrowHelper, ThickAxesHelper } from "../thickAxesHelper.js";

import { TouchesController } from "./touchesController.js";


// A lot of this might should be from superneatlike pointer events

    // on pointer down first test if on the cube
    // + test if on a piece
    // + get the face of the piece and its center? 
    // + draw a giant 3d plane on the face
    // + continue hit tests now onto this plane
    // + over time test the form of points gesture
    //   ++ are they going in a direction n w s e
    //   ++ or in a radial circular
    // + convert the points to local space onto the face
    // + once gesture is picked get the delta distance
    // + locate which side of cube is affected
    //   ++ using the opposite axises from the selected face axis
    //   ++ using a dot product distance filter out the current axis,
    //   ++ then using torque for figuring out which axis will be effected
    //   ++ the least to none, select that side of the cube to then apply the torque
    // + begin its rotating using the delta of the torque
    // + delegate further work to different api to follow finger
  
// const states = {
//   idle : "idle",
//   onCube : "onCube",
//   seeking : "seeking",
//   found : "found",
//   following : "following",
//   rolling : "rolling"
// }


export class FingersAPI {
  
  // state = states.idle;
  // isOnCube = false;

  touchesController;
  visualsObject3D;

  constructor({ camera, domElement, scene, controls, cube, planeHitsMax = 42, triggerDistance = 0.35 } = {}) {

    this.scene = scene;
    this.camera = camera;
    this.domElement = domElement;
    this.controls = controls;
    this.cube = cube;
    this.planeHitsMax = planeHitsMax;
    this.triggerDistance = triggerDistance;
    // this.planeHitsMax = 4;

    this.visualsObject3D = new Group();
    
    // dont know why, but visual balls pool does not work when nested to .cube for now
    // they are, but something is flipped
    // magicCube.rotation is at y : PI
    // lets try to break it
    this.cube.rotation.set(0,0,0);
    // this.cube.add(this.visualsObject3D);
    this.scene.add(this.visualsObject3D);

    this.touchesController = new TouchesController({
      fingersAPI:this
    });



    // these should be able to toggle off
    // this.buildPlanePool();
    // this.buildVisualHelpers();
    // this.buildDistanceHud();
    // this.debugSetAllPieceInnerFacesToWhite();

  }

  getPlanePoints(){
    return this.touchesController?.session?.points?.plane;
  }

  getCubePoints(){
    return this.touchesController?.session?.points?.cube;
  }

  getPointDown(){
    // return this.touchesController.pointDown3D;
    return this.touchesController?.hitDown?.point;
  }

}
