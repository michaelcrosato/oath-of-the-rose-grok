/** The play view, in canvas pixels. The camera stays at 1×; tiles grow to cover it. */
export const VIEW_W = 960;
export const VIEW_H = 540;

/**
 * Pixel size of one map cell so the map covers 960×540.
 * A large world uses a closer tile than a fit-everything view, and the camera
 * scroll stays inside the map so the void never shows.
 */
export function tilePixels(cols: number, rows: number): number {
  const fill = Math.max(
    Math.ceil(VIEW_W / Math.max(1, cols)),
    Math.ceil(VIEW_H / Math.max(1, rows)),
  );
  if (cols >= 30 && rows >= 20) return Math.max(fill, 36);
  return fill;
}

/** Camera scroll, in pixels, that keeps the 960×540 view inside the map. */
export function cameraScroll(focusX: number, focusY: number, mapW: number, mapH: number): { x: number; y: number } {
  const maxX = Math.max(0, mapW - VIEW_W);
  const maxY = Math.max(0, mapH - VIEW_H);
  return {
    x: Math.min(maxX, Math.max(0, focusX - VIEW_W / 2)),
    y: Math.min(maxY, Math.max(0, focusY - VIEW_H / 2)),
  };
}
