ff.cube.spinGroupByName({name:"ringVertical", deltaAngle:0.2})

let delta = Math.PI / 2 * 1.0;

const max = Math.PI / 2;
const runtime = 0.5;
const alpha = runtime / max;
// mising delta time and - pre
ff.cube.spinGroupByName({name:"ringVertical", deltaAngle:alpha})



function Spin(
    object,
    axis,
    duration,
    angle = Math.PI * 2,
    progress = t => t
) {


ff.cube.refishGroups();
function Spin(
    duration,
    angle = Math.PI * 2,
    progress = t => t
) {
    const start = performance.now();
    let previous = 0;

    function frame(now) {
        const t = Math.min((now - start) / (duration * 1000), 1);

        const current = angle * progress(t);


        // object.rotateOnAxis(axis, current - previous);
        const alpha = current - previous;
        ff.cube.spinGroupByName({name:"ringVertical", deltaAngle:-alpha})
        

        previous = current;

        if (t < 1){
            requestAnimationFrame(frame);
        }
        else if(t >= 1){
        	ff.cube.refishGroups();
        }

        console.log("current", current)
        console.log("t", t)
    }

    requestAnimationFrame(frame);
}

Spin(0.5, Math.PI / 2)