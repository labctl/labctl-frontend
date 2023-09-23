/** Toggle visibility (negative) */
export function toggleVis(v: number) {
  return isNaN(v) || v === 0 ? 2 : -v
}
