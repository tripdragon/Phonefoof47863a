import * as THREE from "three";

const VERTEX_SHADER = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  uniform vec3 faceColor;
  uniform vec3 borderColor;
  uniform float borderWidth;
  varying vec2 vUv;

  void main() {
    float edgeDistance = min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y));
    float inside = smoothstep(borderWidth, borderWidth + fwidth(edgeDistance), edgeDistance);
    gl_FragColor = vec4(mix(borderColor, faceColor, inside), 1.0);
  }
`;

/** A single independently shaded sticker mesh owned by a Piece. */
export class Face extends THREE.Mesh {
  constructor({ name, size, color, borderColor, axis, sign = 1, rotation = [0, 0, 0] }) {
    const geometry = new THREE.PlaneGeometry(size, size);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        faceColor: { value: new THREE.Color(color) },
        borderColor: { value: new THREE.Color(borderColor) },
        borderWidth: { value: 0.075 },
      },
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      side: THREE.FrontSide,
    });
    super(geometry, material);

    this.name = `${name}-face`;
    this.faceName = name;
    this.axis = axis;
    this.sign = sign;
    this.rotation.set(...rotation);
    this.position[axis] = sign * size / 2;
    this.userData.face = name;
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
  }
}
