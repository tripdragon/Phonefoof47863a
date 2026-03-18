// 
// get world position of piece from hitzone and send raycast is its 3 axis
// to select adjacts rows
// 
magicCube.updateMatrixWorld(true)

let yy = magicCube.pieces[2];

const center = new THREE.Vector3();
yy.hitZone.getWorldPosition(center);
const dirX = new THREE.Vector3().copy(center).setY(0).setZ(0);
dirX.x *= -1;

const arrowHelper = new THREE.ArrowHelper( dirX, center, 8, 0xffff44 );
scene.add( arrowHelper );
// magicCube.add( arrowHelper );


const intersects = [];
const rrX = new THREE.Raycaster(center, dirX );
const getX = rrX.intersectObjects(magicCube.pieces, false, intersects)

const pickPool = [];
intersects.forEach(x=>{
    if (x.object?.parent?.isPiece) {
       pickPool.push(x.object.parent); 
    }
})


pickPool.forEach(x=>{
    x.highlight({amp:0.4})
})



// JUNK
// /
// 
// 
// 


// const box1 = new THREE.Box3();
// box1.setFromObject( yy );

// reverse the ray from its position
const center = new THREE.Vector3();
// let dirX = new THREE.Vector3().copy(box1.getCenter(center)).normalize().negate().setY(0).setZ(0);
let dirX = new THREE.Vector3().copy(yy.hitZone.position).setY(0).setZ(0);
// dirX.x *= -1;

// new THREE.Box3().setFromObject( object ).getCenter( object.position ).multiplyScalar( - 1 );

// const box2 = new THREE.Box3();
// box2.setFromObject( yy );
// const boxhelper = new THREE.Box3Helper( box2, 0xffff00 );
// scene.add( boxhelper )
magicCube.updateMatrixWorld(true)
let yy = magicCube.pieces[2];
yy.highlight()
const arrowHelper = new THREE.ArrowHelper( new THREE.Vector3(-1,0,0), yy.hitZone.position, 8, 0xffff44 );
// scene.add( arrowHelper );
magicCube.add( arrowHelper );

// groups dont have boxes, so no raycast
const rrX = new THREE.Raycaster(yy.getWorldPosition(new THREE.Vector3()), dirX );
const getX = rrX.intersectObjects(magicCube.pieces,false, pickPool)

// const bb = new THREE.Box3();//.setFromObject(node);
// const rrX = new THREE.Ray(center, dirX)

// magicCube.pieces.forEach(x=>{
//     bb.setFromObject(x);
//     if(rrX.intersectsBox( bb )){
//         if(x !== yy){
//             pickPool.push(x)
//         }
//     }

// })

pickPool.forEach(x=>{
    x.highlight({amp:0.4})
})
