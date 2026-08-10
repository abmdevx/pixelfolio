import Phaser from "phaser";
import { TILESET_KEY, TILE } from "../config/assetKeys";

// Top walking speed (px/s).
const MAX_SPEED = 118;

// How quickly the body ramps up to MAX_SPEED / brakes to a stop.
const ACCELERATION = 820;
const DECELERATION = 1000; // used as Arcade "drag"

// ---- Gait tuning -----------------------------------------------------
// The tileset only ships a single static frame per character, so
// "walking" is faked procedurally, driven off DISTANCE TRAVELED rather
// than elapsed time -- walk slow -> short lazy steps, walk fast ->
// quick steps.
const STRIDE_LENGTH = 15; // px of travel per full step (one footfall)
const STEP_HEIGHT = 2.2; // px the body rises at the peak of a step
const STEP_LEAN = 3.5; // deg of side-to-side weight-shift tilt
const STEP_SQUASH = 0.07; // squash/stretch intensity on footfall impact
const WALK_SPEED_THRESHOLD = 6; // px/s below which we call it "stopped"

export class Player extends Phaser.Physics.Arcade.Sprite {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyW!: Phaser.Input.Keyboard.Key;
  private keyA!: Phaser.Input.Keyboard.Key;
  private keyS!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;
  private idleBobTween?: Phaser.Tweens.Tween;
  private facing: "left" | "right" = "right";
  private controlsEnabled = true;
  /** external override used by on-screen mobile joystick */
  public touchVector: { x: number; y: number } = { x: 0, y: 0 };

  private isWalking = false;
  private stepPhase = 0;
  private prevStride = 0;

  /**
   * The visible character. `this` (the physics sprite) is kept
   * invisible and owns the real collision body -- ALL of the gait
   * juice (bounce/lean/squash) is applied to this sprite instead.
   *
   * This split matters: Arcade Physics re-reads the physics sprite's
   * x/y back into the body's real position every single frame
   * (`updateFromGameObject`). If the bounce were applied directly to
   * `this.y`, that offset would get permanently baked into the body's
   * actual position each frame instead of resetting -- which is
   * exactly what caused the diagonal drift bug (walking right/left
   * slowly dragged the whole body upward too, since the bounce is
   * always a negative/upward offset that never cancels out).
   */
  private visual: Phaser.GameObjects.Sprite;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, TILESET_KEY, TILE.PLAYER);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0.5, 0.75);
    this.setVisible(false);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(10, 8);
    body.setOffset(3, 10);
    body.setCollideWorldBounds(true);
    body.setMaxVelocity(MAX_SPEED, MAX_SPEED);
    body.setDrag(DECELERATION, DECELERATION);

    this.visual = scene.add.sprite(x, y, TILESET_KEY, TILE.PLAYER);
    this.visual.setOrigin(0.5, 0.75);
    this.visual.setDepth(10);

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
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.setAcceleration(0, 0);
      body.setVelocity(0, 0);
      this.resetGaitVisuals();
    }
  }

  private startIdleBob() {
    this.idleBobTween?.stop();
    this.visual.setScale(1, 1);
    this.idleBobTween = this.scene.tweens.add({
      targets: this.visual,
      scaleY: { from: 1, to: 0.97 },
      scaleX: { from: 1, to: 1.02 },
      duration: 620,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  private resetGaitVisuals() {
    this.visual.setAngle(0);
    this.visual.setScale(1, 1);
    this.stepPhase = 0;
    this.prevStride = 0;
  }

  /** Small ground puff spawned on each footfall -- no texture needed. */
  private spawnFootDust() {
    const dust = this.scene.add.circle(
      this.x + (Math.random() - 0.5) * 3,
      this.y + 2,
      2,
      0xffffff,
      0.35
    );
    dust.setDepth(this.visual.depth - 1);
    this.scene.tweens.add({
      targets: dust,
      alpha: 0,
      scale: 1.8,
      y: dust.y + 1,
      duration: 260,
      ease: "Sine.easeOut",
      onComplete: () => dust.destroy(),
    });
  }

  update() {
    const body = this.body as Phaser.Physics.Arcade.Body;

    if (!this.controlsEnabled) {
      body.setVelocity(0, 0);
      this.visual.setPosition(this.x, this.y);
      return;
    }

    let ix = 0;
    let iy = 0;

    const left = this.cursors.left?.isDown || this.keyA.isDown;
    const right = this.cursors.right?.isDown || this.keyD.isDown;
    const up = this.cursors.up?.isDown || this.keyW.isDown;
    const down = this.cursors.down?.isDown || this.keyS.isDown;

    if (left) ix -= 1;
    if (right) ix += 1;
    if (up) iy -= 1;
    if (down) iy += 1;

    // mobile touch joystick override (additive, normalized below)
    if (this.touchVector.x !== 0 || this.touchVector.y !== 0) {
      ix += this.touchVector.x;
      iy += this.touchVector.y;
    }

    const hasInput = ix !== 0 || iy !== 0;

    if (hasInput) {
      const len = Math.hypot(ix, iy) || 1;
      const dx = ix / len;
      const dy = iy / len;
      body.setAcceleration(dx * ACCELERATION, dy * ACCELERATION);

      if (dx < -0.1) this.facing = "left";
      else if (dx > 0.1) this.facing = "right";
      this.visual.setFlipX(this.facing === "left");
    } else {
      body.setAcceleration(0, 0);
    }

    // Keep diagonal movement at the same top speed as cardinal movement.
    const rawSpeed = Math.hypot(body.velocity.x, body.velocity.y);
    if (rawSpeed > MAX_SPEED) {
      const scale = MAX_SPEED / rawSpeed;
      body.velocity.x *= scale;
      body.velocity.y *= scale;
    }

    const speed = Math.hypot(body.velocity.x, body.velocity.y);
    const walking = speed > WALK_SPEED_THRESHOLD;

    if (walking !== this.isWalking) {
      this.isWalking = walking;
      if (walking) {
        this.idleBobTween?.stop();
        this.visual.setScale(1, 1);
      } else {
        this.resetGaitVisuals();
        this.startIdleBob();
      }
    }

    // Start from the TRUE physics position every frame, then layer the
    // gait offsets on top of the visual sprite only.
    this.visual.setPosition(this.x, this.y);

    if (walking) {
      const deltaSec = this.scene.game.loop.delta / 1000;
      const distance = speed * deltaSec;
      this.stepPhase += (distance / STRIDE_LENGTH) * Math.PI;

      const stride = Math.sin(this.stepPhase);
      const lift = Math.abs(stride); // 0 -> 1 -> 0 per footfall

      // footfall = the stride wave crossing zero (foot plants down)
      if (this.prevStride !== 0 && Math.sign(stride) !== Math.sign(this.prevStride)) {
        this.spawnFootDust();
      }
      this.prevStride = stride;

      // vertical bounce as the leading leg drives forward and plants
      this.visual.y -= lift * STEP_HEIGHT;

      // weight shifts side to side with each step
      this.visual.setAngle(Math.sign(stride || 1) * STEP_LEAN * lift);

      // brief squash right at footfall impact, stretch mid-stride
      const impact = Math.pow(1 - lift, 6);
      this.visual.setScale(1 + impact * STEP_SQUASH, 1 - impact * STEP_SQUASH);
    }
  }

  destroy(fromScene?: boolean) {
    this.visual.destroy();
    super.destroy(fromScene);
  }
}