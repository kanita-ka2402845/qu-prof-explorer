"use client";
import { motion } from "framer-motion";
import type { Review } from "@/app/professors/[slug]/page";

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
  return (
    <section className="px-8 py-8">

      {/* Permanent hadith line */}
      <div
        className="flex items-center gap-4 mb-8"
        style={{ borderBottom: "1px solid var(--hair)", paddingBottom: "20px" }}
      >
        <div className="flex-1 h-[1px]" style={{ background: "var(--hair)" }} />
        <p
          className="font-mono text-[10px] tracking-widest text-center"
          style={{ color: "var(--muted)", maxWidth: "420px" }}
        >
          "Speak good or remain silent." — Sahih al-Bukhari
          <span className="block mt-1" style={{ color: "var(--muted)", opacity: 0.5 }}>
            This reminder is for me before it is for you.
          </span>
        </p>
        <div className="flex-1 h-[1px]" style={{ background: "var(--hair)" }} />
      </div>

      {/* Empty state */}
      {reviews.length === 0 && (
        <div
          className="flex flex-col items-center justify-center py-20 rounded-xl"
          style={{ border: "1px solid var(--hair)", background: "var(--graph)" }}
        >
          <p
            className="font-mono text-[11px] tracking-widest mb-6"
            style={{ color: "var(--muted)" }}
          >
            NO REVIEWS YET. BE THE FIRST.
          </p>
          <button
            className="font-mono text-[11px] tracking-widest px-6 py-3 rounded-lg transition-opacity hover:opacity-85"
                style={{
              background: "var(--lumen-bright)",
              color: "var(--void)",
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
            onClick={() => { console.log("button clicked"); onWriteReview(); }}
          >
            WRITE A REVIEW ↗
          </button>
        </div>
      )}

      {/* Mosaic grid */}
      {reviews.length > 0 && (
        <>
          <div
            style={{
              columns: "1",
              columnGap: "10px",
            }}
            className="mosaic-grid"
          >
            {reviews.map((review, idx) => (
              <ReviewCard key={review.id} review={review} idx={idx} />
            ))}
          </div>

          {/* Write a review CTA */}
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
                cursor: "pointer",
                fontFamily: "inherit",
              }}
              onClick={() => { console.log("button clicked"); onWriteReview(); }}
            >
              WRITE A REVIEW ↗
            </button>
          </div>
        </>
      )}

      <style>{`
        @media (min-width: 640px) {
          .mosaic-grid { columns: 2 !important; }
        }
        @media (min-width: 900px) {
          .mosaic-grid { columns: 3 !important; }
        }
      `}</style>
    </section>
  );
}

function ReviewCard({ review, idx }: { review: Review; idx: number }) {
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
      }}
    >
      {/* Radial glow */}
      <div
        style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "var(--radial-glow)", opacity: 0.6,
        }}
      />

      {/* Course + semester */}
      <div className="flex items-center justify-between mb-3">
        <span
          className="font-mono text-[10px] tracking-widest uppercase"
          style={{ color: "var(--lumen)" }}
        >
          {review.courses?.code ?? "—"}
        </span>
        <span className="font-mono text-[10px]" style={{ color: "var(--muted)" }}>
          {review.semester} {review.semester_year}
        </span>
      </div>

      {/* Body */}
      <p
        className="text-[13px] leading-[1.7]"
        style={{ color: "var(--fore)" }}
      >
        {review.body}
      </p>

      {/* Ratings row */}
      <div
        className="flex gap-4 mt-4 pt-3 flex-wrap"
        style={{ borderTop: "1px solid var(--hair)" }}
      >
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

      {/* Teaching style */}
      {review.teaching_style && (
        <div className="mt-3">
          <span
            className="font-mono text-[10px] px-2 py-[3px] rounded"
            style={{ background: "var(--panel)", color: "var(--fore)", border: "1px solid var(--hair2)" }}
          >
            {TEACHING_STYLE_LABELS[review.teaching_style]}
          </span>
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-[5px] mt-3">
          {tags.map((tag) => (
            <span
              key={tag}
              className="font-mono text-[10px] px-2 py-[3px] rounded"
              style={{ background: "var(--panel)", color: "var(--muted)", border: "1px solid var(--hair)" }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: "1px solid var(--hair)" }}>
        <span className="font-mono text-[10px]" style={{ color: "var(--muted)" }}>
          {timeAgo}
        </span>
        <button
          className="font-mono text-[10px] tracking-widest transition-colors"
          style={{ background: "transparent", border: "none", color: "var(--muted)", cursor: "pointer", fontFamily: "inherit" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--lumen)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
        >
          ↑ Helpful {review.helpful_count > 0 ? `(${review.helpful_count})` : ""}
        </button>
      </div>
    </motion.div>
  );
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  if (mins < 60)   return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  if (days < 7)    return `${days}d ago`;
  if (weeks < 5)   return `${weeks}w ago`;
  return `${months}mo ago`;
}