"use client";
import { useState } from "react";
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
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 flex items-center justify-center"
        style={{ background: "rgba(8,9,11,0.85)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        key="modal"
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ duration: 0.25, ease: [0.15, 0.83, 0.66, 1] }}
        className="fixed z-50 w-full max-w-md mx-auto"
        style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
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
          {/* Title bar */}
          <div
            className="flex items-center gap-3 px-5 py-4"
            style={{ borderBottom: "1px solid var(--hair)", background: "var(--panel)" }}
          >
            <div className="flex gap-[5px]">
              {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
                <span key={c} className="w-[9px] h-[9px] rounded-full" style={{ background: c }} />
              ))}
            </div>
            <span
              className="font-mono text-[11px] tracking-widest mx-auto"
              style={{ color: "var(--muted)" }}
            >
              {step === "email" ? "SIGN IN · QU PORTAL" : "VERIFY · CHECK YOUR EMAIL"}
            </span>
            <button
              onClick={onClose}
              style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--muted)" }}
            >
              <X size={14} />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-8">
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
                    style={{ fontSize: "22px", color: "var(--lumen-bright)" }}
                  >
                    Sign in to review
                  </h2>
                  <p
                    className="text-[13px] leading-relaxed mb-8"
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
                    className="w-full rounded-lg px-4 py-3 text-[13px] outline-none mb-6"
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
                    onClick={handleEmailSubmit}
                    disabled={loading || !email.includes("@")}
                    className="w-full rounded-lg py-3 text-[13px] font-semibold transition-opacity"
                    style={{
                      background: "var(--lumen-bright)",
                      color: "var(--void)",
                      border: "none",
                      cursor: loading ? "not-allowed" : "pointer",
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
                    style={{ fontSize: "22px", color: "var(--lumen-bright)" }}
                  >
                    Check your email
                  </h2>
                  <p
                    className="text-[13px] leading-relaxed mb-2"
                    style={{ color: "var(--fore)" }}
                  >
                    We sent a 6-digit code to{" "}
                    <strong style={{ color: "var(--lumen)" }}>{email}</strong>
                  </p>
                  <button
                    onClick={() => { setStep("email"); setOtp(""); setError(null); }}
                    className="font-mono text-[10px] tracking-widest mb-8 block"
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
                    placeholder="000000"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    onKeyDown={(e) => e.key === "Enter" && handleOTPSubmit()}
                    className="w-full rounded-lg px-4 py-3 text-[20px] font-mono outline-none mb-6 text-center tracking-[0.3em]"
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
                    onClick={handleOTPSubmit}
                    disabled={loading || otp.length < 6}
                    className="w-full rounded-lg py-3 text-[13px] font-semibold transition-opacity"
                    style={{
                      background: "var(--lumen-bright)",
                      color: "var(--void)",
                      border: "none",
                      cursor: loading ? "not-allowed" : "pointer",
                      opacity: loading || otp.length < 6 ? 0.5 : 1,
                      fontFamily: "inherit",
                    }}
                  >
                    {loading ? "Verifying..." : "Verify & sign in →"}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom horizon */}
          <div className="horizon-line" />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}