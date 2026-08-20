"use client";
import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { getInstructorsByDepartment } from "@/lib/queries";
import type { Instructor } from "@/lib/data";
import { useRouter } from "next/navigation";
import SuggestModal from "./SuggestModal";



type Props = {
  departmentId: string;
  departmentName: string;
  collegeName: string;
  collegeSlug: string;
};

export default function InstructorWindow({ departmentId, departmentName, collegeName, collegeSlug }: Props) {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const [showSuggest, setShowSuggest] = useState(false);

  useEffect(() => {
    setLoading(true);
    getInstructorsByDepartment(departmentId).then((data) => {
      setInstructors(data);
      setLoading(false);
    });
  }, [departmentId]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return instructors.filter(
      (i) =>
        i.full_name.toLowerCase().includes(q) ||
        i.courses?.some((c) => c.code.toLowerCase().includes(q))
    );
  }, [instructors, query]);

  const courseList = (inst: Instructor) =>
    inst.courses?.map((c) => c.code).join(", ") ?? "—";

  return (
    <motion.section
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.15, 0.83, 0.66, 1] }}
      className="px-4 sm:px-8 py-5 sm:py-7"
    >
      <div
        className="rounded-xl overflow-hidden relative"
        style={{
          background: "var(--graph)",
          border: "1px solid var(--hair2)",
          boxShadow: "var(--rim-inset), var(--shadow-card)",
        }}
      >
        <div
          className="absolute bottom-0 left-0 right-0 h-[1px] pointer-events-none"
          style={{ background: "var(--horizon)" }}
        />

        {/* Title bar */}
        <div
          className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
          style={{ borderBottom: "1px solid var(--hair)", background: "var(--panel)" }}
        >
          <div className="flex gap-[5px]">
            {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
              <span key={c} className="w-[9px] h-[9px] rounded-full" style={{ background: c }} />
            ))}
          </div>
          <span
            className="font-mono text-[10px] sm:text-[11px] tracking-[0.06em] text-center truncate max-w-[200px] sm:max-w-none"
            style={{ color: "var(--muted)" }}
          >
            {collegeName.toUpperCase()} / {departmentName.toUpperCase()}
          </span>
          <span
            className="font-mono text-[10px] px-2 py-[2px] rounded shrink-0"
            style={{ color: "var(--muted)", border: "1px solid var(--hair2)" }}
          >
            {instructors.length} instructors
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
            style={{ color: "var(--lumen-bright)", fontFamily: "inherit" }}
          />
        </div>

        {/* List */}
        <div style={{ maxHeight: "320px", overflowY: "auto" }}>
          {loading ? (
            <p className="font-mono text-[11px] text-center py-10" style={{ color: "var(--muted)" }}>
              LOADING...
            </p>
          ) : filtered.length === 0 ? (
            <p className="font-mono text-[11px] text-center py-10" style={{ color: "var(--muted)" }}>
              NO INSTRUCTORS FOUND.
            </p>
          ) : (
            filtered.map((inst, idx) => (
              <div
                key={inst.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 gap-3 transition-colors duration-100"
                style={{
                  borderBottom: idx < filtered.length - 1 ? "1px solid var(--hair)" : "none",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = "var(--panel)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = "transparent")}
              >
                <div>
                  <p className="text-[13px] font-medium" style={{ color: "var(--lumen)" }}>
                    {inst.full_name}
                  </p>
                  <p className="font-mono text-[10px] mt-[3px]" style={{ color: "var(--muted)" }}>
                    {courseList(inst)} · {inst.review_count} reviews
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                  <span className="font-mono text-[12px]" style={{ color: "var(--fore)" }}>
                    {inst.signal_strength > 0 ? `${inst.signal_strength.toFixed(1)} signal` : "—"}
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
                    onClick={() => router.push(`/professors/${inst.slug}?college=${encodeURIComponent(collegeSlug)}&dept=${encodeURIComponent(departmentId)}&collegeName=${encodeURIComponent(collegeName)}&deptName=${encodeURIComponent(departmentName)}`)}
                  >
                    View ↗
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        <div
  className="px-4 py-3 flex justify-end"
  style={{ borderTop: "1px solid var(--hair)" }}
>
  <button
    onClick={() => setShowSuggest(true)}
    className="font-mono text-[10px] tracking-widest transition-colors"
    style={{
      color: "var(--muted)", background: "transparent",
      border: "none", cursor: "pointer", fontFamily: "inherit",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--lumen)")}
    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
  >
    + Suggest a missing professor
  </button>
</div>

{showSuggest && (
  <SuggestModal mode="suggest" onClose={() => setShowSuggest(false)} />
)}
      </div>
    </motion.section>
  );
}