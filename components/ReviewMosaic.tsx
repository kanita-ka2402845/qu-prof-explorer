"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { Review } from "@/app/professors/[slug]/page";
import { useAuth } from "@/components/AuthContext";
import { toggleHelpfulVote, getUserVotes } from "@/lib/queries";

const TEACHING_STYLE_LABELS: Record<string, string> = {
  reads_slides:           "Reads from slides",
  explains_beyond_slides: "Explains beyond slides",
  discussion_based:       "Discussion-based",
  heavy_examples:         "Heavy on examples",
  research_focused:       "Research-focused",
  mixed:                  "Mixed / varies",
};

const GRADE_LABELS: Record<string, string> = {
  flying_colours: "Passed with flying colours",
  pass_alright:   "Passed alright",
  barely_pass:    "Barely passed",
  retook:         "Retook the course",
};

type Props = {
  reviews: Review[];
  instructorId: string;
  onWriteReview: () => void;
};

export default function ReviewMosaic({ reviews, instructorId, onWriteReview }: Props) {
  const { session } = useAuth();
  const [votedIds, setVotedIds] = useState<string[]>([]);
  const [localCounts, setLocalCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const counts: Record<string, number> = {};
    reviews.forEach((r) => { counts[r.id] = r.helpful_count; });
    setLocalCounts(counts);
  }, [reviews]);

  useEffect(() => {
    if (!session) return;
    getUserVotes(session.user.id).then(setVotedIds);
  }, [session]);

  async function handleVote(reviewId: string) {
    if (!session) { return; }
    const { voted } = await toggleHelpfulVote(reviewId, session.user.id);
    setVotedIds((prev) =>
      voted ? [...prev, reviewId] : prev.filter((id) => id !== reviewId)
    );
    setLocalCounts((prev) => ({
      ...prev,
      [reviewId]: (prev[reviewId] ?? 0) + (voted ? 1 : -1),
    }));
  }

  return (
    <section className="px-8 py-8">
      {/* Permanent ambient line + THINK */}
      <div
        className="flex items-start justify-between gap-4 mb-8 pb-5"
        style={{ borderBottom: "1px solid var(--hair)" }}
      >
        <div className="flex flex-col gap-1">
            <p className="font-mono text-[10px] tracking-widest" style={{ color: "var(--muted)" }}>
      Say what would benefit your fellow students — truthful, helpful, &  kind.
    </p>
    <p className="font-mono text-[10px] mt-1" style={{ color: "var(--fore)" }}>
      Negative reviews are welcome and needed.
    </p>
        </div>
        <div className="flex-shrink-0">
          <ThinkButton />
        </div>
      </div>

      {/* Empty state */}
      {reviews.length === 0 && (
        <div
          className="flex flex-col items-center justify-center py-20 rounded-xl"
          style={{ border: "1px solid var(--hair)", background: "var(--graph)" }}
        >
          <p className="font-mono text-[11px] tracking-widest mb-6" style={{ color: "var(--muted)" }}>
            NO REVIEWS YET. BE THE FIRST TO HELP SOMEONE.
          </p>
          <button
            className="font-mono text-[11px] tracking-widest px-6 py-3 rounded-lg transition-opacity hover:opacity-85"
            style={{
              background: "var(--lumen-bright)",
              color: "var(--void)",
              border: "none",
              boxShadow: "var(--rim-inset)",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
            onClick={onWriteReview}
          >
            WRITE A REVIEW ↗
          </button>
        </div>
      )}

      {/* Mosaic */}
      {reviews.length > 0 && (
        <>
          <div style={{ columns: "1", columnGap: "10px" }} className="mosaic-grid">
            {reviews.map((review, idx) => (
              <ReviewCard
                key={review.id}
                review={review}
                idx={idx}
                voted={votedIds.includes(review.id)}
                helpfulCount={localCounts[review.id] ?? review.helpful_count}
                onVote={() => handleVote(review.id)}
              />
            ))}
          </div>

          <div
            className="mt-8 flex items-center justify-between px-6 py-4 rounded-lg"
            style={{ border: "1px solid var(--hair)", background: "var(--graph)" }}
          >
            <p className="text-[13px]" style={{ color: "var(--fore)" }}>
              Took a course with this instructor?
            </p>
            <button
              className="font-mono text-[11px] tracking-widest px-5 py-[8px] rounded-md transition-opacity hover:opacity-85"
              style={{
                background: "var(--lumen-bright)",
                color: "var(--void)",
                border: "none",
                boxShadow: "var(--rim-inset)",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
              onClick={onWriteReview}
            >
              WRITE A REVIEW ↗
            </button>
          </div>
        </>
      )}

      <style>{`
        @media (min-width: 640px)  { .mosaic-grid { columns: 2 !important; } }
        @media (min-width: 900px)  { .mosaic-grid { columns: 3 !important; } }
      `}</style>
    </section>
  );
}

type CardProps = {
  review: Review;
  idx: number;
  voted: boolean;
  helpfulCount: number;
  onVote: () => void;
};

function ReviewCard({ review, idx, voted, helpfulCount, onVote }: CardProps) {
  const tags = review.review_tags?.map((rt) => rt.tags?.label).filter(Boolean) ?? [];
  const timeAgo = getTimeAgo(review.created_at);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: idx * 0.04, ease: [0.15, 0.83, 0.66, 1] }}
      style={{
        background: "var(--graph)",
        border: "1px solid var(--hair)",
        borderRadius: "10px",
        padding: "16px",
        marginBottom: "10px",
        breakInside: "avoid",
        position: "relative",
        overflow: "hidden",
        boxShadow: "var(--rim-inset), var(--shadow-card)",
      }}
    >
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "var(--radial-glow)", opacity: 0.6 }} />

      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-[10px] tracking-widest uppercase" style={{ color: "var(--lumen)" }}>
          {review.courses?.code ?? "—"}
        </span>
        <span className="font-mono text-[10px]" style={{ color: "var(--muted)" }}>
          {review.semester} {review.semester_year}
        </span>
      </div>

      <p className="text-[13px] leading-[1.7]" style={{ color: "var(--fore)" }}>
        {review.body}
      </p>

      <div className="flex gap-4 mt-4 pt-3 flex-wrap" style={{ borderTop: "1px solid var(--hair)" }}>
        <div className="flex flex-col gap-[2px]">
          <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color: "var(--muted)" }}>Clarity</span>
          <span className="text-[12px] font-semibold" style={{ color: "var(--lumen-bright)" }}>{review.clarity} / 5</span>
        </div>
        <div className="flex flex-col gap-[2px]">
          <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color: "var(--muted)" }}>Exam diff.</span>
          <span className="text-[12px] font-semibold" style={{ color: "var(--lumen-bright)" }}>{review.exam_difficulty} / 5</span>
        </div>
        <div className="flex flex-col gap-[2px]">
          <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color: "var(--muted)" }}>Retake?</span>
          <span className="text-[12px] font-semibold" style={{ color: review.would_retake ? "var(--lumen-bright)" : "var(--fore)" }}>
            {review.would_retake ? "Yes" : "No"}
          </span>
        </div>
        {review.grade_received && (
          <div className="flex flex-col gap-[2px]">
            <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color: "var(--muted)" }}>Grade</span>
            <span className="text-[12px] font-semibold" style={{ color: "var(--lumen-bright)" }}>
              {GRADE_LABELS[review.grade_received]}
            </span>
          </div>
        )}
      </div>

      {review.teaching_style && (
        <div className="mt-3">
          <span className="font-mono text-[10px] px-2 py-[3px] rounded"
            style={{ background: "var(--panel)", color: "var(--fore)", border: "1px solid var(--hair2)" }}>
            {TEACHING_STYLE_LABELS[review.teaching_style]}
          </span>
        </div>
      )}

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-[5px] mt-3">
          {tags.map((tag) => (
            <span key={tag} className="font-mono text-[10px] px-2 py-[3px] rounded"
              style={{ background: "var(--panel)", color: "var(--muted)", border: "1px solid var(--hair)" }}>
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: "1px solid var(--hair)" }}>
        <span className="font-mono text-[10px]" style={{ color: "var(--muted)" }}>{timeAgo}</span>
        <button
          onClick={onVote}
          className="flex items-center gap-1 font-mono text-[10px] tracking-widest transition-all px-2 py-1 rounded"
          style={{
            background: voted ? "rgba(174,187,208,0.12)" : "transparent",
            border: `1px solid ${voted ? "rgba(174,187,208,0.4)" : "transparent"}`,
            color: voted ? "var(--accent-bright)" : "var(--muted)",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
          onMouseEnter={(e) => {
            if (!voted) (e.currentTarget as HTMLButtonElement).style.color = "var(--lumen)";
          }}
          onMouseLeave={(e) => {
            if (!voted) (e.currentTarget as HTMLButtonElement).style.color = "var(--muted)";
          }}
        >
          ↑ {helpfulCount > 0 ? helpfulCount : ""} Helpful
        </button>
      </div>
    </motion.div>
  );
}

function ThinkButton() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="font-mono text-[10px] tracking-widest px-3 py-[5px] rounded transition-all"
        style={{
          color: "var(--muted)", border: "1px solid var(--hair2)",
          background: "transparent", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--lumen)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
      >
        ? THINK
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -4, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="absolute right-0 mt-2 rounded-lg px-4 py-4 z-20"
          style={{
            background: "var(--panel)", border: "1px solid var(--hair2)",
            boxShadow: "var(--rim-inset), var(--shadow-floating)", width: "280px",
          }}
        >
          <p className="text-[12px] leading-relaxed mb-3" style={{ color: "var(--fore)" }}>
            Before posting, ask yourself:
          </p>
          {[
            { letter: "T", word: "True",      q: "Is this actually what I experienced?" },
            { letter: "H", word: "Helpful",   q: "Would this help someone make a better decision?" },
            { letter: "I", word: "Inspiring", q: "Does this give someone a clearer picture of what to expect?" },
            { letter: "N", word: "Necessary", q: "Does this add something useful?" },
            { letter: "K", word: "Kind",      q: "Am I critiquing teaching, not the person?" },
          ].map(({ letter, word, q }) => (
            <div key={letter} className="flex gap-3 mb-2">
              <span className="font-mono text-[11px] font-bold w-4 flex-shrink-0" style={{ color: "var(--lumen-bright)" }}>{letter}</span>
              <span className="text-[12px]" style={{ color: "var(--fore)" }}>
                <strong style={{ color: "var(--lumen)" }}>{word}</strong> — {q}
              </span>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7)   return `${days}d ago`;
  if (weeks < 5)  return `${weeks}w ago`;
  return `${months}mo ago`;
}

