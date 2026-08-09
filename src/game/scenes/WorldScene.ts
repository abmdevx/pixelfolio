import Phaser from "phaser";
import { TILESET_KEY, TILESET_PATH, TILE_PX } from "../config/assetKeys";
import {
  MAP_WIDTH,
  MAP_HEIGHT,
  groundLayer,
  wallsLayer,
  decorLayer,
  decorCollideTiles,
  worldEntities,
  zoneDefs,
  playerSpawnTile,
  type ZoneDef,
} from "../config/mapData";
import { Player } from "../entities/Player";
import { gameEvents, type NearbyInteractable } from "../systems/events";
import { locationMeta } from "@/data/portfolio";
import { buildTilemapLayers, preloadTileset } from "../systems/TilemapBuilder";
import { fitCameraToViewport } from "../systems/CameraFit";
import { findNearestZone, type ProximityZone } from "../systems/proximity";
import { fadeToScene, fadeInScene } from "../systems/SceneTransitionManager";

/** Registry key used to hand the player's hub position off to a dungeon
 *  scene and back again, so returning from a dungeon spawns you where you
 *  left rather than back at the map's default entrance. */
const HUB_RETURN_POS_KEY = "hubReturnPos";

export class WorldScene extends Phaser.Scene {
  private player!: Player;
  private currentZone: ProximityZone<ZoneDef, ZoneDef["id"]> | null = null;
  private zones: ProximityZone<ZoneDef, ZoneDef["id"]>[] = [];
  private eKey!: Phaser.Input.Keyboard.Key;
  private controlsEnabled = true;
  private signTexts: Phaser.GameObjects.Text[] = [];

  constructor() {
    super("world");
  }

  preload() {
    preloadTileset(this, TILESET_PATH);
  }

  create() {
    // Phaser reuses this Scene instance every time the hub is (re)entered
    // rather than constructing a fresh one, so instance state left over
    // from a previous visit — like controls being disabled right before
    // the player walked into a dungeon — has to be explicitly reset here.
    // Without this, coming back from a dungeon leaves the player frozen.
    this.controlsEnabled = true;
    this.currentZone = null;

    const mapPxW = MAP_WIDTH * TILE_PX;
    const mapPxH = MAP_HEIGHT * TILE_PX;

    // ---- tilemap built from plain 2D arrays (see game/config/mapData.ts) ----
    const { walls, decor } = buildTilemapLayers(
      this,
      MAP_WIDTH,
      MAP_HEIGHT,
      groundLayer,
      wallsLayer,
      decorLayer,
      decorCollideTiles
    );

    this.physics.world.setBounds(0, 0, mapPxW, mapPxH);

    // ---- player ----
    // Spawn back where the player left the hub if they're returning from a
    // dungeon (see the "exit" branch below); otherwise use the default
    // spawn point (first-ever load).
    const returnPos = this.registry.get(HUB_RETURN_POS_KEY) as
      | { x: number; y: number }
      | undefined;
    const spawnX = returnPos ? returnPos.x : playerSpawnTile.x * TILE_PX + TILE_PX / 2;
    const spawnY = returnPos ? returnPos.y : playerSpawnTile.y * TILE_PX + TILE_PX / 2;
    this.registry.remove(HUB_RETURN_POS_KEY);

    this.player = new Player(this, spawnX, spawnY);

    this.physics.add.collider(this.player, walls);
    this.physics.add.collider(this.player, decor);

    // ---- static world entities (NPCs & props layered above ground/decor) ----
    for (const e of worldEntities) {
      const px = e.x * TILE_PX + TILE_PX / 2;
      const py = e.y * TILE_PX + TILE_PX / 2;
      const spr = this.add.sprite(px, py, TILESET_KEY, e.tile);
      spr.setOrigin(0.5, 0.75);
      spr.setFlipX(!!e.flip);
      spr.setDepth(5);
      if (e.type === "npc") {
        this.tweens.add({
          targets: spr,
          y: py - 2,
          duration: 900 + Math.random() * 400,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        });
      }
    }

    // ---- interaction zones (signs are visual only — content/behavior
    // lives in zoneDefs: 'panel' zones still open a React panel, 'dungeon'
    // zones fade into their own Scene) ----
    this.zones = zoneDefs.map((z) => ({
      id: z.id,
      x: z.tileX * TILE_PX + TILE_PX / 2,
      y: z.tileY * TILE_PX + TILE_PX / 2,
      radius: z.radius,
      data: z,
    }));

    for (const z of this.zones) {
      const label = locationMeta[z.id].label.toUpperCase();
      const text = this.add
        .text(z.x, z.y - 30, label, {
          fontFamily: "monospace",
          fontSize: "9px",
          color: "#f4ecd8",
          backgroundColor: "#1a1523",
          padding: { x: 4, y: 2 },
        })
        .setOrigin(0.5, 1)
        .setDepth(20);
      this.signTexts.push(text);
    }

    // ---- camera ----
    this.cameras.main.setBounds(0, 0, mapPxW, mapPxH);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    fitCameraToViewport(this, mapPxW, mapPxH, 2.6);
    this.cameras.main.setRoundPixels(true);

    // ---- input ----
    this.eKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    gameEvents.on("panel-opened", this.handlePanelOpened);
    gameEvents.on("panel-closed", this.handlePanelClosed);
    gameEvents.on("interact-press", this.handleInteract);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      gameEvents.off("panel-opened", this.handlePanelOpened);
      gameEvents.off("panel-closed", this.handlePanelClosed);
      gameEvents.off("interact-press", this.handleInteract);
      gameEvents.emit("zone-near", null);
    });

    fadeInScene(this);
  }

  private handlePanelOpened = () => {
    this.controlsEnabled = false;
    this.player.setControlsEnabled(false);
  };

  private handlePanelClosed = () => {
    this.controlsEnabled = true;
    this.player.setControlsEnabled(true);
  };

  /** Shared by the desktop E key (JustDown, in update()) and the mobile
   *  on-screen E button (the "interact-press" event) so both trigger the
   *  exact same behavior for whatever zone the player is currently near. */
  private handleInteract = () => {
    if (!this.controlsEnabled || !this.currentZone) return;

    const zoneDef = this.currentZone.data;

    if (zoneDef.kind === "dungeon" && zoneDef.targetScene) {
      // Remember exactly where the player is standing so returning from
      // the dungeon spawns them back at this same spot.
      this.registry.set(HUB_RETURN_POS_KEY, { x: this.player.x, y: this.player.y });
      this.controlsEnabled = false;
      this.player.setControlsEnabled(false);
      fadeToScene(this, zoneDef.targetScene);
    } else {
      gameEvents.emit("zone-interact", zoneDef.id);
    }
  };

  /** Called by the React MobileControls overlay */
  setTouchVector(x: number, y: number) {
    this.player.touchVector = { x, y };
  }

  update() {
    if (this.controlsEnabled) {
      this.player.update();
    }

    const nearest = findNearestZone(this.player.x, this.player.y, this.zones);

    if ((nearest?.id ?? null) !== (this.currentZone?.id ?? null)) {
      this.currentZone = nearest;
      const payload: NearbyInteractable | null = nearest
        ? {
            id: nearest.id,
            label: locationMeta[nearest.data.id].label,
            kind: nearest.data.kind === "dungeon" ? "dungeon-entrance" : "panel",
          }
        : null;
      gameEvents.emit("zone-near", payload);
    }

    if (this.controlsEnabled && this.currentZone && Phaser.Input.Keyboard.JustDown(this.eKey)) {
      this.handleInteract();
    }
  }
}
