import Phaser from "phaser";
import { TILESET_KEY, TILE_PX } from "../config/assetKeys";

export interface BuiltMap {
  map: Phaser.Tilemaps.Tilemap;
  ground: Phaser.Tilemaps.TilemapLayer;
  walls: Phaser.Tilemaps.TilemapLayer;
  decor: Phaser.Tilemaps.TilemapLayer;
}

/**
 * Builds a ground/walls/decor tilemap from plain 2D arrays — the same
 * shape used by game/config/mapData.ts for the hub and by every dungeon's
 * own `*MapData.ts`. Originally inlined in WorldScene.create(); pulled out
 * here so dungeon scenes don't duplicate it.
 *
 * Collision rules match the hub: every non-empty walls tile blocks
 * movement, decor tiles only block when explicitly listed in
 * `decorCollideTiles` (most decor — rugs, banners, doors — is walk-through).
 */
export function buildTilemapLayers(
  scene: Phaser.Scene,
  width: number,
  height: number,
  groundLayer: number[][],
  wallsLayer: number[][],
  decorLayer: number[][],
  decorCollideTiles: [number, number][]
): BuiltMap {
  const map = scene.make.tilemap({
    tileWidth: TILE_PX,
    tileHeight: TILE_PX,
    width,
    height,
  });
  const tileset = map.addTilesetImage(TILESET_KEY, TILESET_KEY, TILE_PX, TILE_PX, 0, 0)!;

  const ground = map.createBlankLayer("ground", tileset, 0, 0, width, height)!;
  const walls = map.createBlankLayer("walls", tileset, 0, 0, width, height)!;
  const decor = map.createBlankLayer("decor", tileset, 0, 0, width, height)!;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const g = groundLayer[y][x];
      if (g >= 0) ground.putTileAt(g, x, y);
      const w = wallsLayer[y][x];
      if (w >= 0) walls.putTileAt(w, x, y);
      const d = decorLayer[y][x];
      if (d >= 0) decor.putTileAt(d, x, y);
    }
  }

  walls.setCollisionByExclusion([-1]);

  const decorCollideSet = new Set(decorCollideTiles.map(([x, y]) => `${x},${y}`));
  decor.forEachTile((tile) => {
    if (tile.index >= 0) {
      tile.setCollision(decorCollideSet.has(`${tile.x},${tile.y}`));
    }
  });

  return { map, ground, walls, decor };
}

/**
 * Loads the shared Tiny Dungeon spritesheet, guarded so re-entering a
 * scene (or loading a second scene that shares the tileset) never tries
 * to load it twice.
 */
export function preloadTileset(scene: Phaser.Scene, path: string) {
  if (!scene.textures.exists(TILESET_KEY)) {
    scene.load.spritesheet(TILESET_KEY, path, {
      frameWidth: TILE_PX,
      frameHeight: TILE_PX,
    });
  }
}
