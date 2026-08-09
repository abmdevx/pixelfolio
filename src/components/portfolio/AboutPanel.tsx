import type { IconType } from "react-icons";
import {
  SiReact,
  SiNextdotjs,
  SiNodedotjs,
  SiExpress,
  SiMongodb,
  SiTailwindcss,
} from "react-icons/si";
import PortfolioPanel from "./PortfolioPanel";
import { aboutContent } from "@/data/portfolio";

// Same react-icons/si icons SkillsPanel.tsx uses, just keyed by the tech
// name (lowercased) since aboutContent.technologies is a plain string
// list, not the {name, icon} shape skillsContent has. Add a new entry
// here whenever aboutContent.technologies gets a new string — unmapped
// names just render without an icon (see the `Icon &&` guard below).
const TECH_ICONS: Record<string, IconType> = {
  react: SiReact,
  "next.js": SiNextdotjs,
  "node.js": SiNodedotjs,
  "express.js": SiExpress,
  mongodb: SiMongodb,
  "tailwind css": SiTailwindcss,
};

export default function AboutPanel({ onClose }: { onClose: () => void }) {
  return (
    <PortfolioPanel title="About Me" eyebrow="The Wizard's Study" onClose={onClose}>
      <h3 className="font-pixel text-parchment-100 text-base">
        {aboutContent.name}
      </h3>
      <p className="text-ember-400 font-pixel text-[11px] mt-1 mb-4">
        {aboutContent.role}
      </p>
      <p className="mb-3 text-parchment-100">{aboutContent.tagline}</p>
      {aboutContent.bio.map((p, i) => (
        <p key={i} className="mb-3 text-stone-300">
          {p}
        </p>
      ))}
      <div className="mt-5">
        <p className="font-pixel text-[10px] tracking-widest text-ember-400 mb-2">
          TECHNOLOGIES
        </p>
        <div className="flex flex-wrap gap-4">
          {aboutContent.technologies.map((t) => {
            const Icon = TECH_ICONS[t.toLowerCase()];
            return (
              <span
                key={t}
                className="pixel-border-thin flex items-center gap-1.5 bg-dungeon-800 px-2.5 py-1 text-xs font-pixel text-parchment-100"
              >
                {Icon && <Icon size={14} className="shrink-0" />}
                {t}
              </span>
            );
          })}
        </div>
      </div>
    </PortfolioPanel>
  );
}