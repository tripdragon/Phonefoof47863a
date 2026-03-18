import * as THREE from "three";

export class Piece extends THREE.Object3D {
  isPiece = true;
  whichType = ""; // center edge corner
  borderMat = null;
  borderWidth;
  borderColor = 0xffaacc;
  debug;
  planes = []; // tuple {plane,color}
  colors = []; //hex but js does not store as 0x
  cc = { h: 0, s: 0, l: 0 };
  hitZone = null;

  constructor({ colors = [], borderColor = 0x000000, borderWidth = 0.02546, debug = false } = {}) {
    super();
    this.colors = [...colors];
    this.borderColor = borderColor;
    this.borderWidth = borderWidth;
    this.debug = debug;
    this.debug = false;
    this.build();
    if (this.debug) {
      this.buildDebug();
    }
  }

  storePlane(plane, color) {
    this.planes.push({ plane, color: new THREE.Color(color) });
  }

  // see the cube, the idea is we are drawing the planes away from the
  // pivot point which is bottom, bottom top, and left most bottom
  // each face then draws, center, center down, center down right so counter clockwise
  // after which each piece will be rotated into place
  // think of it like a factory making the same mold part then coloring etc later\
  //
  // now hit zones has to also deal with this extents issue, since we cant
  // just compute for the one object in the scene and its various locations
  build() {
    // invisible but still raycastable
    const sz = 1.0;
    this.hitZone = new THREE.Mesh(
        new THREE.BoxGeometry(sz), 
        new THREE.MeshBasicMaterial({wireframe:false,color:"blue",visible: false})
    );
    this.add(this.hitZone);
    this.hitZone.position.z = 2;

    if (this.colors.length > 0) {
      const p1 = this.makePlane(this.colors[0]);
      p1.rotation.x = Math.PI * -0.5;
      p1.position.y = 1;
      this.add(p1);
      this.whichType = "center";
      this.storePlane(p1, this.colors[0]);
      //const extents = new THREE.Vector3();
      this.hitZone.position.set(0,0.5,0);

      if (this.colors.length > 1) {
        p1.position.z = -0.5;
        const pf = this.makePlane(this.colors[1]);
        this.add(pf);
        this.whichType = "edge";
        this.storePlane(pf, this.colors[1]);

        pf.position.y = 0.5;
        pf.position.z = -1;

        pf.rotation.y = Math.PI * 1.0;
        pf.rotation.z = Math.PI * 0.5;

        this.hitZone.position.set(0,0.5,-0.5);
        this.hitZone.material.color.set("green");

        if (this.colors.length > 2) {
          p1.position.x = -0.5;
          pf.position.x = -0.5;
          const ps = this.makePlane(this.colors[2]);
          this.add(ps);
          this.whichType = "corner";
          this.storePlane(ps, this.colors[2]);

          ps.position.z = -0.5;
          ps.rotation.y = Math.PI * -0.5;
          ps.position.y = 0.5;
          ps.position.x = -1;

          this.hitZone.position.set(-0.5,0.5,-0.5);
          this.hitZone.material.color.set("pink");

        }
      }
    }
  }

  buildDebug() {
    const geometry = new THREE.SphereGeometry(0.2, 8, 8);
    const material = new THREE.MeshBasicMaterial({ color: 0x8822ff });
    const sphere = new THREE.Mesh(geometry, material);
    this.add(sphere);
  }

  makePlane(color = 0xeeaa22) {
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uMainColor: { value: new THREE.Color(color) },
        uBorderColor: { value: new THREE.Color(this.borderColor) },
        uBorderWidth: { value: this.borderWidth },
      },
      vertexShader: `
        varying vec2 vUv;

        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uMainColor;
        uniform vec3 uBorderColor;
        uniform float uBorderWidth;

        varying vec2 vUv;

        void main() {
          float d = min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y));
          float borderMask = step(d, uBorderWidth);

          vec3 color = mix(uMainColor, uBorderColor, borderMask);
          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });

    const geometry = new THREE.PlaneGeometry(1.0, 1.0);
    const plane = new THREE.Mesh(geometry, mat);
    return plane;
  }

  highlight({ amp = 0.2 }={}) {
    this.planes.forEach((p) => {
      const mat = p.plane?.material;
      if (mat?.uniforms?.uMainColor?.value) {
        p.color?.getHSL(this.cc);
        mat.uniforms.uMainColor.value.setHSL(this.cc.h, this.cc.s, Math.min(this.cc.l + amp, 1));
      }
    });
  }

  revertColor() {
    this.planes.forEach((p) => {
      const mat = p.plane?.material;
      if (mat?.uniforms?.uMainColor?.value) {
        mat.uniforms.uMainColor.value.copy(p.color);
      }
    });
  }

  // add raycast to type of Group, Object3D
  // since default only allows geometry
  // and in this case DONT draw a box over ALL objects
  // cause debuggers are such are apart of that, so we use a custom zone object
  // https://discourse.threejs.org/t/raycast-intersect-group/14038/16
  raycast(raycaster , intersects) {
    console.log(raycaster, "?SFD?.ds,;flmdsf");
    
      let vClosest = new THREE.Vector3();
      // let bIntersect = raycaster.ray.intersectBox(this.hitZone, vClosest) !== null;
      let bIntersect = raycaster.intersectObject(this.hitZone, false, intersects)
      console.log(bIntersect);
      
      // boundingBox
      // if(bIntersect) {
      //     let distance = raycaster.ray.origin.distanceTo(vClosest);
      //     if(distance < raycaster.near || distance > raycaster.far) return;
      //     let intersection = {
      //         distance: distance,
      //         distanceToRay: 0,
      //         point: vClosest,
      //         index: null,
      //         face: null,
      //         object: node
      //     }
      //     intersects.push(intersection);
      // }

  }

    
    
}
