/*
	Pure AI written
	eh, have made others, just let ai do it


	const clock = new THREE.Clock();

function animate() {
    // requestAnimationFrame(animate);

    const dt = clock.getDelta();

    Anim.update(dt);



Anim.Spin(cube, new THREE.Vector3(0, 1, 0), 2); // 360° in 2 seconds


*/


/*

// Overshoot
t => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

// Bounce
t => Math.abs(Math.sin(6 * Math.PI * t)) * (1 - t)

// Elastic
t => Math.sin(13 * Math.PI / 2 * t) * Math.pow(2, 10 * (t - 1))

*/
export const Ease = {
    linear: t => t,
    inQuad: t => t * t,
    outQuad: t => t * (2 - t),
    inOutQuad: t =>
        t < 0.5
            ? 2 * t * t
            : 1 - Math.pow(-2 * t + 2, 2) / 2,

    outCubic: t => 1 - Math.pow(1 - t, 3),
    inOutCubic: t =>
        t < 0.5
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2
};

export const Anim = {
    active: [],

    update(dt) {
        for (let i = this.active.length - 1; i >= 0; i--) {
            if (this.active[i](dt))
                this.active.splice(i, 1);
        }
    },

    Spin(object, axis, duration, angle = Math.PI * 2, ease = Ease.linear) {
        let elapsed = 0;
        let previous = 0;

        this.active.push(dt => {
            elapsed += dt;

            const t = Math.min(elapsed / duration, 1);
            const eased = ease(t);

            const current = angle * eased;

            object.rotateOnAxis(axis, current - previous);
            previous = current;

            return t >= 1;
        });
    }
};