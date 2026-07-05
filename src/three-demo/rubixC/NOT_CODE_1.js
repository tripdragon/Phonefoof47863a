
const f = {x:0,y:-4,z:0};
const l = {x:1,y:0,z:0};
magicCube.torqueGroup({name:"left",leverV:l,forceV:f});

const t = new THREE.Vector3();
t.crossVectors(f,l);



const f = {x:-0.0,y:-0.1,z:0.0};
const l = {x:0,y:0,z:1};
function jhhv() {
//f.y += -0.01;
magicCube.torqueGroup({name:"left",leverV:l,forceV:f});
}
setInterval(jhhv,10)


const dir = new THREE.Vector3( 1, 2, 0 );
//normalize the direction vector (convert to vector of length 1)
dir.normalize();
const origin = new THREE.Vector3( 0, 0, 0 );
const length = 1;
const hex = 0xffff00;
const arrowHelper = new THREE.ArrowHelper( dir, origin, length, hex );
scene.add( arrowHelper );

.line.matrixAutoUpdate = true;
