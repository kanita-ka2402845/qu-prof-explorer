"use client";
import type { FullInstructor } from "@/app/professors/[slug]/page";

const STYLE_LABELS: Record<string, string> = {
  reads_slides:           "Reads from slides",
  explains_beyond_slides: "Explains beyond slides",
  discussion_based:       "Discussion-based",
  heavy_examples:         "Heavy on examples",
  research_focused:       "Research-focused",
  mixed:                  "Mixed / varies",
};

type Props = { instructor: FullInstructor };

export default function InstructorHeader({ instructor: inst }: Props) {
  const retakeTotal = inst.retake_yes_count + inst.retake_no_count;
  const retakePct   = retakeTotal > 0
    ? Math.round((inst.retake_yes_count / retakeTotal) * 100)
    : null;

  const strictTotal = inst.attendance_strict_yes + inst.attendance_strict_no;
  const strictPct   = strictTotal > 0
    ? Math.round((inst.attendance_strict_yes / strictTotal) * 100)
    : null;

  const gradeTotal =
    inst.grade_flying_colours + inst.grade_pass_alright +
    inst.grade_barely_pass + inst.grade_retook;

  const courseCodes = inst.courses.map((c) => c.code).join(" · ");

  return (
    <section className="px-8 py-8">
      {/* Breadcrumb */}
      <p className="font-mono text-[10px] tracking-widest uppercase mb-4" style={{ color: "var(--muted)" }}>
        {inst.departments?.colleges?.name} · {inst.departments?.name}
      </p>

      {/* Name + signal */}
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div>
          <h1
            className="font-bold tracking-[-0.03em] leading-none"
            style={{ fontSize: "clamp(28px, 4vw, 42px)", color: "var(--lumen-bright)" }}
          >
            {inst.full_name}
          </h1>
          <p className="font-mono text-[11px] mt-2 tracking-wider" style={{ color: "var(--muted)" }}>
            {courseCodes}
          </p>
        </div>

        {/* Signal strength */}
        <div className="text-right flex-shrink-0">
          <div
            className="font-bold tracking-[-0.04em]"
            style={{ fontSize: "clamp(32px, 5vw, 52px)", color: "var(--lumen-bright)", lineHeight: 1 }}
          >
            {inst.signal_strength > 0 ? inst.signal_strength.toFixed(1) : "—"}
          </div>
          <div className="font-mono text-[10px] tracking-widest mt-1" style={{ color: "var(--muted)" }}>
            SIGNAL STRENGTH
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div
        className="grid mt-8 pt-6"
        style={{
          borderTop: "1px solid var(--hair)",
          gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
          gap: "1px",
          background: "var(--hair)",
          border: "1px solid var(--hair)",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        {[
          {
            label: "Reviews",
            value: inst.review_count > 0 ? String(inst.review_count) : "—",
          },
          {
            label: "Clarity",
            value: inst.avg_clarity > 0 ? `${inst.avg_clarity.toFixed(1)} / 5` : "—",
          },
          {
            label: "Exam difficulty",
            value: inst.avg_exam_difficulty > 0 ? `${inst.avg_exam_difficulty.toFixed(1)} / 5` : "—",
          },
          {
            label: "Would retake",
            value: retakePct !== null ? `${retakePct}%` : "—",
          },
          {
            label: "Strict attendance",
            value: strictPct !== null ? `${strictPct}% say yes` : "—",
          },
          ...(inst.top_teaching_style ? [{
            label: "Teaching style",
            value: STYLE_LABELS[inst.top_teaching_style] ?? inst.top_teaching_style,
          }] : []),
        ].map(({ label, value }) => (
          <div
            key={label}
            className="px-4 py-4"
            style={{ background: "var(--graph)" }}
          >
            <div
              className="font-mono text-[10px] uppercase tracking-widest mb-2"
              style={{ color: "var(--muted)" }}
            >
              {label}
            </div>
            <div
              className="text-[15px] font-semibold tracking-[-0.02em]"
              style={{ color: "var(--lumen-bright)" }}
            >
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Grade aggregate — only shown if any grades reported */}
      {gradeTotal > 0 && (
        <div className="mt-4 px-4 py-4 rounded-lg" style={{ background: "var(--graph)", border: "1px solid var(--hair)" }}>
          <p className="font-mono text-[10px] uppercase tracking-widest mb-3" style={{ color: "var(--muted)" }}>
            Grade distribution · {gradeTotal} reported · shown in aggregate only
          </p>
          <div className="flex gap-6 flex-wrap">
            {[
              { label: "Passed with flying colours", count: inst.grade_flying_colours },
              { label: "Passed alright",             count: inst.grade_pass_alright },
              { label: "Barely passed",              count: inst.grade_barely_pass },
              { label: "Retook the course",          count: inst.grade_retook },
            ].filter(g => g.count > 0).map(({ label, count }) => (
              <div key={label} className="flex flex-col gap-1">
                <span className="text-[13px] font-semibold" style={{ color: "var(--lumen-bright)" }}>
                  {count}
                </span>
                <span className="font-mono text-[10px]" style={{ color: "var(--muted)" }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}