/**
 * Clamps a number between a minimum and maximum value
 * @param val The number to clamp
 * @param min The minimum value
 * @param max The maximum value
 * @returns The clamped value
 */
export const clamp = (val: number, min: number, max: number) =>
  Math.min(Math.max(val, min), max)
