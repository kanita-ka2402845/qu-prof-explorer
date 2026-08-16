"use client";

import type { AwardId } from "@/lib/queries";

const ALL_AWARDS: { id: AwardId; label: string; description: string; icon: React.ReactNode }[] = [
  {
    id: "first_voice",
    label: "First Voice",
    description: "Wrote your first review",
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  },
  {
    id: "precise",
    label: "Precise",
    description: "5+ reviews marked helpful by peers",
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  },
  {
    id: "reviews_10",
    label: "10 Reviews",
    description: "Wrote 10 or more reviews",
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  },
  {
    id: "reviews_15",
    label: "15 Reviews",
    description: "Wrote 15 or more reviews",
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  },
  {
    id: "top_10",
    label: "Top 10",
    description: "Ranked in the leaderboard top 10",
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>,
  },
  {
    id: "top_5",
    label: "Top 5",
    description: "Ranked in the leaderboard top 5",
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>,
  },
  {
    id: "top_3",
    label: "Top 3",
    description: "Ranked in the leaderboard top 3",
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>,
  },
];

type Props = {
  open: boolean;
  onClose: () => void;
    earnedAwards: AwardId[];
};

export default function AwardsModal({ open, onClose, earnedAwards }: Props) {
  if (!open) return null;

  const earnedSet = new Set(earnedAwards);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl p-6"
        style={{ background: "var(--graph)", border: "1px solid var(--hair)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-bold tracking-[-0.02em]" style={{ color: "var(--lumen-bright)", fontSize: "16px" }}>Awards</h2>
            <p className="font-mono text-[10px] tracking-widest mt-0.5" style={{ color: "var(--muted)" }}>
              {earnedAwards.length} of {ALL_AWARDS.length} earned
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ color: "var(--muted)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--lumen-bright)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Checklist */}
        <div className="space-y-1">
          {ALL_AWARDS.map((award) => {
            const earned = earnedSet.has(award.id);
            return (
              <div
                key={award.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
                style={{
                  background: earned ? "var(--surface)" : "transparent",
                  border: earned ? "1px solid var(--hair)" : "1px solid transparent",
                  opacity: earned ? 1 : 0.4,
                }}
              >
                {/* Icon */}
                <div style={{ color: earned ? "var(--lumen-bright)" : "var(--muted)" }}>
                  {award.icon}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p
                    className="text-[13px] font-semibold tracking-[-0.01em]"
                    style={{ color: earned ? "var(--lumen-bright)" : "var(--muted)" }}
                  >
                    {award.label}
                  </p>
                  <p className="font-mono text-[10px] tracking-wide" style={{ color: "var(--muted)" }}>
                    {award.description}
                  </p>
                </div>

                {/* Check */}
                {earned && (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: "var(--lumen-bright)", flexShrink: 0 }}>
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}