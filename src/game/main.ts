import Phaser from "phaser";
import { WorldScene } from "./scenes/WorldScene";
import { ContactDungeonScene } from "./scenes/ContactDungeonScene";
import { ProjectsDungeonScene } from "./scenes/ProjectsDungeonScene";

export function createGame(parent: HTMLDivElement): Phaser.Game {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent,
    pixelArt: true,
    roundPixels: true,
    backgroundColor: "#120f16",
    scale: {
      mode: Phaser.Scale.RESIZE,
      width: "100%",
      height: "100%",
    },
    physics: {
      default: "arcade",
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false,
      },
    },
    // Every dungeon scene gets added here as it's built (see the phased
    // plan) — WorldScene fades into whichever one a zone's `targetScene`
    // points at (game/config/mapData.ts).
    scene: [WorldScene, ContactDungeonScene, ProjectsDungeonScene],
  };

  return new Phaser.Game(config);
}
