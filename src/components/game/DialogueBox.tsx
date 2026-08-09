"use client";

import { useCallback, useEffect, useState } from "react";
import { gameEvents } from "@/game/systems/events";
import type { DialogueChoice, DialogueScript } from "@/data/portfolio";

/**
 * The in-world replacement for the old fullscreen PortfolioPanel when
 * talking to an NPC/prop inside a dungeon: a small, bottom-anchored RPG
 * textbox, not a scrolling webpage-shaped card.
 *
 * Flow: lines are shown one at a time (press E / click / tap to advance);
 * once the last line has been seen, any `choices` appear as buttons.
 * Choosing a "link" choice opens it in a new tab and leaves the box open
 * (so e.g. Email then LinkedIn both work); "close" dismisses the box.
 */
export default function DialogueBox() {
  const [script, setScript] = useState<DialogueScript | null>(null);
  const [lineIndex, setLineIndex] = useState(0);
  const [showChoices, setShowChoices] = useState(false);

  const close = useCallback(() => {
    setScript(null);
    gameEvents.emit("panel-closed");
    gameEvents.emit("dialogue-close");
  }, []);

  const advance = useCallback(() => {
    if (!script) return;
    if (showChoices) return; // choices are advanced by clicking a button, not by "continue"

    if (lineIndex < script.lines.length - 1) {
      setLineIndex((i) => i + 1);
    } else if (script.choices && script.choices.length > 0) {
      setShowChoices(true);
    } else {
      close();
    }
  }, [script, lineIndex, showChoices, close]);

  useEffect(() => {
    const openHandler = (data: DialogueScript) => {
      setScript(data);
      setLineIndex(0);
      setShowChoices(data.lines.length === 0);
      gameEvents.emit("panel-opened");
    };
    gameEvents.on("dialogue-open", openHandler);
    return () => {
      gameEvents.off("dialogue-open", openHandler);
    };
  }, []);

  useEffect(() => {
    if (!script) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
      } else if (e.key === "e" || e.key === "E" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        advance();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [script, advance, close]);

  const handleChoice = (choice: DialogueChoice) => {
    if (choice.kind === "link" && choice.href) {
      window.open(choice.href, "_blank", "noopener,noreferrer");
      return; // stay open — the player might want another option too
    }
    if (choice.kind === "details" && choice.projectIndex !== undefined) {
      // Hide the textbox but deliberately DON'T emit "panel-closed"/
      // "dialogue-close" here — a new overlay (ProjectDetailsCard) is
      // about to take over, and controls should stay locked the whole
      // time so the player doesn't briefly regain movement in between.
      setScript(null);
      gameEvents.emit("project-details-open", choice.projectIndex);
      return;
    }
    close();
  };

  if (!script) return null;

  const currentLine = script.lines[lineIndex];

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-6 sm:bottom-10 z-40 flex justify-center px-4">
      <div
        className="pixel-border pointer-events-auto animate-panel-in w-full max-w-md bg-dungeon-900"
        role="dialog"
        aria-modal="true"
        aria-label={script.speaker ?? "Dialogue"}
      >
        {(script.eyebrow || script.speaker) && (
          <div className="border-b-4 border-dungeon-950 bg-dungeon-800 px-4 py-2">
            {script.eyebrow && (
              <p className="font-pixel text-[9px] tracking-[0.2em] text-ember-400">
                {script.eyebrow}
              </p>
            )}
            {script.speaker && (
              <p className="font-pixel text-sm text-parchment-100 text-shadow-pixel mt-0.5">
                {script.speaker}
              </p>
            )}
          </div>
        )}

        <div className="px-4 py-4">
          {!showChoices && (
            <button
              onClick={advance}
              className="w-full text-left text-sm leading-relaxed text-parchment-200"
            >
              {currentLine}
              <span className="mt-2 block font-pixel text-[9px] text-stone-400 animate-blink-soft">
                {lineIndex < script.lines.length - 1 || (script.choices?.length ?? 0) > 0
                  ? "▼ press E to continue"
                  : "▼ press E to close"}
              </span>
            </button>
          )}

          {showChoices && (
            <div className="space-y-2">
              {script.choices?.map((choice) => (
                <button
                  key={choice.label}
                  onClick={() => handleChoice(choice)}
                  className="pixel-border-thin flex w-full items-center justify-between bg-dungeon-800 px-3 py-2 text-left font-pixel text-[11px] text-parchment-100 hover:bg-dungeon-700 active:translate-y-0.5"
                >
                  {choice.label}
                </button>
              ))}
              {!script.choices?.length && (
                <button
                  onClick={close}
                  className="pixel-border-thin w-full bg-dungeon-800 px-3 py-2 font-pixel text-[11px] text-parchment-100 hover:bg-dungeon-700"
                >
                  Close
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
