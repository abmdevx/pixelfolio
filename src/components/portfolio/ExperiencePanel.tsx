import PortfolioPanel from "./PortfolioPanel";
import { experienceContent } from "@/data/portfolio";

export default function ExperiencePanel({ onClose }: { onClose: () => void }) {
  return (
    <PortfolioPanel title="Experience" eyebrow="The War Record" onClose={onClose}>
      <div className="space-y-5">
        {experienceContent.map((e, i) => (
          <div key={i} className="relative border-l-2 border-dungeon-700 pl-4">
            <div className="absolute -left-[7px] top-1 h-3 w-3 bg-ember-500 pixel-border-thin" />
            <h3 className="font-pixel text-sm text-parchment-100">{e.role}</h3>
            <p className="text-ember-400 text-xs font-pixel mt-0.5">
              {e.company} · {e.period}
            </p>
            <ul className="mt-2 list-disc list-inside space-y-1 text-stone-300">
              {e.points.map((pt, j) => (
                <li key={j}>{pt}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </PortfolioPanel>
  );
}
