import PortfolioPanel from "./PortfolioPanel";
import { projectsContent } from "@/data/portfolio";

/**
 * The compact card opened when the player picks "View details" on a
 * chest's dialogue inside the Treasure Vault (see
 * game/scenes/ProjectsDungeonScene.ts and DialogueBox.tsx). Reuses the
 * same PortfolioPanel chrome as the old full-list panels, just scoped to
 * a single project instead of all of them.
 */
export default function ProjectDetailsCard({
  index,
  onClose,
}: {
  index: number;
  onClose: () => void;
}) {
  const project = projectsContent[index];
  if (!project) return null;

  return (
    <PortfolioPanel title={project.name} eyebrow="The Treasure Vault" onClose={onClose}>
      <p className="text-stone-300 mb-4">{project.description}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {project.technologies.map((t) => (
          <span
            key={t}
            className="bg-dungeon-700 px-2 py-0.5 text-[10px] font-pixel text-ember-400"
          >
            {t}
          </span>
        ))}
      </div>

      <div className="flex gap-4">
        {project.githubUrl && (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-pixel text-[10px] text-moss-400 hover:text-moss-500 underline underline-offset-4"
          >
            GitHub ↗
          </a>
        )}
        {project.liveUrl && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-pixel text-[10px] text-moss-400 hover:text-moss-500 underline underline-offset-4"
          >
            Live demo ↗
          </a>
        )}
      </div>
    </PortfolioPanel>
  );
}
