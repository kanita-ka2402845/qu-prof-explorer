"use client";

import { useEffect, useState } from "react";
import { getLeaderboard, toggleLeaderboard } from "@/lib/queries";
import type { LeaderboardEntry } from "@/lib/queries";

const RANK_TIER: Record<number, string> = { 1: "👑", 2: "🥈", 3: "🥉" };

type Props = {
  open: boolean;
  onClose: () => void;
  currentUserId: string;
  showOnLeaderboard: boolean;
  onToggle: (val: boolean) => void;
};

export default function LeaderboardModal({ open, onClose, currentUserId, showOnLeaderboard, onToggle }: Props) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    getLeaderboard().then((data) => { setEntries(data); setLoading(false); });
  }, [open]);

  if (!open) return null;

  async function handleToggle() {
    setToggling(true);
    const next = !showOnLeaderboard;
    await toggleLeaderboard(currentUserId, next);
    onToggle(next);
    setToggling(false);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl p-6 max-h-[80vh] flex flex-col"
        style={{ background: "var(--graph)", border: "1px solid var(--hair)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <h2 className="font-bold tracking-[-0.02em]" style={{ color: "var(--lumen-bright)", fontSize: "16px" }}>
            Leaderboard
          </h2>
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

        {/* Opt-in toggle */}
        <div
          className="flex items-center justify-between px-3 py-2.5 rounded-lg mb-4 flex-shrink-0"
          style={{ background: "var(--surface)", border: "1px solid var(--hair)" }}
        >
          <p className="font-mono text-[11px] tracking-widest uppercase" style={{ color: "var(--muted)" }}>
            Show me on leaderboard
          </p>
          <button
            onClick={handleToggle}
            disabled={toggling}
            className="relative w-9 h-5 rounded-full transition-colors duration-200 flex-shrink-0"
            style={{
              background: showOnLeaderboard ? "var(--lumen-bright)" : "var(--hair)",
            }}
          >
            <span
              className="absolute top-0.5 w-4 h-4 rounded-full transition-transform duration-200"
              style={{
                background: "var(--void)",
                left: showOnLeaderboard ? "calc(100% - 18px)" : "2px",
              }}
            />
          </button>
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1 space-y-1 pr-1">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: "var(--hair) var(--hair) var(--hair) transparent" }} />
            </div>
          ) : entries.length === 0 ? (
            <p className="font-mono text-[11px] text-center py-8 tracking-widest" style={{ color: "var(--muted)" }}>
              No one on the leaderboard yet
            </p>
          ) : (
            entries.map((entry) => (
              <div
                key={entry.username}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
                style={{ background: "var(--surface)", border: "1px solid var(--hair)" }}
              >
                <span className="font-mono text-[11px] w-6 text-center flex-shrink-0" style={{ color: "var(--muted)" }}>
                  {RANK_TIER[entry.rank] ?? `#${entry.rank}`}
                </span>
                <span className="flex-1 text-[13px] font-semibold tracking-[-0.01em] truncate" style={{ color: "var(--lumen-bright)" }}>
                  {entry.username}
                </span>
                <span className="font-mono text-[11px] flex-shrink-0" style={{ color: "var(--muted)" }}>
                  {entry.review_count} reviews
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}