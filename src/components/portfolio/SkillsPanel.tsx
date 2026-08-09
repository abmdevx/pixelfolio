import type { IconType } from "react-icons";
import {
  SiReact,
  SiNextdotjs,
  SiJavascript,
  SiTypescript,
  SiRedux,
  SiTailwindcss,
  SiNodedotjs,
  SiExpress,
  SiSocketdotio,
  SiMongodb,
  SiPostgresql,
  SiMysql,
  SiFirebase,
  SiAppwrite,
  SiCloudinary,
  SiGit,
  SiGithub,
  SiDocker,
  SiGithubactions,
  SiPostman,
  SiFigma,
} from "react-icons/si";
import { VscVscode } from "react-icons/vsc";
import { TbApi } from "react-icons/tb";
import PortfolioPanel from "./PortfolioPanel";
import { skillsContent } from "@/data/portfolio";

// Icon library: react-icons, bundling Simple Icons (real brand logos —
// same set that covers virtually every named tech/tool) plus one Tabler
// icon for "REST APIs" (a concept, not a brand, so no logo exists for it
// anywhere) and VS Code's own icon (Simple Icons omits it; Microsoft
// doesn't license that logo into third-party sets). Rendered as real SVG
// components — no network request, no missing-icon risk, unlike a CDN
// image API.
const SKILL_ICONS: Record<string, IconType> = {
  react: SiReact,
  nextjs: SiNextdotjs,
  javascript: SiJavascript,
  typescript: SiTypescript,
  redux: SiRedux,
  tailwindcss: SiTailwindcss,
  nodejs: SiNodedotjs,
  express: SiExpress,
  restapi: TbApi,
  socketio: SiSocketdotio,
  mongodb: SiMongodb,
  postgresql: SiPostgresql,
  mysql: SiMysql,
  firebase: SiFirebase,
  appwrite: SiAppwrite,
  cloudinary: SiCloudinary,
  git: SiGit,
  github: SiGithub,
  docker: SiDocker,
  githubactions: SiGithubactions,
  postman: SiPostman,
  figma: SiFigma,
  vscode: VscVscode,
};

export default function SkillsPanel({ onClose }: { onClose: () => void }) {
  return (
    <PortfolioPanel title="Skills" eyebrow="The Armory" onClose={onClose}>
      <div className="space-y-5">
        {skillsContent.map((group) => (
          <div key={group.category}>
            <p className="font-pixel text-[10px] tracking-widest text-ember-400 mb-2">
              {group.category.toUpperCase()}
            </p>
            <div className="flex flex-wrap gap-4">
              {group.skills.map((s) => {
                const Icon = s.icon ? SKILL_ICONS[s.icon] : undefined;
                return (
                  <span
                    key={s.name}
                    className="pixel-border-thin flex items-center gap-1.5 bg-dungeon-800 px-2.5 py-1 text-xs font-pixel text-parchment-100"
                  >
                    {Icon && <Icon size={14} className="shrink-0" />}
                    {s.name}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </PortfolioPanel>
  );
}
