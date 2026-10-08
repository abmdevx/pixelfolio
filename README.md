# Pixel Portfolio

An explorable pixel-art portfolio built by **Abdullah Butt**. Instead of
scrolling through a conventional portfolio, walk through a Tiny Dungeon world
and discover each section in context.

The project combines **Next.js (App Router)**, **React**, **TypeScript**,
**Tailwind CSS**, and **Phaser 3**. React renders the portfolio content and
overlays; Phaser handles the playable world, movement, collisions, camera,
scene transitions, and in-world interactions.

## Features

- A playable hub world with five portfolio locations: About Me, Skills,
	Projects, Experience, and Contact
- Dedicated Projects and Contact dungeon scenes with NPC, prop, chest, and
	dialogue interactions
- React portfolio panels for About Me, Skills, and Experience
- Project detail cards and external links for GitHub projects
- Keyboard controls plus automatic touch controls for mobile devices
- Client-only Phaser loading with a loading state for the Next.js app
- Centralized portfolio content that can be changed without editing game logic

## Getting started

### Requirements

- Node.js 20 or newer
- npm

### Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in a browser.

### Production

```bash
npm run build
npm run start
```

The available npm scripts are:

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run the configured Next.js lint command |

## Controls

| Action | Keyboard | Touch |
| --- | --- | --- |
| Move | `W` `A` `S` `D` or arrow keys | On-screen D-pad |
| Interact | `E` when near a landmark or character | On-screen interact button |
| Close a panel or dialogue | `Esc` | Close button |

Walk toward a landmark until the interaction prompt appears. The About Me,
Skills, and Experience landmarks open React panels. Projects and Contact move
you into their dedicated dungeon scenes, where nearby characters and objects
open dialogue choices.

## Customization

Most personal content lives in [`src/data/portfolio.ts`](src/data/portfolio.ts):

- `aboutContent` controls the name, role, bio, tagline, and technologies
- `skillsContent` controls the grouped skills and their icon keys
- `projectsContent` controls project descriptions, technologies, and links
- `experienceContent` controls roles, companies, dates, and achievements
- `contactContent` controls email and social links
- Dialogue content and location labels are also defined in this file

To reshape the playable world, edit [`src/game/config/mapData.ts`](src/game/config/mapData.ts)
and the scene-specific map data files. Tile indices refer to the 12×11 grid of
16×16 tiles in `public/assets/tiny-dungeon/tiles.png`.

## Project structure

```
src/
├── app/                    Next.js App Router entry and global styles
├── components/
│   ├── game/               Phaser mount point and dialogue UI
│   ├── portfolio/          React portfolio panels and project details
│   └── ui/                 Loader, interaction prompt, and mobile controls
├── data/portfolio.ts       Editable portfolio and dialogue content
└── game/
	├── main.ts             Phaser.Game configuration
	├── scenes/             Hub and dedicated dungeon scenes
	├── entities/           Player movement and animation
	├── systems/            Events, proximity, camera, and transitions
	└── config/              Maps, asset keys, and dungeon data
```

## Assets and licensing

The world uses Kenney's free **Tiny Dungeon** tileset from
`public/assets/tiny-dungeon/`. Its license is included in
[`public/assets/tiny-dungeon/LICENSE.txt`](public/assets/tiny-dungeon/LICENSE).

The pack contains static single-frame characters rather than walk-cycle sprite
strips, so player idle and walking motion is produced procedurally with a
squash/stretch bob and horizontal flipping.
