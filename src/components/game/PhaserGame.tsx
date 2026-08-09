"use client";

import { useEffect, useRef } from "react";
import type Phaser from "phaser";

interface PhaserGameProps {
  onReady?: (game: Phaser.Game) => void;
}

/**
 * Mounts the Phaser game into a div. Phaser touches `window`/`document`
 * at import time, so this component (and the dynamic `createGame` import)
 * must only ever run on the client — see app/page.tsx, which loads this
 * component via `next/dynamic` with `ssr: false`.
 */
export default function PhaserGame({ onReady }: PhaserGameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    let destroyed = false;

    (async () => {
      const { createGame } = await import("@/game/main");
      if (destroyed || !containerRef.current) return;
      const game = createGame(containerRef.current);
      gameRef.current = game;
      onReady?.(game);
    })();

    return () => {
      destroyed = true;
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={containerRef} className="absolute inset-0" />;
}
