// Layout for the Contact dungeon — "The Message Post".
//
// Unlike game/config/mapData.ts (the hub, hand-tuned from a generator
// script), this is a small, simple interior room, so it's built
// programmatically below rather than hand-authored as literal arrays.
// It follows the exact same 2D-array contract consumed by
// game/systems/TilemapBuilder.ts, so it drops into a Scene the same way
// the hub's map data does.
//
// Tile indices refer to public/assets/tiny-dungeon/tiles.png (12x11 grid).

export const ROOM_WIDTH = 14;
export const ROOM_HEIGHT = 10;

const WALL_CYCLE = [36, 37, 38]; // same brick cycle the hub's outer wall uses
const CORNER_TILE = 39; // same pillar tile the hub uses for its side walls
const FLOOR_TILE = 0; // plain dungeon floor
const DOOR_TILES: [number, number] = [46, 47]; // left/right halves of the double door

// Door gap sits in the middle of the bottom wall (two tiles wide).
const DOOR_X0 = 6;
const DOOR_X1 = 7;

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

/** Messenger NPC — reuses TILE.CONTACT_NPC (the same villager sprite the
 *  hub already places outside the old contact zone). */
export const npcTile = { x: Math.floor(ROOM_WIDTH / 2), y: 3 };

/** Where the player appears when entering from the hub — just inside the
 *  door, facing up into the room. */
export const entrySpawnTile = { x: (DOOR_X0 + DOOR_X1) / 2, y: ROOM_HEIGHT - 3 };

/** Proximity zone in front of the door — pressing E here leaves the
 *  dungeon and fades back to the hub. */
export const exitZoneTile = { x: (DOOR_X0 + DOOR_X1) / 2, y: ROOM_HEIGHT - 2 };
