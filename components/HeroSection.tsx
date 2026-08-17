"use client";
import DotGrid from "./DotGrid";

type Props = { onDiveIn: () => void };

export default function HeroSection({ onDiveIn }: Props) {
  return (
    <section
      className="grid grid-cols-1 md:grid-cols-2"
      style={{
        borderBottom: "1px solid var(--hair)",
      }}
    >
      {/* LEFT */}
      <div
        className="flex flex-col justify-between p-6 sm:p-10 border-b md:border-b-0 md:border-r"
        style={{ borderColor: "var(--hair)" }}
      >
        <div>
          <p
            className="font-mono text-[10px] tracking-[0.18em] uppercase mb-5"
            style={{ color: "var(--muted)" }}
          >
            — Qatar University · Rate your instructors
          </p>

          <h1
            className="font-bold leading-[1.02] tracking-[-0.03em]"
            style={{ fontSize: "clamp(30px,4vw,46px)", color: "var(--lumen-bright)" }}
          >
            Interfaces that<br className="hidden sm:inline" />
            read as{" "}
            <span className="font-light italic" style={{ color: "var(--fore)" }}>
              honest.
            </span>
          </h1>

          <p
            className="mt-4 text-xs sm:text-sm leading-[1.75] max-w-[340px]"
            style={{ color: "var(--fore)" }}
          >
            Instructor reviews written by students who showed up.{" "}
            <strong style={{ color: "var(--lumen)", fontWeight: 500 }}>
              No admin. No filter.
            </strong>{" "}
            Just the signal you need before you register.
          </p>

          <div className="mt-7">
            <button
              onClick={onDiveIn}
              className="flex items-center gap-2 text-[13px] font-semibold rounded-md px-5 py-[10px] transition-opacity hover:opacity-85"
              style={{
                background: "var(--lumen-bright)",
                color: "var(--void)",
                boxShadow: "var(--rim-inset)",
                fontFamily: "inherit",
              }}
            >
              Dive in ↓
            </button>
          </div>
        </div>

        {/* Metrics */}
        <div
          className="flex gap-5 sm:gap-7 mt-6 pt-6"
          style={{ borderTop: "1px solid var(--hair)" }}
        >
          {[
            { val: "1,240", label: "Reviews" },
            { val: "86",    label: "Instructors" },
            { val: "4",     label: "Colleges" },
          ].map(({ val, label }) => (
            <div key={label} className="flex flex-col gap-1">
              <span
                className="font-bold tracking-[-0.03em]"
                style={{ fontSize: "22px", color: "var(--lumen-bright)" }}
              >
                {val}
              </span>
              <span
                className="font-mono text-[10px] uppercase tracking-[0.1em]"
                style={{ color: "var(--muted)" }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT — Hidden on mobile, rendered on desktop */}
      <div className="hidden md:block relative min-h-[340px]">
        <DotGrid />
      </div>
    </section>
  );
}