"use client";

import { useState } from "react";
import { updateUsername } from "@/lib/queries";
import { useAuth } from "@/components/AuthContext";
import type { ProfileFull, AwardId } from "@/lib/queries";

const AWARD_META: Record<AwardId, { label: string; icon: React.ReactNode }> = {
  first_voice: {
    label: "First Voice",
    icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  },
  precise: {
    label: "Precise",
    icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  },
  top_10: {
    label: "Top 10",
    icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>,
  },
  top_5: {
    label: "Top 5",
    icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>,
  },
  top_3: {
    label: "Top 3",
    icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>,
  },
  reviews_10: {
    label: "10 Reviews",
    icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  },
  reviews_15: {
    label: "15 Reviews",
    icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  },
};

function getInitials(username: string) {
  const words = username.replace(/_\d+$/, "").match(/[A-Z][a-z]*/g) ?? [username];
  return words.slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

type Props = {
  profile: ProfileFull;
  onProfileUpdate: (updated: Partial<ProfileFull>) => void;
  onAwardsClick: () => void;
  onLeaderboardClick: () => void;
};

export default function ProfileHero({ profile, onProfileUpdate, onAwardsClick, onLeaderboardClick }: Props) {
  const { session } = useAuth();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(profile.username);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const joined = new Date(profile.created_at).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const initials = getInitials(profile.username);

  async function handleSave() {
    if (!draft.trim() || draft === profile.username) { setEditing(false); return; }
    setSaving(true);
    setError(null);
    const { error } = await updateUsername(session!.user.id, draft.trim());
    if (error) {
      setError(error.includes("unique") ? "Username already taken" : error);
    } else {
      onProfileUpdate({ username: draft.trim() });
      setEditing(false);
    }
    setSaving(false);
  }

  return (
    <section className="rounded-xl px-6 py-6" style={{ background: "var(--graph)", border: "1px solid var(--hair)" }}>

      {/* Avatar + info */}
      <div className="flex items-start gap-5">
        <div
          className="w-16 h-16 rounded-[10px] flex items-center justify-center flex-shrink-0 select-none font-bold tracking-[-0.03em]"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--hair)",
            color: "var(--lumen-bright)",
            fontSize: "20px",
            fontFamily: "var(--font-space-grotesk)",
          }}
        >
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          {/* Username + edit */}
          {editing ? (
            <div className="flex items-center gap-2 mb-1">
              <input
                className="rounded-lg px-3 py-1.5 text-sm font-bold outline-none w-44"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--hair)",
                  color: "var(--lumen-bright)",
                  fontFamily: "var(--font-space-grotesk)",
                }}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                autoFocus
              />
              <button
                onClick={handleSave}
                disabled={saving}
                className="font-mono text-[10px] tracking-widest px-3 py-1.5 rounded-lg transition-colors"
                style={{ background: "var(--surface)", border: "1px solid var(--hair)", color: "var(--lumen-bright)" }}
              >
                {saving ? "..." : "Save"}
              </button>
              <button
                onClick={() => { setDraft(profile.username); setEditing(false); setError(null); }}
                className="font-mono text-[10px] tracking-widest"
                style={{ color: "var(--muted)" }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 mb-1">
              <h1 className="font-bold tracking-[-0.03em]" style={{ fontSize: "20px", color: "var(--lumen-bright)" }}>
                {profile.username}
              </h1>
              <button onClick={() => setEditing(true)} style={{ color: "var(--muted)" }} title="Edit username">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
            </div>
          )}

          {error && <p className="font-mono text-[10px] mb-1" style={{ color: "#f87171" }}>{error}</p>}

          <p className="font-mono text-[11px] tracking-wider" style={{ color: "var(--muted)" }}>{profile.qu_email}</p>
          <p className="font-mono text-[10px] tracking-widest uppercase mt-0.5" style={{ color: "var(--muted)" }}>
            Joined {joined}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div
        className="grid grid-cols-3 mt-5 rounded-lg overflow-hidden"
        style={{ border: "1px solid var(--hair)", background: "var(--hair)", gap: "1px" }}
      >
        {[
          { label: "Reviews", value: profile.review_count },
          { label: "Liked", value: profile.liked_count },
           {label: "Awards", value: profile.awards.length },
        ].map(({ label, value }) => (
          <div key={label} className="px-4 py-3" style={{ background: "var(--graph)" }}>
            <div className="font-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: "var(--muted)" }}>{label}</div>
            <div className="text-[15px] font-semibold tracking-[-0.02em]" style={{ color: "var(--lumen-bright)" }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Earned badge pills */}
      {profile.awards.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {profile.awards.map((id) => {
            const meta = AWARD_META[id];
            if (!meta) return null;
            return (
              <span
                key={id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[11px] tracking-wide"
                style={{ background: "var(--surface)", border: "1px solid var(--hair)", color: "var(--lumen-bright)" }}
              >
                {meta.icon}
                {meta.label}
              </span>
            );
          })}
        </div>
      )}

      {/* Awards + Leaderboard */}
      <div className="flex gap-2 mt-4">
        {[
          { label: "Awards", onClick: onAwardsClick },
          { label: "Leaderboard", onClick: onLeaderboardClick },
        ].map(({ label, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            className="font-mono text-[11px] uppercase tracking-widest px-4 py-2 rounded-lg transition-colors"
            style={{ background: "var(--surface)", border: "1px solid var(--hair)", color: "var(--muted)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--lumen-bright)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
          >
            {label}
          </button>
        ))}
      </div>
    </section>
  );
}