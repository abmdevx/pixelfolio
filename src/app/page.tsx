"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import type Phaser from "phaser";
import { gameEvents } from "@/game/systems/events";
import type { LocationId } from "@/data/portfolio";
import InteractPrompt from "@/components/ui/InteractPrompt";
import MobileControls from "@/components/ui/MobileControls";
import GameLoader from "@/components/ui/GameLoader";
import AboutPanel from "@/components/portfolio/AboutPanel";
import SkillsPanel from "@/components/portfolio/SkillsPanel";
import ExperiencePanel from "@/components/portfolio/ExperiencePanel";
import ProjectDetailsCard from "@/components/portfolio/ProjectDetailsCard";
import DialogueBox from "@/components/game/DialogueBox";

// Phaser touches `window` at import time, so the game canvas can only
// ever be rendered on the client.
const PhaserGame = dynamic(() => import("@/components/game/PhaserGame"), {
  ssr: false,
  loading: () => <GameLoader />,
});

export default function Home() {
  const [openPanel, setOpenPanel] = useState<LocationId | null>(null);
  // Which project's compact details card is open (from a Treasure Vault
  // chest's "View details" choice), or null when none is. Separate from
  // `openPanel` since it's opened by a dialogue choice, not a zone-interact.
  const [openProjectIndex, setOpenProjectIndex] = useState<number | null>(null);
  // Tracks ANY overlay — a portfolio panel or a dungeon DialogueBox — so
  // the interact prompt and mobile controls hide correctly either way.
  // Both PortfolioPanel-based flows and DialogueBox emit panel-opened/
  // panel-closed themselves; this just mirrors that shared signal.
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    const zoneInteractHandler = (id: LocationId) => {
      setShowIntro(false);
      setOpenPanel(id);
      gameEvents.emit("panel-opened");
    };
    const openHandler = () => setOverlayOpen(true);
    const closeHandler = () => setOverlayOpen(false);
    const dialogueOpenHandler = () => setShowIntro(false);
    const projectDetailsHandler = (index: number) => setOpenProjectIndex(index);

    gameEvents.on("zone-interact", zoneInteractHandler);
    gameEvents.on("panel-opened", openHandler);
    gameEvents.on("panel-closed", closeHandler);
    gameEvents.on("dialogue-open", dialogueOpenHandler);
    gameEvents.on("project-details-open", projectDetailsHandler);
    return () => {
      gameEvents.off("zone-interact", zoneInteractHandler);
      gameEvents.off("panel-opened", openHandler);
      gameEvents.off("panel-closed", closeHandler);
      gameEvents.off("dialogue-open", dialogueOpenHandler);
      gameEvents.off("project-details-open", projectDetailsHandler);
    };
  }, []);

  const closePanel = useCallback(() => {
    setOpenPanel(null);
    gameEvents.emit("panel-closed");
  }, []);

  const closeProjectDetails = useCallback(() => {
    setOpenProjectIndex(null);
    gameEvents.emit("panel-closed");
  }, []);

  const handleReady = useCallback((game: Phaser.Game) => {
    gameRef.current = game;
  }, []);

  const handleMove = useCallback((x: number, y: number) => {
    // Whichever scene is currently running — the hub or a dungeon — not
    // hardcoded to "world", so the D-pad keeps working after a transition.
    type TouchDrivable = Phaser.Scene & { setTouchVector?: (x: number, y: number) => void };
    const active = gameRef.current?.scene.getScenes(true) as TouchDrivable[] | undefined;
    active?.forEach((scene) => scene.setTouchVector?.(x, y));
  }, []);

  return (
    <main className="relative h-[100dvh] w-screen overflow-hidden bg-dungeon-950">
      <PhaserGame onReady={handleReady} />

      {/* intro / controls hint */}
      {showIntro && !overlayOpen && (
        <div className="pointer-events-none absolute inset-x-0 top-4 z-20 flex justify-center px-4">
          <div className="pixel-border-thin bg-dungeon-900/90 px-4 py-3 text-center sm:px-6">
            <p className="font-pixel text-[11px] text-parchment-100 text-shadow-pixel">
              WASD / Arrow Keys to move
            </p>
            <p className="font-pixel text-[10px] text-ember-400 mt-1">
              Find the five shrines and press E to explore
            </p>
          </div>
        </div>
      )}

      <InteractPrompt suppressed={overlayOpen} />
      <MobileControls onMove={handleMove} suppressed={overlayOpen} />

      {openPanel === "about" && <AboutPanel onClose={closePanel} />}
      {openPanel === "skills" && <SkillsPanel onClose={closePanel} />}
      {openPanel === "experience" && <ExperiencePanel onClose={closePanel} />}

      {/* Opened from a Treasure Vault chest's "View details" choice — see
          DialogueBox.tsx and game/scenes/ProjectsDungeonScene.ts. */}
      {openProjectIndex !== null && (
        <ProjectDetailsCard index={openProjectIndex} onClose={closeProjectDetails} />
      )}

      {/* Contact and Projects are the sections migrated from a panel to a
          real place — see game/scenes/ContactDungeonScene.ts and
          ProjectsDungeonScene.ts. DialogueBox renders whenever an
          NPC/prop/chest inside any dungeon is interacted with, so it
          isn't tied to a specific openPanel state. */}
      <DialogueBox />
    </main>
  );
}
