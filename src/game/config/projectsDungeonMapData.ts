// Layout for the Projects dungeon — "The Treasure Vault".
//
// Same programmatic-room approach as contactDungeonMapData.ts: built from
// plain 2D arrays so it drops into a Scene via TilemapBuilder exactly the
// way the hub and the Contact dungeon do.
//
// Tile indices refer to public/assets/tiny-dungeon/tiles.png (12x11 grid).

import { projectsContent } from "@/data/portfolio";

export const ROOM_WIDTH = 16;
export const ROOM_HEIGHT = 11;

const WALL_CYCLE = [36, 37, 38]; // same brick cycle the hub's outer wall uses
const CORNER_TILE = 39; // same pillar tile the hub uses for its side walls
const FLOOR_TILE = 0; // plain dungeon floor
const DOOR_TILES: [number, number] = [46, 47]; // left/right halves of the double door

// Door gap sits in the middle of the bottom wall (two tiles wide).
const DOOR_X0 = 7;
const DOOR_X1 = 8;

function emptyGrid(fill: number): number[][] {
  return Array.from({ length: ROOM_HEIGHT }, () => Array<number>(ROOM_WIDTH).fill(fill));
}

export const groundLayer: number[][] = emptyGrid(FLOOR_TILE);

export const wallsLayer: number[][] = (() => {
  const grid = emptyGrid(-1);

  for (let x = 0; x < ROOM_WIDTH; x++) {
    grid[0][x] = WALL_CYCLE[x % WALL_CYCLE.length];
    const isDoorGap = x === DOOR_X0 || x === DOOR_X1;
    grid[ROOM_HEIGHT - 1][x] = isDoorGap ? -1 : WALL_CYCLE[x % WALL_CYCLE.length];
  }

  for (let y = 0; y < ROOM_HEIGHT; y++) {
    grid[y][0] = CORNER_TILE;
    grid[y][ROOM_WIDTH - 1] = CORNER_TILE;
  }

  return grid;
})();

/** One chest per project, laid out in a single row so every chest reads
 *  clearly at a glance. Positions are hand-picked to stay clear of the
 *  ghost and the door, and to spread evenly regardless of project count. */
export const chestTiles: { x: number; y: number }[] = (() => {
  const count = projectsContent.length;
  const usableX0 = 3;
  const usableX1 = ROOM_WIDTH - 4; // inclusive
  const y = 6;

  if (count === 1) return [{ x: Math.round((usableX0 + usableX1) / 2), y }];

  const step = (usableX1 - usableX0) / (count - 1);
  return Array.from({ length: count }, (_, i) => ({
    x: Math.round(usableX0 + step * i),
    y,
  }));
})();

export const decorLayer: number[][] = (() => {
  const grid = emptyGrid(-1);
  // Visual double door sitting in the walkable gap — the walkway itself
  // is already open in wallsLayer above, but the door tiles are marked
  // solid below (decorCollideTiles) so the player stops in front of it
  // instead of walking onto/through the door graphic.
  grid[ROOM_HEIGHT - 1][DOOR_X0] = DOOR_TILES[0];
  grid[ROOM_HEIGHT - 1][DOOR_X1] = DOOR_TILES[1];
  return grid;
})();

// The door tiles block movement — this keeps the player standing at a
// fixed spot just inside the room (right where exitZoneTile is) instead
// of being able to walk up onto the door artwork itself.
export const decorCollideTiles: [number, number][] = [
  [DOOR_X0, ROOM_HEIGHT - 1],
  [DOOR_X1, ROOM_HEIGHT - 1],
];

/** Vault Ghost — greets the player automatically on first entry, and can
 *  be talked to again afterward near the back of the room. */
export const ghostTile = { x: Math.floor(ROOM_WIDTH / 2), y: 3 };

/** Where the player appears when entering from the hub — just inside the
 *  door, facing up into the room. */
export const entrySpawnTile = { x: (DOOR_X0 + DOOR_X1) / 2, y: ROOM_HEIGHT - 3 };

/** Proximity zone in front of the door — pressing E here leaves the
 *  dungeon and fades back to the hub. */
export const exitZoneTile = { x: (DOOR_X0 + DOOR_X1) / 2, y: ROOM_HEIGHT - 2 };
