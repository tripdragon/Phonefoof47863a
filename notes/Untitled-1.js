

for (const key in magicCube.tGS) {
    magicCube.tGS[key].forEach(x=>{
        x.highlight({amp:0.7})
    })
}


magicCube.pieces[0].highlight({amp:0.2})
magicCube.pieces[2].highlight({amp:0.7})

let yy = magicCube.pieces[2];
yy.highlight({amp:0.7});

const pool = [];
const yy = magicCube.pieces[2];

for (const key in magicCube.tGS) {
    if(magicCube.tGS[key].includes(yy)){
        pool.push(magicCube.tGS[key])
    }
}

pool.forEach(x=>{
    console.log(x.name);
});

pool.flat().forEach(x => x.highlight({ amp: 0.7 }));

// pool.forEach(p=>{
//     p.forEach(x=>{
//         x.highlight({amp:0.7})
//     })
// })


magicCube.tGS.bottom.forEach(x=>{
    x.highlight({amp:0.7})
})


let yy = magicCube.pieces[2];
yy.highlight({amp:0.7});

// find 