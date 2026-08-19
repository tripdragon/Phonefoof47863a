const CLASSIC_COLORS = Object.freeze({
  right: 0xb71234,
  left: 0xff5800,
  top: 0xffffff,
  bottom: 0xffd500,
  front: 0x009b48,
  back: 0x0046ad,
});

const A_BIT_NICER_COLORS = Object.freeze({
  right: 0xef3154,
  left: 0xff7a1a,
  top: 0xffffff,
  bottom: 0xffe13b,
  front: 0x16c96a,
  back: 0x2478e8,
});

/** Color palettes available to every RubixMega piece. */
export const RUBIX_THEMES = Object.freeze({
  classic: CLASSIC_COLORS,
  "a bit nicer": A_BIT_NICER_COLORS,
});

export const DEFAULT_RUBIX_THEME = RUBIX_THEMES["a bit nicer"];
export { A_BIT_NICER_COLORS, CLASSIC_COLORS };
