"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthContext";

type Mode = "suggest" | "correct";

type Props = {
  mode: Mode;
  instructorId?: string;
  instructorName?: string;
  onClose: () => void;
};

const ISSUE_TYPES = [
  { value: "wrong_department",  label: "Wrong department" },
  { value: "wrong_courses",     label: "Wrong courses listed" },
  { value: "no_longer_teaches", label: "No longer teaches at QU" },
  { value: "name_spelling",     label: "Name spelling is wrong" },
  { value: "other",             label: "Something else" },
];

export default function SuggestModal({ mode, instructorId, instructorName, onClose }: Props) {
  const { session } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Suggest form state
  const [suggestName, setSuggestName]       = useState("");
  const [suggestDept, setSuggestDept]       = useState("");
  const [suggestCollege, setSuggestCollege] = useState("");
  const [suggestNotes, setSuggestNotes]     = useState("");

  // Correct form state
  const [issueType, setIssueType]           = useState("");
  const [correctDetails, setCorrectDetails] = useState("");

  // Prevent body background scroll on mobile when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  async function handleSuggest() {
    setError(null);
    if (!suggestName.trim() || !suggestDept.trim() || !suggestCollege.trim()) {
      setError("Please fill in name, department, and college.");
      return;
    }
    setSubmitting(true);
    try {
      const { error: dbError } = await supabase.from("professor_suggestions").insert({
        suggested_by: session?.user?.id ?? null,
        full_name: suggestName.trim(),
        department: suggestDept.trim(),
        college: suggestCollege.trim(),
        notes: suggestNotes.trim() || null,
      });
      if (dbError) throw dbError;
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCorrect() {
    setError(null);
    if (!issueType) {
      setError("Please select an issue type.");
      return;
    }
    setSubmitting(true);
    try {
      const { error: dbError } = await supabase.from("instructor_corrections").insert({
        instructor_id: instructorId ?? null,
        reported_by: session?.user?.id ?? null,
        issue_type: issueType,
        details: correctDetails.trim() || null,
      });
      if (dbError) throw dbError;
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0"
          style={{ background: "rgba(8,9,11,0.88)", backdropFilter: "blur(6px)" }}
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          key="modal"
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.97 }}
          transition={{ duration: 0.2, ease: [0.15, 0.83, 0.66, 1] }}
          className="relative z-10 w-full max-w-[480px] my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="rounded-xl overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[90vh]"
            style={{
              background: "var(--graph)",
              border: "1px solid var(--hair2)",
              boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
            }}
          >
            {/* Title bar - Sticky header */}
            <div
              className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 shrink-0"
              style={{ borderBottom: "1px solid var(--hair)", background: "var(--panel)" }}
            >
              <div className="flex gap-[5px] shrink-0">
                {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
                  <span key={c} className="w-[9px] h-[9px] rounded-full" style={{ background: c }} />
                ))}
              </div>
              
              <span className="font-mono text-[10px] sm:text-[11px] tracking-widest truncate mx-2 text-center" style={{ color: "var(--muted)" }}>
                {mode === "suggest" 
                  ? "SUGGEST A PROFESSOR" 
                  : `REPORT AN ISSUE · ${(instructorName || "INSTRUCTOR").toUpperCase()}`}
              </span>

              <button 
                onClick={onClose} 
                aria-label="Close modal"
                className="p-1 rounded transition-colors hover:opacity-80"
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--muted)" }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="px-4 sm:px-6 py-5 sm:py-6 overflow-y-auto flex-1">
              {submitted ? (
                <div className="text-center py-6">
                  <div
                    className="w-[1px] h-10 mx-auto mb-6"
                    style={{ background: "linear-gradient(to bottom, transparent, var(--lumen-bright))" }}
                  />
                  <p className="font-bold text-[18px] mb-2" style={{ color: "var(--lumen-bright)" }}>
                    Signal received.
                  </p>
                  <p className="text-[13px] leading-relaxed" style={{ color: "var(--fore)" }}>
                    {mode === "suggest"
                      ? "We'll review your suggestion and add them if confirmed."
                      : "We'll look into this and update the info if needed."}
                  </p>
                  <button
                    onClick={onClose}
                    className="font-mono text-[11px] tracking-widest mt-6 px-6 py-2.5 rounded-lg active:scale-95 transition-transform"
                    style={{
                      background: "var(--lumen-bright)", color: "var(--void)",
                      border: "none", cursor: "pointer", fontFamily: "inherit",
                    }}
                  >
                    CLOSE ↗
                  </button>
                </div>
              ) : mode === "suggest" ? (
                <div className="flex flex-col gap-4">
                  <p className="text-[13px]" style={{ color: "var(--fore)" }}>
                    Can't find a professor? Let us know and we'll add them.
                  </p>

                  <div className="flex flex-col gap-1.5">
                    <FieldLabel>Professor name <Req /></FieldLabel>
                    <input
                      type="text" placeholder="e.g. Dr. Ahmed Al-Rashid"
                      value={suggestName} onChange={(e) => setSuggestName(e.target.value)}
                      style={inputStyle}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <FieldLabel>Department <Req /></FieldLabel>
                    <input
                      type="text" placeholder="e.g. Computer Science"
                      value={suggestDept} onChange={(e) => setSuggestDept(e.target.value)}
                      style={inputStyle}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <FieldLabel>College <Req /></FieldLabel>
                    <input
                      type="text" placeholder="e.g. Engineering"
                      value={suggestCollege} onChange={(e) => setSuggestCollege(e.target.value)}
                      style={inputStyle}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <FieldLabel>
                      Anything else? <span style={{ color: "var(--muted)", fontWeight: 400 }}>— optional</span>
                    </FieldLabel>
                    <textarea
                      placeholder="Courses they teach, title, etc."
                      value={suggestNotes} onChange={(e) => setSuggestNotes(e.target.value)}
                      rows={2} style={{ ...inputStyle, resize: "none" }}
                    />
                  </div>

                  {error && <p className="font-mono text-[11px] mt-1" style={{ color: "#ff5f57" }}>{error}</p>}

                  <button
                    onClick={handleSuggest} disabled={submitting}
                    className="w-full rounded-lg py-3 mt-2 text-[13px] font-semibold transition-opacity active:scale-[0.99]"
                    style={{
                      background: "var(--lumen-bright)", color: "var(--void)",
                      border: "none", cursor: submitting ? "not-allowed" : "pointer",
                      opacity: submitting ? 0.6 : 1, fontFamily: "inherit",
                    }}
                  >
                    {submitting ? "Submitting..." : "Submit suggestion →"}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <p className="text-[13px]" style={{ color: "var(--fore)" }}>
                    Something wrong with this instructor's info? Tell us what needs fixing.
                  </p>

                  <div className="flex flex-col gap-2">
                    <FieldLabel>What's the issue? <Req /></FieldLabel>
                    <div className="flex flex-wrap gap-2">
                      {ISSUE_TYPES.map((it) => (
                        <button
                          key={it.value}
                          type="button"
                          onClick={() => setIssueType(it.value)}
                          className="font-mono text-[10px] px-2.5 py-1.5 rounded transition-all"
                          style={{
                            border: `1px solid ${issueType === it.value ? "var(--lumen-bright)" : "var(--hair2)"}`,
                            background: issueType === it.value ? "rgba(232,237,245,0.1)" : "transparent",
                            color: issueType === it.value ? "var(--lumen-bright)" : "var(--muted)",
                            cursor: "pointer", fontFamily: "inherit",
                          }}
                        >
                          {it.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <FieldLabel>
                      Details <span style={{ color: "var(--muted)", fontWeight: 400 }}>— optional but helpful</span>
                    </FieldLabel>
                    <textarea
                      placeholder="Tell us what's wrong and what it should be…"
                      value={correctDetails} onChange={(e) => setCorrectDetails(e.target.value)}
                      rows={3} style={{ ...inputStyle, resize: "none" }}
                    />
                  </div>

                  {error && <p className="font-mono text-[11px] mt-1" style={{ color: "#ff5f57" }}>{error}</p>}

                  <button
                    onClick={handleCorrect} disabled={submitting}
                    className="w-full rounded-lg py-3 mt-2 text-[13px] font-semibold transition-opacity active:scale-[0.99]"
                    style={{
                      background: "var(--lumen-bright)", color: "var(--void)",
                      border: "none", cursor: submitting ? "not-allowed" : "pointer",
                      opacity: submitting ? 0.6 : 1, fontFamily: "inherit",
                    }}
                  >
                    {submitting ? "Submitting..." : "Report issue →"}
                  </button>
                </div>
              )}
            </div>
            <div className="horizon-line" />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="font-mono text-[10px] uppercase tracking-widest block" style={{ color: "var(--muted)" }}>
      {children}
    </label>
  );
}

function Req() {
  return <span style={{ color: "var(--muted)", fontWeight: 400 }}> — required</span>;
}

const inputStyle: React.CSSProperties = {
  background: "var(--void)",
  border: "1px solid var(--hair2)",
  color: "var(--lumen-bright)",
  borderRadius: "8px",
  padding: "9px 12px",
  fontSize: "13px",
  fontFamily: "inherit",
  outline: "none",
  width: "100%",
};