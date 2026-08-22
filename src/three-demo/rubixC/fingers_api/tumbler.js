/*
	
	reads nice but is junk
	ai tried its best, but its not both fluid and rigid enough


*/


import { Quaternion, Vector3 } from "three";

  
import { remap } from "../math.js";

/*
	
	this one has tons of steps
	which requires lots of debugger visuals

	taking a line thats in 3d space but in a 2d form over 2 axis

	+ derive an average direction from points session
	+ figure out which axis's to drive the next
		++ derive a clammped direction to n,e,s,w 
		++ derive a torque from the clamped direction as force
	+ check force against the axises



	
*/
export class Tumbler{
	ff;
	tc;
	plucker;

	lastTumbleDelta = 0;
	tumbleAngle = 0;
	snapAnimationFrame = null;
	torque = new Vector3();
	lockedDirection = new Vector3();

	constructor({fingersAPI, touchesController, plucker}={}){
		this.ff = fingersAPI;
		this.tc = touchesController;
		this.plucker = plucker;
	}

	begin(){
		const group = this.plucker?.plucked?.group;
    const cube = this.ff.cube;
    const direction = Math.sign(this.tumbleAngle);
    
    if(!group || !group.axis || !direction || !cube?.spinGroup) return false;

    // Keep moving in the drag direction and land on an exact quarter turn.
		const quarterTurn = Math.PI / 2;
		const targetAngle = direction * Math.max(1, Math.ceil(Math.abs(this.tumbleAngle) / quarterTurn)) * quarterTurn;
    const remainingAngle = targetAngle - this.tumbleAngle;

    // this.state = states.snapping;

    const duration = this.ff.snapDuration ?? 250;
    const requestFrame = globalThis.requestAnimationFrame
      ?? (callback => setTimeout(() => callback(performance.now()), 16));

    // blegh ai not using cacheing
    const startQuaternion = new Quaternion();
    const targetQuaternion = new Quaternion().setFromAxisAngle(group.axis, remainingAngle);
    const frameQuaternion = new Quaternion();
    
    let previousAngle = 0;
    let startTime = null;

    const finish = () => {
      cube.refishGroups?.();
      this.snapAnimationFrame = null;
		// no wrong this should just be an emit event
      this.tc.resetInteractionState();
    };

    // niffty inline animation starter

    const animate = now => {
      if(startTime === null) startTime = now;
      const progress = duration <= 0 ? 1 : Math.min((now - startTime) / duration, 1);
      const easedProgress = progress * progress * (3 - 2 * progress);
      frameQuaternion.slerpQuaternions(startQuaternion, targetQuaternion, easedProgress);
      const currentAngle = progress === 1
        ? remainingAngle
        : remainingAngle === 0
        ? 0
        : Math.sign(remainingAngle) * 2 * Math.acos(Math.min(1, Math.abs(frameQuaternion.w)));
      const deltaAngle = currentAngle - previousAngle;
      previousAngle = currentAngle;

      if(deltaAngle !== 0) cube.spinGroup({group, deltaAngle});
      if(progress < 1){
        this.snapAnimationFrame = requestFrame(animate);
      } else {
        finish();
      }
    };

    this.snapAnimationFrame = requestFrame(animate);
    return true;
	}


	/*


	*/


  getTumbleDelta(){
    let tumbleDelta = this.tc.engines.directionArrow.getDragDistance();
    const tumbleSign = Math.sign(tumbleDelta);
    tumbleDelta = remap(Math.abs(tumbleDelta), 0, 3, 0, Math.PI / 2);
    return tumbleDelta * tumbleSign * -1;
  }


  updateActiveTumble(){
    const piece = this.tc.selectedPiece?.piece;
    if(!piece) return;

    // Pluck exactly once. After movement begins the selected side/ring remains
    // locked even if the finger crosses a diagonal or leaves the cubie's face.
    let plucked = this.plucker.plucked;
    if(!plucked?.group){
      const direction = this.tc.engines.directionArrow.getAbsoluteDirection();
      plucked = this.plucker.pluck(this.tc.hitDown, piece, direction);
      if(plucked?.group) this.lockedDirection.copy(plucked.force);
    }
    if(!plucked?.group) return;
	if(this.lockedDirection.lengthSq() === 0) this.lockedDirection.copy(plucked.force);

    const tumbleDelta = this.getTumbleDelta();
    const frameDelta = tumbleDelta - this.lastTumbleDelta;
    this.lastTumbleDelta = tumbleDelta;
    if(frameDelta === 0) return;

    const force = plucked.force.copy(this.lockedDirection).setLength(frameDelta);

	// Record the signed angle that torqueGroup is about to apply. The lever can
	// scale the requested force, so the drag distance is not necessarily the
	// angle through which the group actually turned.
	this.torque.crossVectors(force, plucked.leverV);
	if(plucked.group.axis){
		const deltaAngle = this.torque.length() * Math.sign(this.torque.dot(plucked.group.axis));
		if(Number.isFinite(deltaAngle)) this.tumbleAngle += deltaAngle;
	}

    this.ff.cube.torqueGroup({group:plucked.group, leverV:plucked.leverV, forceV:force});
  }

  reset(){
	if(this.snapAnimationFrame !== null){
		globalThis.cancelAnimationFrame?.(this.snapAnimationFrame);
		this.snapAnimationFrame = null;
	}
  	this.lastTumbleDelta = 0;
	this.tumbleAngle = 0;
	this.lockedDirection.set(0, 0, 0);
  }

}
