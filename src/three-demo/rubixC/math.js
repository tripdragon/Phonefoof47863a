import { 
  Vector2, Vector3,
  Matrix4, Matrix3
} from "three";


const normalMatrix = new Matrix3();
const worldNormal = new Vector3();


const torqueV = new THREE.Vector3();


export function smoothstep(t) {
  return t * t * (3 - 2 * t);
}

export function remapPiToPI2(v) {
  let y = v % (Math.PI * 2);
  if (y < 0) y += Math.PI * 2;
  return y;
}


export function worldNormalFromLocal(object3D, localNormal) {
  /*
    normalMatrix : Matrix3
    object3D : Object3D
    worldNormal : Vector3
    localNormal : Vector3

    gives a local normal that is the visual form of the faces normal 

    this.worldNormal.copy(worldNormalFromLocal(plane, this.localNormal));

    update your matrixWorld() before
    .copy the returned
  */
  normalMatrix.getNormalMatrix(object3D.matrixWorld);
  worldNormal.copy(localNormal).applyMatrix3(normalMatrix).normalize();
  // console.log("localNormal", localNormal);
  // console.log("worldNormal", worldNormal);
  return worldNormal;

}




/*

    const f = {x:-0.0,y:-0.1,z:0.0};
    const l = {x:0,y:0,z:1};
    function jhhv() {
      //f.y += -0.01;
      magicCube.torqueGroup({name:"left",leverV:l,forceV:f});
    }
    setInterval(jhhv,100)

  */
  export function torqueGroup({name,leverV,forceV}){
    // turns a group from the force of a torque and a lever
    // does not respect the groups axis by design since the lever is its
    // own special vector
    // Originally built to handle finger direction turns¿
    // NOTE: for perfect force effect, it should be perpendicular 90° to the lever


    const t = this.t;
    const tq = this.torqueV;
    const q = this.q;
    const s = this.s;
    const m = this.m;

    const yy = this.getPiecesGroup(name);
    const pivot = yy.center.position;

    tq.crossVectors(forceV,leverV);

    const deltaAngle = tq.length();

    // axis is torque here
    q.setFromAxisAngle(tq.normalize(), deltaAngle);
    
    // translation = pivot - (rotation * pivot)
    t.copy(pivot).applyQuaternion(q).sub(pivot).negate();

    m.compose(t, q, s);

    yy.forEach(x=>{
      x.applyMatrix4(m);
    });
  }

  export function measureTorqueOnPiece({name,leverV,forceV}){
    // this does not visually turn anything, its role is to give back a
    // vector and an angle dot product to know if an axis should have been locked to
    // an axis spin

    // all the same as torqueGroup
    const t = this.t;
    const tq = this.torqueV;
    const q = this.q;
    const s = this.s;
    const m = this.m;
    const yy = this.getPiecesGroup(name);
    const pivot = yy.center.position;

    tq.crossVectors(forceV,leverV);
    const deltaAngle = tq.length();
    q.setFromAxisAngle(tq.normalize(), deltaAngle);
    t.copy(pivot).applyQuaternion(q).sub(pivot).negate();
    m.compose(t, q, s);

    // except here we do new stuff
    const axis = this.getAxisFromName(name);
    
    
  }
