"use client";

import { useEffect, useState } from "react";
import { gameEvents, type NearbyInteractable, type InteractKind } from "@/game/systems/events";

const VERB_BY_KIND: Record<InteractKind, string> = {
  panel: "Interact",
  "dungeon-entrance": "Enter",
  talk: "Talk",
  exit: "Leave",
  chest: "Open",
};

export default function InteractPrompt({ suppressed }: { suppressed: boolean }) {
  const [nearby, setNearby] = useState<NearbyInteractable | null>(null);

  useEffect(() => {
    const handler = (payload: NearbyInteractable | null) => setNearby(payload);
    gameEvents.on("zone-near", handler);
    return () => {
      gameEvents.off("zone-near", handler);
    };
  }, []);

  if (!nearby || suppressed) return null;

  return (
    <div className="pointer-events-none absolute left-1/2 bottom-24 sm:bottom-10 -translate-x-1/2 z-30 flex flex-col items-center gap-2 animate-float-y">
      <div className="pixel-border-thin bg-dungeon-900/90 px-4 py-2 flex items-center gap-3">
        <kbd className="pixel-border-thin bg-ember-500 text-dungeon-950 font-pixel text-xs font-bold px-2 py-1">
          E
        </kbd>
        <span className="font-pixel text-[11px] tracking-wide text-parchment-100">
          {VERB_BY_KIND[nearby.kind]} · {nearby.label}
        </span>
      </div>
    </div>
  );
}
