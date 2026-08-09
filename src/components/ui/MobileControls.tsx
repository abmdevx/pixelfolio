"use client";

import { useEffect, useRef, useState } from "react";
import { gameEvents, type NearbyInteractable } from "@/game/systems/events";

interface MobileControlsProps {
  onMove: (x: number, y: number) => void;
  suppressed: boolean;
}

const DIRS: Record<string, { x: number; y: number }> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

export default function MobileControls({ onMove, suppressed }: MobileControlsProps) {
  const activeDirs = useRef<Set<string>>(new Set());
  const [nearby, setNearby] = useState<NearbyInteractable | null>(null);

  useEffect(() => {
    const handler = (payload: NearbyInteractable | null) => setNearby(payload);
    gameEvents.on("zone-near", handler);
    return () => {
      gameEvents.off("zone-near", handler);
    };
  }, []);

  useEffect(() => {
    if (suppressed) {
      activeDirs.current.clear();
      onMove(0, 0);
    }
  }, [suppressed, onMove]);

  const recompute = () => {
    let x = 0;
    let y = 0;
    activeDirs.current.forEach((d) => {
      x += DIRS[d].x;
      y += DIRS[d].y;
    });
    onMove(x, y);
  };

  const press = (dir: string) => {
    if (suppressed) return;
    activeDirs.current.add(dir);
    recompute();
  };
  const release = (dir: string) => {
    activeDirs.current.delete(dir);
    recompute();
  };

  const btnCls =
    "select-none active:scale-90 active:bg-ember-500 transition-transform w-9 h-9 flex items-center justify-center bg-dungeon-800/90 pixel-border-thin text-parchment-100 text-sm font-pixel";

  if (suppressed) return null;

  return (
    <div className="md:hidden pointer-events-none absolute inset-x-0 bottom-0 z-30 flex items-end justify-between p-3">
      {/* D-pad */}
      <div className="pointer-events-auto grid grid-cols-3 grid-rows-3 gap-1 w-28 h-28">
        <div />
        <button
          className={btnCls}
          onPointerDown={() => press("up")}
          onPointerUp={() => release("up")}
          onPointerLeave={() => release("up")}
          aria-label="Move up"
        >
          ▲
        </button>
        <div />
        <button
          className={btnCls}
          onPointerDown={() => press("left")}
          onPointerUp={() => release("left")}
          onPointerLeave={() => release("left")}
          aria-label="Move left"
        >
          ◀
        </button>
        <div />
        <button
          className={btnCls}
          onPointerDown={() => press("right")}
          onPointerUp={() => release("right")}
          onPointerLeave={() => release("right")}
          aria-label="Move right"
        >
          ▶
        </button>
        <div />
        <button
          className={btnCls}
          onPointerDown={() => press("down")}
          onPointerUp={() => release("down")}
          onPointerLeave={() => release("down")}
          aria-label="Move down"
        >
          ▼
        </button>
        <div />
      </div>

      {/* Interact button — mirrors the desktop E key exactly: every scene
          listens for "interact-press" and handles it identically to a
          JustDown(eKey), whatever the current zone kind is. */}
      <div className="pointer-events-auto mb-3">
        {nearby && (
          <button
            className="w-12 h-12 rounded-full bg-ember-500 active:bg-ember-600 pixel-border-thin flex items-center justify-center font-pixel text-dungeon-950 text-sm font-bold active:scale-90 transition-transform"
            onClick={() => gameEvents.emit("interact-press")}
            aria-label={`Interact: ${nearby.label}`}
          >
            E
          </button>
        )}
      </div>
    </div>
  );
}
