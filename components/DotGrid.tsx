"use client";
import { useEffect, useRef, useCallback } from "react";

const COLS = 18;
const ROWS = 11;
const TOTAL = COLS * ROWS;

export default function DotGrid() {
  const containerRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement[]>([]);
  const animRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const applyGlow = useCallback((cx: number, cy: number) => {
    dotsRef.current.forEach((dot, i) => {
      const c = i % COLS;
      const r = Math.floor(i / COLS);
      const dist = Math.sqrt((c - cx) ** 2 + (r - cy) ** 2);

      if (dist < 1.6) {
        dot.style.opacity = "0.75";
        dot.style.transform = "scale(2)";
        dot.style.background = "var(--lumen-bright)";
      } else if (dist < 3.5) {
        const t = 1 - (dist - 1.6) / 1.9;
        dot.style.opacity = String(0.08 + t * 0.35);
        dot.style.transform = `scale(${1 + t * 0.6})`;
        dot.style.background = "var(--lumen)";
      } else {
        dot.style.opacity = "0.06";
        dot.style.transform = "scale(1)";
        dot.style.background = "white";
      }
    });
  }, []);

  const randomPulse = useCallback(() => {
    const cx = Math.random() * (COLS - 1);
    const cy = Math.random() * (ROWS - 1);
    applyGlow(cx, cy);
    animRef.current = setTimeout(randomPulse, 1800 + Math.random() * 800);
  }, [applyGlow]);

  useEffect(() => {
    animRef.current = setTimeout(randomPulse, 400);
    return () => {
      if (animRef.current) clearTimeout(animRef.current);
    };
  }, [randomPulse]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return;
      if (animRef.current) clearTimeout(animRef.current);
      const rect = containerRef.current.getBoundingClientRect();
      const cx = ((e.clientX - rect.left) / rect.width) * (COLS - 1);
      const cy = ((e.clientY - rect.top) / rect.height) * (ROWS - 1);
      applyGlow(cx, cy);
    },
    [applyGlow]
  );

  const handleMouseLeave = useCallback(() => {
    animRef.current = setTimeout(randomPulse, 300);
  }, [randomPulse]);

  return (
    <div
      ref={containerRef}
      className="dot-grid-wrap relative w-full h-full overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse 90% 65% at 50% 105%, rgba(154,170,200,0.1) 0%, transparent 70%)",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Atmosphere label */}
      <span
        className="absolute bottom-4 right-5 font-mono text-[10px] tracking-widest z-10 select-none"
        style={{ color: "var(--muted)" }}
      >
        ATMOSPHERE
      </span>

      {/* Dot grid */}
      <div
        className="absolute inset-0 p-8"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gap: "10px",
          alignContent: "center",
        }}
      >
        {Array.from({ length: TOTAL }).map((_, i) => (
          <div
            key={i}
            ref={(el) => {
              if (el) dotsRef.current[i] = el;
            }}
            style={{
              width: "3px",
              height: "3px",
              borderRadius: "50%",
              background: "white",
              opacity: 0.06,
              transition: "opacity 0.35s ease, transform 0.35s ease, background 0.35s ease",
              justifySelf: "center",
            }}
          />
        ))}
      </div>
    </div>
  );
}
