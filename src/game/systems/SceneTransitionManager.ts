import Phaser from "phaser";

// Fade-to-black scene transitions, shared by the hub (WorldScene) and every
// dungeon scene so "Press E to Enter" never hard-cuts between maps.
//
// Usage:
//   fadeToScene(this, "contact-dungeon");      // on E at an entrance/exit
//   fadeInScene(this);                          // once, at the end of create()

const FADE_MS = 300;
const FADE_COLOR: [number, number, number] = [0, 0, 0];

/**
 * Fades the current scene's camera to black, then starts the target scene.
 * Pass `data` through exactly like `scene.start(key, data)` would.
 */
export function fadeToScene(
  scene: Phaser.Scene,
  targetKey: string,
  data?: Record<string, unknown>
) {
  const cam = scene.cameras.main;
  cam.fadeOut(FADE_MS, ...FADE_COLOR);
  cam.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
    scene.scene.start(targetKey, data);
  });
}

/**
 * Fades the current scene's camera in from black. Call once at the end of
 * every scene's `create()` so entering a map never pops in abruptly —
 * including the very first load.
 */
export function fadeInScene(scene: Phaser.Scene) {
  scene.cameras.main.fadeIn(FADE_MS, ...FADE_COLOR);
}
