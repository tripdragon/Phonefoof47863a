import { 
  Vector2, Vector3,
  Matrix3, Matrix4, Quaternion
} from "three";


const normalMatrix = new Matrix3();
const worldNormal = new Vector3();


// const torqueV = new Vector3();


export function smoothstep(t) {
  return t * t * (3 - 2 * t);
}

export function remapPiToPI2(v) {
  let y = v % (Math.PI * 2);
  if (y < 0) y += Math.PI * 2;
  return y;
}


/*
Object3D.localToworld(vector)
already does this
*/
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
