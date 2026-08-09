// Central registry of asset keys and tile indices from the Kenney
// "Tiny Dungeon" tileset (public/assets/tiny-dungeon/tiles.png).
// The sheet is a 12 x 11 grid of 16x16 tiles (132 tiles total).

export const TILESET_KEY = "tiny-dungeon-tiles";
export const TILESET_PATH = "/assets/tiny-dungeon/tiles.png";

export const TILESET_COLUMNS = 12;
export const TILESET_ROWS = 11;
export const TILE_PX = 16;

// A few named tiles used directly by game code (player sprite, etc).
// Most world tiles are baked into mapData.ts already.
export const TILE = {
  PLAYER: 85, // human villager — the controllable hero
  ABOUT_NPC: 84, // wizard
  SKILLS_NPC: 96, // knight
  PROJECTS_NPC: 87, // dwarf curator — stands outside the Treasure Vault in the hub
  EXPERIENCE_NPC: 97, // armored soldier
  CONTACT_NPC: 86, // villager
  CHEST: 89, // closed treasure chest — one per project inside the Treasure Vault
  GHOST: 121, // vault ghost — the Treasure Vault's guide NPC
} as const;
