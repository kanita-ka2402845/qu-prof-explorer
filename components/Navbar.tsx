export default function Navbar() {
  return (
    <nav
      className="flex items-center justify-between px-8 py-4"
      style={{ borderBottom: "1px solid var(--hair)" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2">
        <span
          className="w-[7px] h-[7px] rounded-full"
          style={{
            background: "var(--lumen)",
            boxShadow: "0 0 8px 2px rgba(154,170,200,0.5)",
          }}
        />
        <span
          className="text-sm font-semibold tracking-wide"
          style={{ color: "var(--lumen-bright)" }}
        >
          QU PROF EXPLORER
        </span>
      </div>

      {/* Centre tag */}
      <span
        className="font-mono text-[10px] tracking-widest"
        style={{ color: "var(--muted)" }}
      >
        QU · V 1.0
      </span>

      {/* Status */}
      <div className="flex items-center gap-2">
        <span
          className="w-[5px] h-[5px] rounded-full"
          style={{ background: "#4ade80", boxShadow: "0 0 5px rgba(74,222,128,0.6)" }}
        />
        <span
          className="font-mono text-[10px] tracking-widest"
          style={{ color: "var(--muted)" }}
        >
          SYSTEM ONLINE
        </span>
      </div>
    </nav>
  );
}
