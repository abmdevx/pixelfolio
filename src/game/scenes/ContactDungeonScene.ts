import Phaser from "phaser";
import { TILESET_KEY, TILESET_PATH, TILE_PX, TILE } from "../config/assetKeys";
import {
  ROOM_WIDTH,
  ROOM_HEIGHT,
  groundLayer,
  wallsLayer,
  decorLayer,
  decorCollideTiles,
  npcTile,
  entrySpawnTile,
  exitZoneTile,
} from "../config/contactDungeonMapData";
import { buildTilemapLayers, preloadTileset } from "../systems/TilemapBuilder";
import { fitCameraToViewport } from "../systems/CameraFit";
import { findNearestZone, type ProximityZone } from "../systems/proximity";
import { fadeToScene, fadeInScene } from "../systems/SceneTransitionManager";
import { Player } from "../entities/Player";
import { gameEvents, type NearbyInteractable } from "../systems/events";
import { contactDialogue } from "@/data/portfolio";

interface RoomZoneData {
  label: string;
  kind: "talk" | "exit";
}

/**
 * "The Message Post" — the Contact section as an actual place instead of
 * a panel. First dungeon of the migration described in the phased plan;
 * every future dungeon (About/Skills/Experience/Projects) follows this
 * same shape: build map -> place player -> place interactables -> wire
 * zone-near/E -> fade back to "world" on exit.
 */
export class ContactDungeonScene extends Phaser.Scene {
  private player!: Player;
  private eKey!: Phaser.Input.Keyboard.Key;
  private controlsEnabled = true;
  private zones: ProximityZone<RoomZoneData>[] = [];
  private currentZone: ProximityZone<RoomZoneData> | null = null;

  constructor() {
    super("contact-dungeon");
  }

  preload() {
    preloadTileset(this, TILESET_PATH);
  }

  create() {
    // Phaser reuses this Scene instance every time the dungeon is
    // (re)entered rather than constructing a fresh one, so instance state
    // left over from a previous visit — like controls being disabled right
    // before the last exit — has to be explicitly reset here.
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

    // ---- messenger NPC ----
    const npcX = npcTile.x * TILE_PX + TILE_PX / 2;
    const npcY = npcTile.y * TILE_PX + TILE_PX / 2;
    const npc = this.add.sprite(npcX, npcY, TILESET_KEY, TILE.CONTACT_NPC);
    npc.setOrigin(0.5, 0.75);
    npc.setDepth(5);
    this.tweens.add({
      targets: npc,
      y: npcY - 2,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // ---- interaction zones: talk to the messenger, or leave through the door ----
    this.zones = [
      {
        id: "messenger",
        x: npcX,
        y: npcY,
        radius: 34,
        data: { label: "Messenger", kind: "talk" },
      },
      {
        id: "exit",
        x: exitZoneTile.x * TILE_PX + TILE_PX / 2,
        y: exitZoneTile.y * TILE_PX + TILE_PX / 2,
        radius: 28,
        data: { label: "Village", kind: "exit" },
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

    if (this.currentZone.data.kind === "talk") {
      gameEvents.emit("dialogue-open", contactDialogue);
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
        ? { id: nearest.id, label: nearest.data.label, kind: nearest.data.kind }
        : null;
      gameEvents.emit("zone-near", payload);
    }

    if (this.controlsEnabled && this.currentZone && Phaser.Input.Keyboard.JustDown(this.eKey)) {
      this.handleInteract();
    }
  }
}
