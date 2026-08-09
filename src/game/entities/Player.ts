import Phaser from "phaser";
import { TILESET_KEY, TILE } from "../config/assetKeys";

const SPEED = 118;

/**
 * The controllable hero.
 *
 * The Tiny Dungeon tileset only ships a single static frame per
 * character (no walk/idle animation strips), so movement "animation"
 * is faked procedurally: a gentle squash-and-stretch bob while
 * walking, a slower idle breathing bob while still, and a horizontal
 * flip so the sprite faces the direction it's moving.
 */
export class Player extends Phaser.Physics.Arcade.Sprite {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyW!: Phaser.Input.Keyboard.Key;
  private keyA!: Phaser.Input.Keyboard.Key;
  private keyS!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;
  private bobTween?: Phaser.Tweens.Tween;
  private facing: "left" | "right" = "right";
  private controlsEnabled = true;
  /** external override used by on-screen mobile joystick */
  public touchVector: { x: number; y: number } = { x: 0, y: 0 };

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, TILESET_KEY, TILE.PLAYER);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0.5, 0.75);
    this.setDepth(10);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(10, 8);
    body.setOffset(3, 10);
    body.setCollideWorldBounds(true);

    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.keyW = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    this.startIdleBob();
  }

  setControlsEnabled(enabled: boolean) {
    this.controlsEnabled = enabled;
    if (!enabled) {
      (this.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
    }
  }

  private startIdleBob() {
    this.bobTween?.stop();
    this.setScale(1, 1);
    this.bobTween = this.scene.tweens.add({
      targets: this,
      scaleY: { from: 1, to: 0.97 },
      scaleX: { from: 1, to: 1.02 },
      duration: 620,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  private startWalkBob() {
    this.bobTween?.stop();
    this.setScale(1, 1);
    this.bobTween = this.scene.tweens.add({
      targets: this,
      scaleY: { from: 0.94, to: 1.04 },
      scaleX: { from: 1.04, to: 0.96 },
      duration: 160,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  update() {
    const body = this.body as Phaser.Physics.Arcade.Body;

    if (!this.controlsEnabled) {
      body.setVelocity(0, 0);
      return;
    }

    let vx = 0;
    let vy = 0;

    const left = this.cursors.left?.isDown || this.keyA.isDown;
    const right = this.cursors.right?.isDown || this.keyD.isDown;
    const up = this.cursors.up?.isDown || this.keyW.isDown;
    const down = this.cursors.down?.isDown || this.keyS.isDown;

    if (left) vx -= 1;
    if (right) vx += 1;
    if (up) vy -= 1;
    if (down) vy += 1;

    // mobile touch joystick override (additive, clamps below)
    if (this.touchVector.x !== 0 || this.touchVector.y !== 0) {
      vx += this.touchVector.x;
      vy += this.touchVector.y;
    }

    const moving = vx !== 0 || vy !== 0;

    if (moving) {
      const len = Math.hypot(vx, vy) || 1;
      body.setVelocity((vx / len) * SPEED, (vy / len) * SPEED);

      if (vx < -0.1) this.facing = "left";
      else if (vx > 0.1) this.facing = "right";
      this.setFlipX(this.facing === "left");

      if (!this.isWalking) {
        this.isWalking = true;
        this.startWalkBob();
      }
    } else {
      body.setVelocity(0, 0);
      if (this.isWalking) {
        this.isWalking = false;
        this.startIdleBob();
      }
    }
  }

  private isWalking = false;
}
