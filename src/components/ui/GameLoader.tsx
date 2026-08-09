"use client";

import { useEffect, useState } from "react";

const TIPS = [
  "Lighting the torches…",
  "Waking the vault ghost…",
  "Polishing the chests…",
  "Sharpening pixels…",
  "Rolling out the welcome mat…",
];

/**
 * Shown by the dynamic() import of PhaserGame while the game bundle
 * loads — replaces a plain "Loading…" line with a small animated pixel
 * chest, an indeterminate progress bar, and rotating flavor text so the
 * wait actually feels like part of the game instead of a blank pause.
 */
export default function GameLoader() {
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTipIndex((i) => (i + 1) % TIPS.length), 1600);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-dungeon-950">
      {/* pixel chest, lid creaking open/closed */}
      <div className="relative h-16 w-20 animate-float-y">
        {/* lock */}
        <div className="pixel-border-thin absolute left-1/2 top-6 z-10 h-3 w-3 -translate-x-1/2 bg-dungeon-950" />
        {/* body */}
        <div className="pixel-border-thin absolute bottom-0 h-9 w-20 bg-ember-600" />
        <div className="absolute bottom-1 left-1 h-1 w-[calc(100%-8px)] bg-ember-500/60" />
        {/* lid */}
        <div
          className="pixel-border-thin absolute top-0 h-8 w-20 origin-bottom-left bg-ember-500 animate-lid-creak"
          style={{ transformOrigin: "2px 32px" }}
        />
      </div>

      <div className="flex flex-col items-center gap-3">
        <p className="font-pixel text-sm text-parchment-100 text-shadow-pixel tracking-wide">
          Entering the Village…
        </p>

        <div className="pixel-border-thin h-3 w-56 overflow-hidden bg-dungeon-800">
          <div className="h-full w-1/3 bg-ember-500 animate-loader-sweep" />
        </div>

        <p
          key={tipIndex}
          className="font-pixel text-[10px] text-stone-400 animate-blink-soft"
        >
          {TIPS[tipIndex]}
        </p>
      </div>
    </div>
  );
}
