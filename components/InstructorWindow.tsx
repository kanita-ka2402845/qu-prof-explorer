"use client";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { colleges, type Instructor } from "@/lib/data";

type Props = {
  collegeId: string;
  dept: string;
};

export default function InstructorWindow({ collegeId, dept }: Props) {
  const [query, setQuery] = useState("");

  const college = colleges.find((c) => c.id === collegeId);
  const allInstructors: Instructor[] = college?.depts[dept] ?? [];

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return allInstructors.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.courses.toLowerCase().includes(q)
    );
  }, [allInstructors, query]);

  return (
    <motion.section
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.15, 0.83, 0.66, 1] }}
      className="px-8 py-7"
    >
      {/* Mac-chrome window */}
      <div
        className="rounded-xl overflow-hidden relative"
        style={{
          background: "var(--graph)",
          border: "1px solid var(--hair2)",
          /* Lumen bottom glow */
          boxShadow: "0 0 0 0 transparent",
        }}
      >
        {/* horizon glow at bottom of window */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[1px] pointer-events-none"
          style={{ background: "var(--horizon)" }}
        />

        {/* Title bar */}
        <div
          className="flex items-center gap-3 px-4 py-3"
          style={{ borderBottom: "1px solid var(--hair)", background: "var(--panel)" }}
        >
          {/* traffic lights */}
          <div className="flex gap-[5px]">
            {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
              <span key={c} className="w-[9px] h-[9px] rounded-full" style={{ background: c }} />
            ))}
          </div>
          <span
            className="font-mono text-[11px] tracking-[0.06em] mx-auto"
            style={{ color: "var(--muted)" }}
          >
            {collegeId.toUpperCase()} / {dept.toUpperCase()}
          </span>
          <span
            className="font-mono text-[10px] px-2 py-[2px] rounded"
            style={{
              color: "var(--muted)",
              border: "1px solid var(--hair2)",
            }}
          >
            {allInstructors.length} instructors
          </span>
        </div>

        {/* Search */}
        <div
          className="flex items-center gap-3 px-4 py-3"
          style={{ borderBottom: "1px solid var(--hair)", background: "var(--void)" }}
        >
          <Search size={14} color="var(--muted)" />
          <input
            type="text"
            placeholder="Search instructors or course codes…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-[13px]"
            style={{
              color: "var(--lumen-bright)",
              fontFamily: "inherit",
            }}
          />
        </div>

        {/* Instructor list */}
        <div style={{ maxHeight: "280px", overflowY: "auto" }}>
          {filtered.length === 0 ? (
            <p
              className="font-mono text-[12px] text-center py-10"
              style={{ color: "var(--muted)" }}
            >
              NO INSTRUCTORS FOUND.
            </p>
          ) : (
            filtered.map((inst, idx) => (
              <div
                key={inst.name}
                className="group grid items-center px-4 py-3 transition-colors duration-100"
                style={{
                  gridTemplateColumns: "1fr auto auto",
                  gap: "16px",
                  borderBottom: idx < filtered.length - 1 ? "1px solid var(--hair)" : "none",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLDivElement).style.background = "var(--panel)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLDivElement).style.background = "transparent")
                }
              >
                <div>
                  <p
                    className="text-[13px] font-medium"
                    style={{ color: "var(--lumen)" }}
                  >
                    {inst.name}
                  </p>
                  <p
                    className="font-mono text-[10px] mt-[3px]"
                    style={{ color: "var(--muted)" }}
                  >
                    {inst.courses} · {inst.reviews} reviews
                  </p>
                </div>

                <span
                  className="font-mono text-[12px]"
                  style={{ color: "var(--fore)" }}
                >
                  {inst.rating.toFixed(1)} / 5.0
                </span>

                <button
                  className="font-mono text-[10px] px-3 py-[4px] rounded uppercase tracking-[0.04em] transition-all duration-150"
                  style={{
                    color: "var(--muted)",
                    border: "1px solid var(--hair2)",
                    background: "transparent",
                    fontFamily: "inherit",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--lumen-bright)";
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.28)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--muted)";
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--hair2)";
                  }}
                >
                  View ↗
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </motion.section>
  );
}
