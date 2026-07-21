const pc = ff.cube.getObjectById(44) === ff.touchesController.selectedPiece.piece

const pc = ff.cube.getObjectById(44);

const gg = ff.cube.getSelectedPieceGroups(pc);


const arrow = ff.touchesController.engines.plucker.visuals.torqueArrow;

arrow.setDirection(a2.dirV);

measureTorqueOnPiece

const leverV = 


const gs = ff.getSelectedPiece();

gs.worldNormal

arrow.setDirection(new THREE.Vector3(0,0,1))

const gs = ff.getSelectedPiece();
const arrow = ff.touchesController.engines.plucker.visuals.torqueArrow;
arrow.setDirection(gs.worldNormal)





const gs = ff.getSelectedPiece();
const arrow = ff.touchesController.engines.plucker.visuals.torqueArrow;
arrow.setDirection(gs.worldNormal)



// testing the turn?
const index = 0;
const gs = ff.getSelectedPiece();
const gg = ff.cube.getSelectedPieceGroups(gs.piece);
const arrow = ff.touchesController.engines.plucker.visuals.torqueArrow;
const group = gg[index];
arrow.setDirection(group.axis)


const forceV = new THREE.Vector3(0,-1,0);
const leverV = new THREE.Vector3();
leverV.copy(gs.worldNormal)





    // all the same as torqueGroup
    const t = new THREE.Vector3();
    const tq = new THREE.Vector3();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3(1,1,1);
    const m = new THREE.Matrix4();

    const axisW = new THREE.Vector3();

    axisW.copy(group.axis);

    // might need to ABS the lever and axis here
    // just to get a reading not a heading
    // also where is lever length???
    // this does not read as proper torque yet

    tq.crossVectors(forceV,leverV);
    const deltaAngle = tq.length();
    q.setFromAxisAngle(tq.normalize(), deltaAngle);
    axisW.applyQuaternion(q);

    // need dot product
    const dot = group.axis.dot(axisW);
    const angle = group.axis.angleTo(axisW);

console.log("axisW", axisW)    
console.log("dot", dot)    
console.log("angle", angle)    

arrow.setDirection(axisW)

