/**
 * Coordinate transformation utilities for A-Frame
 */

/**
 * Transform canvas coordinates to A-Frame world coordinates
 */
export function canvasToWorld(canvasX: number, canvasY: number): { x: number; y: number; z: number } {
  const canvasWidth = 640;
  const canvasHeight = 480;
  const planeWidth = 3.5;
  const planeHeight = 2.8;
  const planePos = { x: 0, y: 2, z: -3.3 }; // Slightly in front of video
  
  const normX = (canvasX / canvasWidth) - 0.5;
  const normY = 0.5 - (canvasY / canvasHeight);
  
  return {
    x: planePos.x + (normX * planeWidth),
    y: planePos.y + (normY * planeHeight),
    z: planePos.z
  };
}

/**
 * Calculate centroid of a bounding box
 */
export function calculateCentroid(box: { x: number; y: number; width: number; height: number }): { x: number; y: number } {
  return {
    x: box.x + box.width / 2,
    y: box.y + box.height / 2
  };
}

/**
 * Calculate distance between two points
 */
export function distance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}
