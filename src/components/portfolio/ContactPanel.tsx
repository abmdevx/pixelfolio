import PortfolioPanel from "./PortfolioPanel";
import { contactContent } from "@/data/portfolio";

export default function ContactPanel({ onClose }: { onClose: () => void }) {
  const rows: { label: string; value: string; href: string }[] = [
    {
      label: "Email",
      value: contactContent.email,
      href: `mailto:${contactContent.email}`,
    },
    {
      label: "GitHub",
      value: contactContent.github.replace("https://", ""),
      href: contactContent.github,
    },
    {
      label: "LinkedIn",
      value: contactContent.linkedin.replace("https://", ""),
      href: contactContent.linkedin,
    },
  ];

  return (
    <PortfolioPanel title="Contact" eyebrow="The Message Post" onClose={onClose}>
      <p className="mb-4 text-stone-300">
        Send a raven, or use one of the more modern options below.
      </p>
      <div className="space-y-3">
        {rows.map((r) => (
          <a
            key={r.label}
            href={r.href}
            target={r.label === "Email" ? undefined : "_blank"}
            rel="noopener noreferrer"
            className="pixel-border-thin flex items-center justify-between bg-dungeon-800 px-4 py-3 hover:bg-dungeon-700 transition-colors"
          >
            <span className="font-pixel text-[10px] tracking-widest text-ember-400">
              {r.label.toUpperCase()}
            </span>
            <span className="text-parchment-100 text-xs">{r.value}</span>
          </a>
        ))}
      </div>
    </PortfolioPanel>
  );
}
