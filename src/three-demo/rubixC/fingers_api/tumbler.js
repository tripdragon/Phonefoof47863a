/*
	
	reads nice but is junk
	ai tried its best, but its not both fluid and rigid enough


*/


import { Quaternion } from "three";

  
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
	snapAnimationFrame = null;

	constructor({fingersAPI, touchesController, plucker}={}){
		this.ff = fingersAPI;
		this.tc = touchesController;
		this.plucker = plucker;
	}

	begin(){
		const group = this.plucker?.plucked?.group;
	    const cube = this.ff.cube;
	    const direction = Math.sign(this.lastTumbleDelta);
	    if(!group || !group.axis || !direction || !cube?.spinGroup) return false;

	    // Keep moving in the drag direction and land on an exact quarter turn.
	    const targetAngle = Math.sign(this.lastTumbleDelta) * Math.PI / 2;
	    const remainingAngle = targetAngle - this.lastTumbleDelta;

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

    const direction = this.tc.engines.directionArrow.getAbsoluteDirection();
    const plucked = this.plucker.pluck(this.tc.hitDown, piece, direction);
    if(!plucked?.group) return;

    const tumbleDelta = this.getTumbleDelta();
    const frameDelta = tumbleDelta - this.lastTumbleDelta;
    this.lastTumbleDelta = tumbleDelta;
    if(frameDelta === 0) return;

    const force = plucked.force.setLength(frameDelta);
    this.ff.cube.torqueGroup({group:plucked.group, leverV:plucked.leverV, forceV:force});
  }

  reset(){
  	this.lastTumbleDelta = 0;
  }

}
