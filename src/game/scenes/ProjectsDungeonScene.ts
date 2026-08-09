import Phaser from "phaser";
import { TILESET_KEY, TILESET_PATH, TILE_PX, TILE } from "../config/assetKeys";
import {
  ROOM_WIDTH,
  ROOM_HEIGHT,
  groundLayer,
  wallsLayer,
  decorLayer,
  decorCollideTiles,
  chestTiles,
  ghostTile,
  entrySpawnTile,
  exitZoneTile,
} from "../config/projectsDungeonMapData";
import { buildTilemapLayers, preloadTileset } from "../systems/TilemapBuilder";
import { fitCameraToViewport } from "../systems/CameraFit";
import { findNearestZone, type ProximityZone } from "../systems/proximity";
import { fadeToScene, fadeInScene } from "../systems/SceneTransitionManager";
import { Player } from "../entities/Player";
import { gameEvents, type NearbyInteractable } from "../systems/events";
import { projectsContent, vaultGhostIntroDialogue, projectChestDialogue } from "@/data/portfolio";

type RoomZoneData =
  | { kind: "chest"; label: string; projectIndex: number }
  | { kind: "talk"; label: string }
  | { kind: "exit"; label: string };

/** Module-level (not instance-level) so the ghost's intro only ever
 *  auto-plays once per page load — re-entering the vault later in the
 *  same session won't repeat it, since Phaser tears down and rebuilds
 *  this scene's instance state (including anything on `this`) every time
 *  the scene restarts, but this module stays loaded the whole session. */
let hasPlayedGhostIntro = false;

/**
 * "The Treasure Vault" — the Projects section as an actual place: one
 * treasure chest per project, plus a ghost who explains the room the
 * first time you walk in. Second dungeon of the migration (see
 * ContactDungeonScene.ts for the shape every dungeon follows).
 */
export class ProjectsDungeonScene extends Phaser.Scene {
  private player!: Player;
  private eKey!: Phaser.Input.Keyboard.Key;
  private controlsEnabled = true;
  private zones: ProximityZone<RoomZoneData>[] = [];
  private currentZone: ProximityZone<RoomZoneData> | null = null;

  constructor() {
    super("projects-dungeon");
  }

  preload() {
    preloadTileset(this, TILESET_PATH);
  }

  create() {
    // Phaser reuses this Scene instance every time the dungeon is
    // (re)entered rather than constructing a fresh one, so instance state
    // left over from a previous visit has to be explicitly reset here.
    this.controlsEnabled = true;
    this.currentZone = null;

    const mapPxW = ROOM_WIDTH * TILE_PX;
    const mapPxH = ROOM_HEIGHT * TILE_PX;

    const { walls, decor } = buildTilemapLayers(
      this,
      ROOM_WIDTH,
      ROOM_HEIGHT,
      groundLayer,
      wallsLayer,
      decorLayer,
      decorCollideTiles
    );

    this.physics.world.setBounds(0, 0, mapPxW, mapPxH);

    // ---- player ----
    const spawnX = entrySpawnTile.x * TILE_PX + TILE_PX / 2;
    const spawnY = entrySpawnTile.y * TILE_PX + TILE_PX / 2;
    this.player = new Player(this, spawnX, spawnY);
    this.physics.add.collider(this.player, walls);
    this.physics.add.collider(this.player, decor);

    // ---- vault ghost ----
    const ghostX = ghostTile.x * TILE_PX + TILE_PX / 2;
    const ghostY = ghostTile.y * TILE_PX + TILE_PX / 2;
    const ghost = this.add.sprite(ghostX, ghostY, TILESET_KEY, TILE.GHOST);
    ghost.setOrigin(0.5, 0.75);
    ghost.setDepth(5);
    this.tweens.add({
      targets: ghost,
      y: ghostY - 3,
      duration: 1100,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // ---- one treasure chest per project ----
    const chestZones: ProximityZone<RoomZoneData>[] = chestTiles.map((tile, i) => {
      const px = tile.x * TILE_PX + TILE_PX / 2;
      const py = tile.y * TILE_PX + TILE_PX / 2;
      const sprite = this.add.sprite(px, py, TILESET_KEY, TILE.CHEST);
      sprite.setOrigin(0.5, 0.75);
      sprite.setDepth(5);
      return {
        id: `chest-${i}`,
        x: px,
        y: py,
        radius: 28,
        data: {
          kind: "chest",
          label: projectsContent[i]?.name ?? "Chest",
          projectIndex: i,
        },
      };
    });

    // ---- interaction zones: talk to the ghost, open a chest, or leave ----
    this.zones = [
      {
        id: "ghost",
        x: ghostX,
        y: ghostY,
        radius: 34,
        data: { kind: "talk", label: "Vault Ghost" },
      },
      ...chestZones,
      {
        id: "exit",
        x: exitZoneTile.x * TILE_PX + TILE_PX / 2,
        y: exitZoneTile.y * TILE_PX + TILE_PX / 2,
        radius: 28,
        data: { kind: "exit", label: "Village" },
      },
    ];

    // ---- camera (same framing as the hub) ----
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

    // ---- ghost's intro: plays once automatically, shortly after the
    // fade-in finishes so it doesn't pop in over the transition ----
    if (!hasPlayedGhostIntro) {
      hasPlayedGhostIntro = true;
      this.time.delayedCall(400, () => {
        gameEvents.emit("dialogue-open", vaultGhostIntroDialogue);
      });
    }
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
   *  on-screen E button (the "interact-press" event). */
  private handleInteract = () => {
    if (!this.controlsEnabled || !this.currentZone) return;

    const data = this.currentZone.data;

    if (data.kind === "talk") {
      gameEvents.emit("dialogue-open", vaultGhostIntroDialogue);
    } else if (data.kind === "chest") {
      gameEvents.emit("dialogue-open", projectChestDialogue(data.projectIndex));
    } else {
      // "exit" — leave the dungeon and fade back to the hub
      this.controlsEnabled = false;
      this.player.setControlsEnabled(false);
      fadeToScene(this, "world");
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
            label: nearest.data.label,
            kind: nearest.data.kind === "chest" ? "chest" : nearest.data.kind,
          }
        : null;
      gameEvents.emit("zone-near", payload);
    }

    if (this.controlsEnabled && this.currentZone && Phaser.Input.Keyboard.JustDown(this.eKey)) {
      this.handleInteract();
    }
  }
}
