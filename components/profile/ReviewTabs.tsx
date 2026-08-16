"use client";

import { useState } from "react";
import Link from "next/link";

type Review = {
  id: string;
  body: string;
  clarity: number;
  exam_difficulty: number;
  would_retake: boolean;
  semester: string;
  semester_year: number;
  created_at: string;
  helpful_count: number;
  instructors: { id: string; full_name: string; slug: string } | null;
  courses: { id: string; code: string; name: string | null } | null;
};

function ReviewCard({ review }: { review: Review }) {
  return (
    <article
      className="rounded-xl px-4 py-4"
      style={{ background: "var(--graph)", border: "1px solid var(--hair)" }}
    >
      {/* Prof + course */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          {review.instructors ? (
            <Link
              href={`/professors/${review.instructors.slug}`}
              className="text-[13px] font-semibold tracking-[-0.01em] hover:underline"
              style={{ color: "var(--lumen-bright)" }}
            >
              {review.instructors.full_name}
            </Link>
          ) : (
            <span className="text-[13px] font-semibold" style={{ color: "var(--lumen-bright)" }}>Unknown</span>
          )}
          {review.courses && (
            <p className="font-mono text-[10px] tracking-widest mt-0.5" style={{ color: "var(--muted)" }}>
              {review.courses.code}
            </p>
          )}
        </div>

        {/* Semester */}
        <span
          className="font-mono text-[10px] tracking-widest flex-shrink-0"
          style={{ color: "var(--muted)" }}
        >
          {review.semester} {review.semester_year}
        </span>
      </div>

      {/* Stats row */}
      <div
        className="grid grid-cols-3 rounded-lg overflow-hidden mb-3"
        style={{ border: "1px solid var(--hair)", background: "var(--hair)", gap: "1px" }}
      >
        {[
          { label: "Clarity", value: `${review.clarity} / 5` },
          { label: "Difficulty", value: `${review.exam_difficulty} / 5` },
          { label: "Retake", value: review.would_retake ? "Yes" : "No" },
        ].map(({ label, value }) => (
          <div key={label} className="px-3 py-2" style={{ background: "var(--graph)" }}>
            <div className="font-mono text-[9px] uppercase tracking-widest mb-0.5" style={{ color: "var(--muted)" }}>{label}</div>
            <div className="text-[12px] font-semibold" style={{ color: "var(--lumen-bright)" }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Body */}
      <p className="text-[13px] leading-relaxed line-clamp-3" style={{ color: "var(--lumen)" }}>
        {review.body}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: "1px solid var(--hair)" }}>
        <span className="font-mono text-[10px]" style={{ color: "var(--muted)" }}>
          {new Date(review.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
        </span>
        <div className="flex items-center gap-1 font-mono text-[10px]" style={{ color: "var(--muted)" }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
            <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
          </svg>
          {review.helpful_count} helpful
        </div>
      </div>
    </article>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl px-6 py-10 text-center" style={{ border: "1px dashed var(--hair)" }}>
      <p className="font-mono text-[11px] tracking-widest" style={{ color: "var(--muted)" }}>{message}</p>
    </div>
  );
}

type Props = { myReviews: Review[]; likedReviews: Review[] };

export default function ReviewTabs({ myReviews, likedReviews }: Props) {
  const [tab, setTab] = useState<"mine" | "liked">("mine");
  const reviews = tab === "mine" ? myReviews : likedReviews;

  return (
    <section>
      {/* Tabs */}
      <div
        className="flex gap-1 p-1 rounded-lg w-fit mb-5"
        style={{ background: "var(--graph)", border: "1px solid var(--hair)" }}
      >
        {([
          { id: "mine", label: "My Reviews", count: myReviews.length },
          { id: "liked", label: "Liked Reviews", count: likedReviews.length },
        ] as const).map(({ id, label, count }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className="flex items-center gap-2 px-4 py-2 rounded-md font-mono text-[11px] tracking-widest uppercase transition-colors"
            style={{
              background: tab === id ? "var(--surface)" : "transparent",
              border: tab === id ? "1px solid var(--hair)" : "1px solid transparent",
              color: tab === id ? "var(--lumen-bright)" : "var(--muted)",
            }}
          >
            {label}
            <span
              className="text-[10px] px-1.5 py-0.5 rounded"
              style={{ background: "var(--void)", color: "var(--muted)" }}
            >
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Cards */}
      {reviews.length === 0 ? (
        <EmptyState message={tab === "mine" ? "No reviews written yet" : "No liked reviews yet"} />
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => <ReviewCard key={r.id} review={r} />)}
        </div>
      )}
    </section>
  );
}