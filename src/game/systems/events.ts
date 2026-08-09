import type { LocationId, DialogueScript } from "@/data/portfolio";

// A tiny dependency-free event emitter used to pass messages between the
// Phaser world (game/scenes) and the React UI (components/portfolio,
// page.tsx) without either side needing a direct reference to the other.
//
// This intentionally does NOT import the `phaser` package: this module is
// imported from page.tsx and other client components that Next.js
// prerenders on the server, and Phaser touches browser-only globals
// (HTMLVideoElement, etc.) as soon as it's imported, which breaks SSR.
// The actual Phaser code (game/scenes/*, game/main.ts) is only ever
// reached through a `next/dynamic(..., { ssr: false })` import.
//
// Phaser -> React:
//   "zone-near"      (NearbyInteractable | null)  proximity changed — used
//                     by the on-screen "[E] Enter / Talk / Interact / Leave"
//                     prompt, in the hub AND inside dungeon scenes.
//   "zone-interact"  (id: LocationId)  player pressed E inside one of the
//                     hub's remaining panel-based zones (about/skills/
//                     experience/projects — being migrated to dedicated
//                     dungeons one at a time; contact was migrated first).
//   "dialogue-open"  (DialogueScript)  an NPC/prop inside a dungeon was
//                     interacted with; React should show the DialogueBox.
//   "project-details-open"  (index: number)  the player chose "View
//                     details" on a chest's dialogue, inside the Projects
//                     dungeon; React should hide the DialogueBox and show
//                     the compact ProjectDetailsCard for that project.
//
// React -> Phaser:
//   "panel-opened"     pause player movement while ANY overlay (panel or
//                       dialogue box) is open
//   "panel-closed"     resume player control
//   "dialogue-close"   the DialogueBox was dismissed (informational —
//                       scenes don't need to react beyond "panel-closed")
//   "interact-press"   the on-screen mobile "E" button was tapped. Every
//                       scene treats this exactly like a JustDown(eKey) on
//                       desktop — see WorldScene/ContactDungeonScene's
//                       handleInteract(). Kept separate from
//                       "zone-interact" (which is the *result* of an
//                       interact for panel zones specifically) so mobile
//                       works identically for dungeon entrances, NPCs, and
//                       exits too, not just panels.

/** What kind of thing the player is standing near, for the on-screen
 * "[E] ..." prompt. Generalized beyond the old fixed LocationId set so
 * dungeon interiors (NPCs, exits, statues/chests) can reuse the same
 * prompt without being tied to portfolio section ids. */
export type InteractKind = "panel" | "dungeon-entrance" | "talk" | "exit" | "chest";

export interface NearbyInteractable {
  id: string;
  label: string;
  kind: InteractKind;
}

type EventMap = {
  "zone-near": NearbyInteractable | null;
  "zone-interact": LocationId;
  "dialogue-open": DialogueScript;
  "dialogue-close": void;
  "project-details-open": number;
  "interact-press": void;
  "panel-opened": void;
  "panel-closed": void;
};

type Listener<K extends keyof EventMap> = (payload: EventMap[K]) => void;

class EventBus {
  // Stored loosely (untyped) internally — the public methods below give
  // callers a fully typed API without fighting TS variance on the map.
  private listeners = new Map<keyof EventMap, Set<(payload: unknown) => void>>();

  on<K extends keyof EventMap>(event: K, listener: Listener<K>) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(listener as (payload: unknown) => void);
  }

  off<K extends keyof EventMap>(event: K, listener: Listener<K>) {
    this.listeners.get(event)?.delete(listener as (payload: unknown) => void);
  }

  emit<K extends keyof EventMap>(
    event: K,
    ...args: EventMap[K] extends void ? [] : [EventMap[K]]
  ) {
    const payload = args[0];
    this.listeners.get(event)?.forEach((l) => l(payload));
  }
}

export const gameEvents = new EventBus();
