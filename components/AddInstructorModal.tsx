"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import leoProfanity from "leo-profanity";
import { useAuth } from "@/components/AuthContext";
import { addInstructor } from "@/lib/queries";

type Props = {
  departmentId: string;
  departmentName: string;
  onClose: () => void;
  onDone: (slug: string) => void;
};


export default function AddInstructorModal({ departmentId, departmentName, onClose, onDone }: Props) {
  const { session } = useAuth();
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingSlug, setExistingSlug] = useState<string | null>(null);

  async function handleSubmit() {
    const clean = name.trim().replace(/\s+/g, " ").replace(/^(dr|prof|eng|mr|ms|mrs)\.?\s+/i, "");
    if (!session) return;
    if (!/^[A-Za-z'’.\- ]+$/.test(clean) || clean.split(" ").length < 2) {
      setError("Enter first and last name using letters only.");
      return;
    }
    if (leoProfanity.check(clean)) { setError("Please enter a valid name."); return; }
    setError(null);
    setSubmitting(true);
    const res = await addInstructor({ departmentId, name: clean, userId: session.user.id });
    setSubmitting(false);
    if (res.error) { setError(res.error); return; }
    if (res.existing) { setExistingSlug(res.slug); return; }
    if (res.slug) onDone(res.slug);
  }

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-40"
        style={{ background: "rgba(8,9,11,0.88)", backdropFilter: "blur(6px)" }}
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 overflow-y-auto px-3 py-4 sm:p-6 flex justify-center items-start sm:items-center pointer-events-none">
        <motion.div
          key="modal"
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 15 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="pointer-events-auto w-full max-w-[460px] my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="rounded-xl overflow-hidden"
            style={{ background: "var(--graph)", border: "1px solid var(--hair2)", boxShadow: "0 32px 80px rgba(0,0,0,0.6)" }}>
            <div className="flex items-center gap-3 px-5 py-4"
              style={{ borderBottom: "1px solid var(--hair)", background: "var(--panel)" }}>
              <div className="flex gap-[5px]">
                {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
                  <span key={c} className="w-[9px] h-[9px] rounded-full" style={{ background: c }} />
                ))}
              </div>
              <span className="font-mono text-[11px] tracking-widest mx-auto truncate" style={{ color: "var(--muted)" }}>
                ADD A PROFESSOR
              </span>
              <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--muted)" }}>
                <X size={14} />
              </button>
            </div>

            <div className="px-6 py-8 flex flex-col gap-5">
              {existingSlug ? (
                <>
                  <p className="text-[13px]" style={{ color: "var(--fore)" }}>
                    This professor is already on the site.
                  </p>
                  <button
                    onClick={() => onDone(existingSlug)}
                    className="w-full rounded-lg py-3 text-[13px] font-semibold"
                    style={{ background: "var(--lumen-bright)", color: "var(--void)", border: "none", cursor: "pointer", fontFamily: "inherit" }}
                  >
                    Open their page →
                  </button>
                </>
              ) : (
                <>
                  <p className="text-[13px]" style={{ color: "var(--fore)" }}>
                    Adding to <strong style={{ color: "var(--lumen)" }}>{departmentName}</strong>. Search the list first to make sure they aren't already there.
                  </p>

                  

                  <div className="flex flex-col gap-2">
                    <label className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--muted)" }}>
                      First and last name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Layla Farouk"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                      maxLength={40}
                      className="rounded-lg px-4 py-3 text-[16px] sm:text-[13px] outline-none"
                      style={{ background: "var(--void)", border: "1px solid var(--hair2)", color: "var(--lumen-bright)", fontFamily: "inherit" }}
                    />
                  </div>

                  {error && <p className="font-mono text-[11px]" style={{ color: "#ff5f57" }}>{error}</p>}

                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="w-full rounded-lg py-3 text-[13px] font-semibold"
                    style={{
                      background: "var(--lumen-bright)", color: "var(--void)", border: "none",
                      cursor: submitting ? "not-allowed" : "pointer",
                      opacity: submitting ? 0.6 : 1, fontFamily: "inherit",
                    }}
                  >
                    {submitting ? "Adding…" : "Add and continue →"}
                  </button>
                </>
              )}
            </div>
            <div className="horizon-line" />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}