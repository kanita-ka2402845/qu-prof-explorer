"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getDepartmentsByCollege } from "@/lib/queries";
import type { Department } from "@/lib/data";

type Props = {
  collegeSlug: string;
  selectedDeptId: string | null;
  onSelect: (id: string, name: string) => void;
};

export default function DeptGrid({ collegeSlug, selectedDeptId, onSelect }: Props) {
  const [depts, setDepts] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getDepartmentsByCollege(collegeSlug).then((data) => {
      setDepts(data);
      setLoading(false);
    });
  }, [collegeSlug]);

  if (loading) return (
    <div
      className="px-4 sm:px-8 py-5 font-mono text-[10px] tracking-widest"
      style={{ color: "var(--muted)", borderBottom: "1px solid var(--hair)" }}
    >
      LOADING DEPARTMENTS...
    </div>
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.15, 0.83, 0.66, 1] }}
      style={{ borderBottom: "1px solid var(--hair)" }}
    >
      <div className="flex items-baseline gap-3 px-4 sm:px-8 pt-6 pb-4">
        <span
          className="font-mono text-[10px] tracking-[0.12em] uppercase"
          style={{ color: "var(--muted)" }}
        >
          Departments
        </span>
      </div>

      <div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-[1px]"
        style={{
          background: "var(--hair)",
          borderTop: "1px solid var(--hair)",
        }}
      >
        {depts.map((dept) => {
          const isSel = selectedDeptId === dept.id;
          return (
            <button
              key={dept.id}
              onClick={() => onSelect(dept.id, dept.name)}
              className="text-left p-4 sm:p-5 transition-all duration-200 relative"
              style={{
                background: isSel ? "var(--panel)" : "var(--graph)",
                boxShadow: isSel ? "var(--rim-inset)" : "none",
                fontFamily: "inherit",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                if (!isSel) (e.currentTarget as HTMLButtonElement).style.background = "var(--panel)";
              }}
              onMouseLeave={(e) => {
                if (!isSel) (e.currentTarget as HTMLButtonElement).style.background = "var(--graph)";
              }}
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "var(--radial-glow)",
                  opacity: isSel ? 1 : 0,
                  transition: "opacity 0.2s",
                }}
              />
              {isSel && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-[1px]"
                  style={{
                    background: "linear-gradient(90deg, transparent, var(--accent-bright), transparent)",
                  }}
                />
              )}
              <div
                className="w-[5px] h-[5px] rounded-full mb-3"
                style={{
                  background: isSel ? "var(--accent)" : "var(--muted)",
                  boxShadow: isSel ? "0 0 6px var(--accent)" : "none",
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
                {dept.name}
              </p>
            </button>
          );
        })}
      </div>
    </motion.section>
  );
}