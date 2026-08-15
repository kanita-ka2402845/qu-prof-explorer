"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getColleges } from "@/lib/queries";
import type { College } from "@/lib/data";

type Props = {
  selectedId: string | null;
  onSelect: (id: string, slug: string, name: string) => void;
};

export default function CollegeStrip({ selectedId, onSelect }: Props) {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getColleges().then((data) => {
      setColleges(data);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div
      className="px-8 py-5 font-mono text-[10px] tracking-widest"
      style={{ color: "var(--muted)", borderBottom: "1px solid var(--hair)" }}
    >
      LOADING COLLEGES...
    </div>
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.15, 0.83, 0.66, 1] }}
      style={{ borderBottom: "1px solid var(--hair)" }}
    >
      <p
        className="font-mono text-[10px] tracking-[0.14em] uppercase px-8 pt-4 pb-0"
        style={{ color: "var(--muted)" }}
      >
        — Choose your college
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${colleges.length}, 1fr)`,
        }}
      >
        {colleges.map((col) => {
          const isSel = selectedId === col.id;
          return (
            <button
              key={col.id}
              onClick={() => onSelect(col.id, col.slug, col.name)}
              className="relative py-4 text-[13px] font-medium transition-all duration-200 text-center"
              style={{
                color: isSel ? "var(--lumen-bright)" : "var(--muted)",
                fontWeight: isSel ? 600 : 400,
                borderRight: "1px solid var(--hair)",
                background: isSel ? "rgba(255,255,255,0.03)" : "transparent",
                fontFamily: "inherit",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                if (!isSel) (e.currentTarget as HTMLButtonElement).style.color = "var(--lumen)";
              }}
              onMouseLeave={(e) => {
                if (!isSel) (e.currentTarget as HTMLButtonElement).style.color = "var(--muted)";
              }}
            >
              {col.name}
              {isSel && (
                <motion.span
                  layoutId="college-underline"
                  className="absolute bottom-0 left-0 right-0 h-[1px]"
                  style={{
                    background: "var(--accent-bright)",
                    boxShadow: "0 0 6px var(--accent)",
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </motion.section>
  );
}