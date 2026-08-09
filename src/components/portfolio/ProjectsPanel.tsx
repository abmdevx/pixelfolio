import PortfolioPanel from "./PortfolioPanel";
import { projectsContent } from "@/data/portfolio";

export default function ProjectsPanel({ onClose }: { onClose: () => void }) {
  return (
    <PortfolioPanel title="Projects" eyebrow="The Treasure Vault" onClose={onClose}>
      <div className="space-y-4">
        {projectsContent.map((p) => (
          <div key={p.name} className="pixel-border-thin bg-dungeon-800 p-4">
            <h3 className="font-pixel text-sm text-parchment-100 mb-2">
              {p.name}
            </h3>
            <p className="text-stone-300 mb-3">{p.description}</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {p.technologies.map((t) => (
                <span
                  key={t}
                  className="bg-dungeon-700 px-2 py-0.5 text-[10px] font-pixel text-ember-400"
                >
                  {t}
                </span>
              ))}
            </div>
            <div className="flex gap-4">
              {p.githubUrl && (
                <a
                  href={p.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-pixel text-[10px] text-moss-400 hover:text-moss-500 underline underline-offset-4"
                >
                  GitHub ↗
                </a>
              )}
              {p.liveUrl && (
                <a
                  href={p.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-pixel text-[10px] text-moss-400 hover:text-moss-500 underline underline-offset-4"
                >
                  Live demo ↗
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </PortfolioPanel>
  );
}
