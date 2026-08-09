// ─────────────────────────────────────────────────────────────
// PORTFOLIO CONTENT
// Edit everything in this file to make the world yours.
// Nothing in here touches the game code — it's pure content.
// ─────────────────────────────────────────────────────────────

export type LocationId =
  | "about"
  | "skills"
  | "projects"
  | "experience"
  | "contact";

export interface AboutContent {
  name: string;
  role: string;
  tagline: string;
  bio: string[];
  technologies: string[];
}

export const aboutContent: AboutContent = {
  name: "Abdullah Butt",
  role: "Full Stack Developer",
  tagline: "Building scalable backends and clean, real-world UIs.",
  bio: [
    "I like taking ideas from a blank page to something people can actually click, tap, and use — shipping real products, not just tutorials.",
    "Most of my time is spent in the React/Next.js and Node.js/Express world, backed by MongoDB, with a growing focus on Redis, system design, and data structures & algorithms.",
  ],
  technologies: ["React", "Next.js", "Node.js", "Express.js", "MongoDB", "Tailwind CSS"],
};

export interface SkillEntry {
  name: string;
  /** Icon key looked up in the SKILL_ICONS map in SkillsPanel.tsx (kept
   *  out of this file since it's plain content, not React). Omit for
   *  skills with no matching icon — falls back to a plain text chip. */
  icon?: string;
}

export interface SkillGroup {
  category: string;
  skills: SkillEntry[];
}

export const skillsContent: SkillGroup[] = [
  {
    category: "Frontend",
    skills: [
      { name: "React", icon: "react" },
      { name: "Next.js", icon: "nextjs" },
      { name: "JavaScript", icon: "javascript" },
      { name: "TypeScript", icon: "typescript" },
      { name: "Redux Toolkit", icon: "redux" },
      { name: "Tailwind CSS", icon: "tailwindcss" },
    ],
  },
  {
    category: "Backend",
    skills: [
      { name: "Node.js", icon: "nodejs" },
      { name: "Express.js", icon: "express" },
      { name: "REST APIs", icon: "restapi" },
      { name: "Socket.IO", icon: "socketio" },
    ],
  },
  {
    category: "Database & Storage",
    skills: [
      { name: "MongoDB", icon: "mongodb" },
      { name: "PostgreSQL", icon: "postgresql" },
      { name: "MySQL", icon: "mysql" },
      { name: "Firebase", icon: "firebase" },
      { name: "Appwrite", icon: "appwrite" },
      { name: "Cloudinary", icon: "cloudinary" },
    ],
  },
  {
    category: "Tools",
    skills: [
      { name: "Git", icon: "git" },
      { name: "GitHub", icon: "github" },
      { name: "Docker", icon: "docker" },
      { name: "GitHub Actions", icon: "githubactions" },
      { name: "Postman", icon: "postman" },
      { name: "Figma", icon: "figma" },
      { name: "VS Code", icon: "vscode" },
    ],
  },
];

export interface Project {
  name: string;
  description: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
}

export const projectsContent: Project[] = [
  {
    name: "LearnMate — Peer Learning Platform",
    description:
      "A skill-based peer learning platform: matches users by skill, and supports real-time collaboration, collaborative learning sessions, coding practice together, and progress tracking.",
    technologies: ["React", "Redux Toolkit", "Tailwind CSS", "Vite", "Appwrite", "React Router"],
    githubUrl: "https://github.com/abmdevx/learn-mate",
  },
  {
    name: "Social-Api — YouTube-like Backend",
    description:
      "A production-style backend for a video platform: uploads and management, playlists, subscriptions, likes and comments, plus dashboard analytics built on MongoDB aggregation pipelines.",
    technologies: ["Node.js", "Express.js", "MongoDB", "Cloudinary", "Postman"],
    githubUrl: "https://github.com/abmdevx/social-api",
  },
  {
    name: "DigitalWallet — Secure Wallet App",
    description:
      "A secure wallet application with user authentication, account management, wallet balance tracking, transaction handling, and full transaction history.",
    technologies: ["React", "Redux Toolkit", "Tailwind CSS", "React Router", "Appwrite", "Vite"],
    githubUrl: "https://github.com/abmdevx/digital-wallet",
  },
  {
    name: "Collab Whiteboard — Real-time Collaborative Whiteboard",
    description:
      "A real-time collaborative drawing board for multi-user brainstorming and idea sharing, with live sync over WebSockets and interactive sketching on HTML Canvas.",
    technologies: ["React", "Tailwind CSS", "Node.js", "Express.js", "Socket.IO", "Canvas API"],
    githubUrl: "https://github.com/abmdevx/collab-whiteboard",
  },
];

export interface ExperienceEntry {
  role: string;
  company: string;
  period: string;
  points: string[];
}

