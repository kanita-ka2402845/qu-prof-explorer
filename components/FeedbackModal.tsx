"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Props = { onClose: () => void };

export default function FeedbackModal({ onClose }: Props) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!message.trim() || message.trim().length < 10) {
      setError("Please write at least a few words.");
      return;
    }
    setError(null);
    setSubmitting(true);
    const { error } = await supabase.from("website_feedback").insert({
      qu_email: email.trim() || null,
      message: message.trim(),
    });
    setSubmitting(false);
    if (error) { setError("Something went wrong — try again."); return; }
    setSubmitted(true);
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
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="pointer-events-auto w-full max-w-[460px] my-auto"
                onClick={(e) => e.stopPropagation()}
            >
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: "var(--graph)",
            border: "1px solid var(--hair2)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
          }}
        >
          <div
            className="flex items-center gap-3 px-5 py-4"
            style={{ borderBottom: "1px solid var(--hair)", background: "var(--panel)" }}
          >
            <div className="flex gap-[5px]">
              {["#ff5f57","#febc2e","#28c840"].map((c) => (
                <span key={c} className="w-[9px] h-[9px] rounded-full" style={{ background: c }} />
              ))}
            </div>
            <span className="font-mono text-[11px] tracking-widest mx-auto" style={{ color: "var(--muted)" }}>
              SUGGEST AN IMPROVEMENT
            </span>
            <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--muted)" }}>
              <X size={14} />
            </button>
          </div>

          <div className="px-6 py-8">
            {submitted ? (
              <div className="text-center py-6">
                <div
                  className="w-[1px] h-10 mx-auto mb-6"
                  style={{ background: "linear-gradient(to bottom, transparent, var(--lumen-bright))" }}
                />
                <p className="font-bold text-[18px] mb-2" style={{ color: "var(--lumen-bright)" }}>
                  Signal received.
                </p>
                <p className="text-[13px]" style={{ color: "var(--fore)" }}>
                  Thanks for taking the time — every suggestion helps shape this platform.
                </p>
                <button
                  onClick={onClose}
                  className="font-mono text-[11px] tracking-widest mt-6 px-5 py-2 rounded-lg"
                  style={{
                    background: "var(--lumen-bright)", color: "var(--void)",
                    border: "none", cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                  CLOSE ↗
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                <p className="text-[13px]" style={{ color: "var(--fore)" }}>
                  Have an idea to make this better? We're listening.
                </p>

                <div className="flex flex-col gap-2">
                  <label className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--muted)" }}>
                    QU Email <span style={{ fontWeight: 400 }}>— optional, in case we want to follow up</span>
                  </label>
                  <input
                    type="email"
                    placeholder="yourname@qu.edu.qa"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-lg px-4 py-3 text-[16px] sm:text-[13px] outline-none"
                    style={{
                      background: "var(--void)", border: "1px solid var(--hair2)",
                      color: "var(--lumen-bright)", fontFamily: "inherit",
                    }}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--muted)" }}>
                    Your suggestion <span style={{ fontWeight: 400 }}>— required</span>
                  </label>
                  <textarea
                    placeholder="What would make this website more useful for you?"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    maxLength={1000}
                    className="rounded-lg px-4 py-3 text-[16px] sm:text-[13px] outline-none resize-none leading-relaxed"
                    style={{
                      background: "var(--void)", border: "1px solid var(--hair2)",
                      color: "var(--lumen-bright)", fontFamily: "inherit",
                    }}
                  />
                </div>

                {error && <p className="font-mono text-[11px]" style={{ color: "#ff5f57" }}>{error}</p>}

                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full rounded-lg py-3 text-[13px] font-semibold"
                  style={{
                    background: "var(--lumen-bright)", color: "var(--void)",
                    border: "none", cursor: submitting ? "not-allowed" : "pointer",
                    opacity: submitting ? 0.6 : 1, fontFamily: "inherit",
                  }}
                >
                  {submitting ? "Submitting..." : "Send suggestion →"}
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