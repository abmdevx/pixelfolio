import Phaser from "phaser";

/**
 * Sets up the main camera so the map ALWAYS fills the whole viewport,
 * regardless of screen size.
 *
 * Using a flat `setZoom(baseZoom)` breaks down whenever `viewport / zoom`
 * is larger than the map itself (a small dungeon room, or a big monitor) —
 * the camera hits its bounds and can't scroll any further, leaving the
 * plain background color exposed on the bottom/right of the screen.
 *
 * Instead we pick whichever is bigger: the desired art-style zoom, or the
 * zoom that's just large enough to cover the current canvas size. We also
 * re-run this on every Scale Manager resize, since the RESIZE scale mode
 * changes the canvas size live (e.g. rotating a phone, resizing a window).
 */
export function fitCameraToViewport(
  scene: Phaser.Scene,
  mapPxW: number,
  mapPxH: number,
  baseZoom: number
) {
  const cam = scene.cameras.main;

  const applyZoom = () => {
    const coverZoomX = scene.scale.width / mapPxW;
    const coverZoomY = scene.scale.height / mapPxH;
    cam.setZoom(Math.max(baseZoom, coverZoomX, coverZoomY));
  };

  applyZoom();

  scene.scale.on(Phaser.Scale.Events.RESIZE, applyZoom);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    scene.scale.off(Phaser.Scale.Events.RESIZE, applyZoom);
  });
}