export const experienceContent: ExperienceEntry[] = [
  {
    role: "Mobile Application Developer",
    company: "WriteO",
    period: "Jul 2026 — Present",
    points: [
      "Developing cross-platform apps with React Native.",
      "Building reusable and responsive UI components.",
      "Integrating APIs and developing new features.",
      "Debugging issues and improving app performance.",
      "Collaborating with the development team.",
    ],
  },
  {
    role: "Sales Agent",
    company: "Swift Trucx",
    period: "Mar 2026 — Present",
    points: [
      "Managed outbound sales and driver outreach.",
      "Identified opportunities for logistics services.",
      "Maintained professional client relationships.",
      "Handled high-volume outbound calls.",
      "Supported load coordination with the dispatch team.",
    ],
  },
];

export interface ContactContent {
  email: string;
  github: string;
  linkedin: string;
  /** Optional Discord profile/invite link. Leave undefined to hide that
   *  choice in the Contact dungeon's dialogue. */
  discord?: string;
  /** Optional path/URL to a downloadable resume (e.g. "/resume.pdf" after
   *  dropping the file in `public/`). Leave undefined to hide that choice
   *  in the Contact dungeon's dialogue. */
  resumeUrl?: string;
}

export const contactContent: ContactContent = {
  email: "abdullahbuttdevx@gmail.com",
  github: "https://github.com/abmdevx",
  linkedin: "https://www.linkedin.com/in/abdullah-bin-mughira",
  discord: "https://discord.com/users/1125365939609804913",
  resumeUrl: undefined,
};

// ─────────────────────────────────────────────────────────────
// Location metadata — labels shown on the sign above each area
// and short flavor text used by the game world.
// ─────────────────────────────────────────────────────────────

export interface LocationMeta {
  id: LocationId;
  label: string;
}

export const locationMeta: Record<LocationId, LocationMeta> = {
  about: { id: "about", label: "About Me" },
  skills: { id: "skills", label: "Skills" },
  projects: { id: "projects", label: "Projects" },
  experience: { id: "experience", label: "Experience" },
  contact: { id: "contact", label: "Contact" },
};

// ─────────────────────────────────────────────────────────────
// In-world dialogue content.
// This is the RPG-textbox equivalent of the old fullscreen panels —
// a short line or two, then a handful of choices, shown by
// components/game/DialogueBox.tsx and triggered by NPCs/props inside
// dungeon scenes. Defined here (not in game/systems/events.ts) so it
// stays alongside the rest of the editable content.
// ─────────────────────────────────────────────────────────────

export interface DialogueChoice {
  /** Button label shown to the player. */
  label: string;
  /** "link" opens `href` in a new tab and leaves the dialogue open so the
   *  player can pick another option; "close" just closes the dialogue box;
   *  "details" hides the dialogue box and opens the compact project
   *  details card for `projectIndex` instead (see DialogueBox.tsx /
   *  ProjectDetailsCard.tsx). */
  kind: "link" | "close" | "details";
  href?: string;
  /** Index into `projectsContent`. Required when kind === "details". */
  projectIndex?: number;
}

export interface DialogueScript {
  /** Small label above the speaker name, e.g. a room/NPC title. */
  eyebrow?: string;
  speaker?: string;
  /** Shown one at a time — player presses E / clicks to advance. */
  lines: string[];
  /** Shown after the last line. Omit for a dialogue that just closes. */
  choices?: DialogueChoice[];
}

export const contactDialogue: DialogueScript = {
  eyebrow: "The Message Post",
  speaker: "Messenger",
  lines: [
    "Need to contact Abdullah?",
    "I can carry a message by raven, or point you toward his more modern correspondence.",
  ],
  choices: [
    { label: "Send Email", kind: "link", href: `mailto:${contactContent.email}` },
    { label: "LinkedIn", kind: "link", href: contactContent.linkedin },
    { label: "GitHub", kind: "link", href: contactContent.github },
    ...(contactContent.discord
      ? [{ label: "Discord", kind: "link" as const, href: contactContent.discord }]
      : []),
    ...(contactContent.resumeUrl
      ? [{ label: "Download Resume", kind: "link" as const, href: contactContent.resumeUrl }]
      : []),
    { label: "Back", kind: "close" },
  ],
};

// ─────────────────────────────────────────────────────────────
// Projects dungeon — "The Treasure Vault". Each project is a chest;
// a ghost greets the player automatically the first time they enter.
// See game/scenes/ProjectsDungeonScene.ts.
// ─────────────────────────────────────────────────────────────

/** Plays once, automatically, the first time the player enters the vault. */
export const vaultGhostIntroDialogue: DialogueScript = {
  eyebrow: "The Treasure Vault",
  speaker: "Vault Ghost",
  lines: [
    "Oooooh... a visitor. Don't mind me, I just guard what's left behind.",
    "Every chest in this vault holds one of Abdullah's projects. Press E near one to open it.",
  ],
  choices: [{ label: "Understood", kind: "close" }],
};

/** Short line shown when a chest is opened, then a choice to see the full
 *  project card. Generated per-project rather than hand-authored since it
 *  just wraps `projectsContent[index]`. */
export function projectChestDialogue(index: number): DialogueScript {
  const project = projectsContent[index];
  return {
    eyebrow: "The Treasure Vault",
    speaker: project.name,
    lines: [`You pry open the chest and find records of "${project.name}."`],
    choices: [
      { label: "View details", kind: "details", projectIndex: index },
      { label: "Close it", kind: "close" },
    ],
  };
}
