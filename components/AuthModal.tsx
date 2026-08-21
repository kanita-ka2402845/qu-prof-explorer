"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { sendOTP, verifyOTP } from "@/lib/auth";

type Props = {
  onClose: () => void;
  onSuccess: () => void;
};

type Step = "email" | "otp";

export default function AuthModal({ onClose, onSuccess }: Props) {
  const [step, setStep]       = useState<Step>("email");
  const [email, setEmail]     = useState("");
  const [otp, setOtp]         = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  // Prevent background scrolling on mobile when modal is active
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  async function handleEmailSubmit() {
    setError(null);
    setLoading(true);
    const { error } = await sendOTP(email.trim().toLowerCase());
    setLoading(false);
    if (error) { setError(error); return; }
    setStep("otp");
  }

  async function handleOTPSubmit() {
    setError(null);
    setLoading(true);
    const { error } = await verifyOTP(email.trim().toLowerCase(), otp.trim());
    setLoading(false);
    if (error) { setError(error); return; }
    onSuccess();
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
          style={{ background: "rgba(8,9,11,0.85)", backdropFilter: "blur(4px)" }}
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          key="modal"
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.97 }}
          transition={{ duration: 0.2, ease: [0.15, 0.83, 0.66, 1] }}
          className="relative z-10 w-full max-w-[440px] my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="rounded-xl overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[90vh]"
            style={{
              background: "var(--graph)",
              border: "1px solid var(--hair2)",
              boxShadow: "var(--rim-inset), var(--shadow-floating)",
            }}
          >
            {/* Title bar Header */}
            <div
              className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 shrink-0"
              style={{ borderBottom: "1px solid var(--hair)", background: "var(--panel)" }}
            >
              <div className="flex gap-[5px] shrink-0">
                {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
                  <span key={c} className="w-[9px] h-[9px] rounded-full" style={{ background: c }} />
                ))}
              </div>

              <span
                className="font-mono text-[10px] sm:text-[11px] tracking-widest truncate mx-2 text-center"
                style={{ color: "var(--muted)" }}
              >
                {step === "email" ? "SIGN IN · QU PORTAL" : "VERIFY · CHECK YOUR EMAIL"}
              </span>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="p-1 rounded transition-colors hover:opacity-80"
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--muted)" }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable Modal Body */}
            <div className="px-4 sm:px-6 py-6 sm:py-8 overflow-y-auto flex-1">
              <AnimatePresence mode="wait">
                {step === "email" ? (
                  <motion.div
                    key="email-step"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h2
                      className="font-bold tracking-[-0.02em] mb-2"
                      style={{ fontSize: "20px", color: "var(--lumen-bright)" }}
                    >
                      Sign in to review
                    </h2>
                    <p
                      className="text-[13px] leading-relaxed mb-6"
                      style={{ color: "var(--fore)" }}
                    >
                      Enter your QU email. We'll send you a verification code —
                      no password needed.
                    </p>

                    <label
                      className="font-mono text-[10px] uppercase tracking-widest block mb-2"
                      style={{ color: "var(--muted)" }}
                    >
                      QU Email
                    </label>
                    <input
                      type="email"
                      placeholder="yourname@qu.edu.qa"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleEmailSubmit()}
                      className="w-full rounded-lg px-4 py-3 text-[13px] outline-none mb-5"
                      style={{
                        background: "var(--void)",
                        border: "1px solid var(--hair2)",
                        color: "var(--lumen-bright)",
                        fontFamily: "inherit",
                      }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.28)")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "var(--hair2)")}
                    />

                    {error && (
                      <p className="font-mono text-[11px] mb-4" style={{ color: "#ff5f57" }}>
                        {error}
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={handleEmailSubmit}
                      disabled={loading || !email.includes("@")}
                      className="w-full rounded-lg py-3 text-[13px] font-semibold transition-opacity active:scale-[0.99]"
                      style={{
                        background: "var(--lumen-bright)",
                        color: "var(--void)",
                        border: "none",
                        boxShadow: "var(--rim-inset)",
                        cursor: loading || !email.includes("@") ? "not-allowed" : "pointer",
                        opacity: loading || !email.includes("@") ? 0.5 : 1,
                        fontFamily: "inherit",
                      }}
                    >
                      {loading ? "Sending..." : "Send verification code →"}
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="otp-step"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h2
                      className="font-bold tracking-[-0.02em] mb-2"
                      style={{ fontSize: "20px", color: "var(--lumen-bright)" }}
                    >
                      Check your email
                    </h2>
                    <p
                      className="text-[13px] leading-relaxed mb-2"
                      style={{ color: "var(--fore)" }}
                    >
                      We sent an 8-digit code to{" "}
                      <strong style={{ color: "var(--lumen)" }}>{email}</strong>
                    </p>
                    <button
                      type="button"
                      onClick={() => { setStep("email"); setOtp(""); setError(null); }}
                      className="font-mono text-[10px] tracking-widest mb-6 block hover:opacity-80 transition-opacity"
                      style={{ color: "var(--muted)", background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit" }}
                    >
                      ← Use a different email
                    </button>

                    <label
                      className="font-mono text-[10px] uppercase tracking-widest block mb-2"
                      style={{ color: "var(--muted)" }}
                    >
                      Verification code
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="00000000"
                      maxLength={8}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      onKeyDown={(e) => e.key === "Enter" && handleOTPSubmit()}
                      className="w-full rounded-lg px-4 py-3 text-[18px] sm:text-[20px] font-mono outline-none mb-5 text-center tracking-[0.25em] sm:tracking-[0.3em]"
                      style={{
                        background: "var(--void)",
                        border: "1px solid var(--hair2)",
                        color: "var(--lumen-bright)",
                        fontFamily: "'Space Mono', monospace",
                      }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.28)")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "var(--hair2)")}
                    />

                    {error && (
                      <p className="font-mono text-[11px] mb-4" style={{ color: "#ff5f57" }}>
                        {error}
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={handleOTPSubmit}
                      disabled={loading || otp.length < 8}
                      className="w-full rounded-lg py-3 text-[13px] font-semibold transition-opacity active:scale-[0.99]"
                      style={{
                        background: "var(--lumen-bright)",
                        color: "var(--void)",
                        border: "none",
                        boxShadow: "var(--rim-inset)",
                        cursor: loading || otp.length < 8 ? "not-allowed" : "pointer",
                        opacity: loading || otp.length < 8 ? 0.5 : 1,
                        fontFamily: "inherit",
                      }}
                    >
                      {loading ? "Verifying..." : "Verify & sign in →"}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom horizon divider */}
            <div className="horizon-line shrink-0" />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}