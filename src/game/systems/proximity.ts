import Phaser from "phaser";

/**
 * A circular interaction zone in world (pixel) space, generic over
 * whatever metadata a scene wants to attach (a LocationId + zone kind in
 * WorldScene, an NPC/exit descriptor in a dungeon scene, etc).
 */
export interface ProximityZone<T> {
  id: string;
  x: number;
  y: number;
  radius: number;
  data: T;
}

/**
 * Returns the closest zone the given point is inside, or null if none.
 * When multiple zones overlap, the nearest center wins.
 *
 * Used every frame by scene `update()` loops (cheap: usually just a
 * handful of zones), so this stays a plain function rather than a class —
 * no state to own, just distance math.
 */
export function findNearestZone<T>(
  px: number,
  py: number,
  zones: ProximityZone<T>[]
): ProximityZone<T> | null {
  let nearest: ProximityZone<T> | null = null;
  let nearestDist = Infinity;

  for (const zone of zones) {
    const dist = Phaser.Math.Distance.Between(px, py, zone.x, zone.y);
    if (dist <= zone.radius && dist < nearestDist) {
      nearest = zone;
      nearestDist = dist;
    }
  }

  return nearest;
}
