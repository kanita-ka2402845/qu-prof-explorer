"use client";
import { motion } from "framer-motion";
import { colleges } from "@/lib/data";

type Props = {
  collegeId: string;
  selectedDept: string | null;
  onSelect: (dept: string) => void;
};

export default function DeptGrid({ collegeId, selectedDept, onSelect }: Props) {
  const college = colleges.find((c) => c.id === collegeId);
  if (!college) return null;
  const depts = Object.entries(college.depts);
  const count = depts.length;

  return (
    <motion.section
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.15, 0.83, 0.66, 1] }}
      style={{ borderBottom: "1px solid var(--hair)" }}
    >
      <div className="flex items-baseline gap-3 px-8 pt-6 pb-4">
        <span
          className="font-mono text-[10px] tracking-[0.12em] uppercase"
          style={{ color: "var(--muted)" }}
        >
          Departments
        </span>
        <span className="font-mono text-[10px]" style={{ color: "var(--fore)" }}>
          · {college.name}
        </span>
      </div>

      {/* Equal-width grid — always fills full container */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${count}, 1fr)`,
          gap: "1px",
          background: "var(--hair)",
          borderTop: "1px solid var(--hair)",
        }}
      >
        {depts.map(([name, instructors]) => {
          const isSel = selectedDept === name;
          return (
            <button
              key={name}
              onClick={() => onSelect(name)}
              className="text-left p-5 transition-all duration-200 relative"
              style={{
                background: isSel ? "var(--panel)" : "var(--graph)",
                fontFamily: "inherit",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                if (!isSel)
                  (e.currentTarget as HTMLButtonElement).style.background = "var(--panel)";
              }}
              onMouseLeave={(e) => {
                if (!isSel)
                  (e.currentTarget as HTMLButtonElement).style.background = "var(--graph)";
              }}
            >
              {/* Radial matte glow — Lumen card signature */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "var(--radial-glow)",
                  opacity: isSel ? 1 : 0,
                  transition: "opacity 0.2s",
                }}
              />

              {/* Bottom horizon accent when selected */}
              {isSel && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-[1px]"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(200,208,224,0.45), transparent)",
                  }}
                />
              )}

              <div
                className="w-[5px] h-[5px] rounded-full mb-3"
                style={{
                  background: isSel ? "var(--lumen)" : "var(--muted)",
                  boxShadow: isSel ? "0 0 6px var(--lumen)" : "none",
                  transition: "all 0.2s",
                }}
              />
              <p
                className="text-[12px] font-medium leading-snug"
                style={{
                  color: isSel ? "var(--lumen-bright)" : "var(--fore)",
                  transition: "color 0.2s",
                }}
              >
                {name}
              </p>
              <p className="font-mono text-[10px] mt-1" style={{ color: "var(--muted)" }}>
                {instructors.length} instructor{instructors.length !== 1 ? "s" : ""}
              </p>
            </button>
          );
        })}
      </div>
    </motion.section>
  );
}
