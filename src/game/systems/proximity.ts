import Phaser from "phaser";

export interface ProximityZone<TData = unknown, TId extends string = string> {
  id: TId;
  x: number;
  y: number;
  radius: number;
  data: TData;
}

export function findNearestZone<TData, TId extends string>(
  px: number,
  py: number,
  zones: ProximityZone<TData, TId>[]
): ProximityZone<TData, TId> | null {
  let nearest: ProximityZone<TData, TId> | null = null;
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