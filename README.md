# Pixel Portfolio — an explorable Tiny Dungeon world

A developer portfolio you walk around instead of scroll through, built with
**Next.js (App Router) + TypeScript + Tailwind CSS** for the UI shell and
**Phaser 3** for the interactive pixel-art world. All visuals come from
Kenney's free "Tiny Dungeon" tileset (`public/assets/tiny-dungeon/tiles.png`,
CC0 — see `LICENSE.txt` next to it) — no other art was added.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000. Move with **WASD** or the **arrow keys**; on
touch devices a D-pad + interact button appear automatically. Walk up to any
of the five glowing shrines, and press **E** (or tap the on-screen E button)
to open that section.

```bash
npm run build && npm run start   # production build
```

## Make it yours

Everything you'd actually want to edit lives in **`src/data/portfolio.ts`** —
name, bio, skills, projects, experience, and contact links are all plain
data, separate from the game/UI code. Edit that one file and the panels
update automatically.

Want to reshape the world itself (room placement, decorations, which NPC
stands where)? Edit `src/game/config/mapData.ts` — it's a plain set of 2D
tile arrays plus a list of entities/zones, generated once from a small
Python layout script and then hand-tuned. Tile indices refer to
`public/assets/tiny-dungeon/tiles.png`, a 12×11 grid of 16×16 tiles.

## Project structure

```
src/
├── app/                  Next.js App Router entry (page.tsx wires game <-> UI)
├── components/
│   ├── game/PhaserGame.tsx     client-only mount point for the Phaser canvas
│   ├── portfolio/*Panel.tsx    the five React content panels + shared shell
│   └── ui/                     "[E] Interact" prompt, mobile D-pad
├── game/
│   ├── main.ts                Phaser.Game config
│   ├── scenes/WorldScene.ts   tilemap build, collisions, camera, zones
│   ├── entities/Player.ts     movement + procedural idle/walk animation
│   ├── systems/events.ts      tiny event bus connecting Phaser <-> React
│   └── config/                map data + tile/asset key constants
└── data/portfolio.ts     <- all your actual content lives here
```

## Notes on the assets

The Tiny Dungeon pack ships static single-frame characters (no walk-cycle
sprite strips), so the player's "walking" and "idle" motion is done
procedurally — a squash/stretch bob plus a left/right flip — rather than
frame-by-frame animation. Everything else (floors, walls, doors, props,
NPC sprites, the circular shrine motif marking each of the five sections)
is combined directly from the provided tileset.
