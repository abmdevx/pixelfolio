"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";

interface PortfolioPanelProps {
  title: string;
  eyebrow: string;
  onClose: () => void;
  children: ReactNode;
}

export default function PortfolioPanel({
  title,
  eyebrow,
  onClose,
  children,
}: PortfolioPanelProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-dungeon-950/70 p-4 sm:p-8">
      <div
        className="pixel-border animate-panel-in relative flex max-h-full w-full max-w-lg flex-col bg-dungeon-900"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {/* header */}
        <div className="flex items-start justify-between gap-4 border-b-4 border-dungeon-950 bg-dungeon-800 px-5 py-4">
          <div>
            <p className="font-pixel text-[10px] tracking-[0.2em] text-ember-400">
              {eyebrow}
            </p>
            <h2 className="font-pixel text-lg text-parchment-100 text-shadow-pixel mt-1">
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close panel"
            className="pixel-border-thin flex h-8 w-8 shrink-0 items-center justify-center bg-blood-500 font-pixel text-parchment-100 hover:bg-blood-600 active:translate-y-0.5"
          >
            ✕
          </button>
        </div>

        {/* content */}
        <div className="pixel-scroll overflow-y-auto px-5 py-5 text-sm leading-relaxed text-parchment-200">
          {children}
        </div>

        {/* footer */}
        <div className="border-t-4 border-dungeon-950 bg-dungeon-800 px-5 py-2.5 flex items-center justify-between">
          <span className="font-pixel text-[9px] text-stone-400">
            ESC or ✕ to close
          </span>
          <button
            onClick={onClose}
            className="pixel-border-thin bg-dungeon-700 px-3 py-1.5 font-pixel text-[10px] text-parchment-100 hover:bg-dungeon-600 active:translate-y-0.5"
          >
            Back to the world
          </button>
        </div>
      </div>
    </div>
  );
}
