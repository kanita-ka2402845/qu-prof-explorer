"use client";
import { useAuth } from "@/components/AuthContext";
import { signOut } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { getProfile } from "@/lib/queries";
import {useState, useEffect} from "react";
import Link from "next/link";

export default function Navbar() {
  const { session } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);

useEffect(() => {
  if (session?.user?.id) {
    getProfile(session.user.id).then((p) => {
      if (p?.username) setUsername(p.username);
    });
  }
}, [session]);

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
            background: "var(--accent)",
            boxShadow: "0 0 8px 2px rgba(174,187,208,0.5)",
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

      {/* Right side */}
      <div className="flex items-center gap-4">
        {session ? (
          <>
            <div className="flex items-center gap-2">
              <span
                className="w-[5px] h-[5px] rounded-full"
                style={{ background: "#4ade80", boxShadow: "0 0 5px rgba(74,222,128,0.6)" }}
              />
              <Link
  href="/profile"
  className="font-mono text-[10px] tracking-widest transition-colors"
  style={{ color: "var(--muted)" }}
  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--lumen)")}
  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
>
  {username ?? session.user.email?.split('@')[0].toUpperCase()}
</Link>
            </div>
            <button
              onClick={async () => { await signOut(); router.refresh(); }}
              className="font-mono text-[10px] tracking-widest px-3 py-[4px] rounded transition-all"
              style={{
                color: "var(--muted)",
                border: "1px solid var(--hair2)",
                background: "transparent",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--lumen)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
            >
              Sign out
            </button>
          </>
        ) : (
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
        )}
      </div>
    </nav>
  );
}