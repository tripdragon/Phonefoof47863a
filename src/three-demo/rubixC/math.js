export function smoothstep(t) {
  return t * t * (3 - 2 * t);
}

export function remapPiToPI2(v) {
  let y = v % (Math.PI * 2);
  if (y < 0) y += Math.PI * 2;
  return y;
}
