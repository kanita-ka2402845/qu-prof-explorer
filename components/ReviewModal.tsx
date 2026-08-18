"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/AuthContext";
import type { FullInstructor } from "@/app/professors/[slug]/page";
import { X} from "lucide-react";

import leoProfanity from "leo-profanity";

import { getUserReviewCount, getTags, createCustomTag, submitReview, addCourseToInstructor } from "@/lib/queries";

type Props = {
  instructor: FullInstructor;
  onClose: () => void;
  onSuccess: () => void;
};

type Step = "form" | "conscience" | "success";

// ── Islamic references per attempt ──────────────────────────
const CONSCIENCE_LEVELS = [
  {
    verse: "\"And do not spy or backbite each other. Would one of you like to eat the flesh of his dead brother? You would detest it.\"",
    source: "Surah Al-Hujurat 49:12",
    checkbox: "I am reviewing how this instructor teaches — not who they are as a person."
  },
  {
    verse: "\"Man does not utter any word except that with him is an observer prepared to record.\"",
    source: "Surah Qaf 50:18",
    checkbox: "This reflects my genuine experience — not frustration from one bad exam."
  },
  {
    verse: "\"Every movement of the tongue is either a step toward Paradise or a step toward the Fire. Guard it as you guard your life.\"",
    source: "Ibn Qayyim",
    checkbox: "I would stand behind these words if asked to explain them."
  },
  {
    verse: "\"O you who have believed, fear Allah and speak words of appropriate justice.\"",
    source: "Surah Al-Ahzab 33:70"
  },
  {
    verse: "\"The tongue has no bones, but it is strong enough to break a heart. So be careful with your words.\"",
    source: null
  },
];

const TEACHING_STYLES = [
  { value: "reads_slides",           label: "Reads from slides" },
  { value: "explains_beyond_slides", label: "Explains beyond slides" },
  { value: "discussion_based",       label: "Discussion-based" },
  { value: "heavy_examples",         label: "Heavy on examples" },
  { value: "mixed",                  label: "Mixed / varies" },
];

const SEMESTERS = ["Fall", "Spring", "Summer"];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 4 }, (_, i) => CURRENT_YEAR - i);

const GRADE_OPTIONS = [
  { value: "flying_colours", label: "Passed with flying colours" },
  { value: "pass_alright",   label: "Passed alright" },
  { value: "barely_pass",    label: "Barely passed" },
  { value: "retook",         label: "Retook the course" },
];

export default function ReviewModal({ instructor, onClose, onSuccess }: Props) {
  const { session } = useAuth();
 const [step, setStep] = useState<Step>("form");
  const [conscienceLevel, setConscienceLevel] = useState(1);
  const [checked, setChecked] = useState(false);
  const [showBackbiting, setShowBackbiting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [courseId, setCourseId]             = useState(instructor.courses[0]?.id ?? "");
  const [semester, setSemester]             = useState("Fall");
  const [year, setYear]                     = useState(CURRENT_YEAR);
  const [clarity, setClarity]               = useState(3);
  const [examDiff, setExamDiff]             = useState(3);
  const [teachingStyle, setTeachingStyle]   = useState("");
  const [wouldRetake, setWouldRetake]       = useState<boolean | null>(null);
  const [strictAtt, setStrictAtt]           = useState<boolean | null>(null);
  const [affectsGrade, setAffectsGrade]     = useState<boolean | null>(null);
  const [body, setBody]                     = useState("");
  const [gradeReceived, setGradeReceived]   = useState("");
  const [profanityWarning, setProfanityWarning] = useState(false);
  const [availableTags, setAvailableTags]   = useState<{ id: string; label: string }[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState("");

  const [showAddCourse, setShowAddCourse] = useState(false);
const [newCourseCode, setNewCourseCode] = useState("");
const [addingCourse, setAddingCourse]   = useState(false);

  useEffect(() => {
    async function init() {
      if (!session) return;
      const [count, tags] = await Promise.all([
        getUserReviewCount(session.user.id),
        getTags(),
      ]);
      const level = Math.min(count + 1, 5);
      setConscienceLevel(level);
      setAvailableTags(tags);
      setLoading(false);
    }
    init();
  }, [session]);

  const handleBodyBlur = useCallback(() => {
    if (body.trim()) {
      setProfanityWarning(leoProfanity.check(body));
    }
  }, [body]);

  function toggleTag(id: string) {
    setSelectedTagIds((prev) =>
      prev.includes(id)
        ? prev.filter((t) => t !== id)
        : prev.length < 4 ? [...prev, id] : prev
    );
  }

  async function handleAddCustomTag() {
    const label = customTagInput.trim();
    if (!label || label.length < 2) return;
    const existing = availableTags.find(
      (t) => t.label.toLowerCase() === label.toLowerCase()
    );
    if (existing) { toggleTag(existing.id); setCustomTagInput(""); return; }
    const tag = await createCustomTag(label);
    if (tag) {
      setAvailableTags((prev) => [...prev, tag]);
      toggleTag(tag.id);
    }
    setCustomTagInput("");
  }

  async function handleSubmit() {
    if (!session) return;
    if (!courseId || !teachingStyle || wouldRetake === null ||
        strictAtt === null || affectsGrade === null || body.trim().length < 30) {
      setError("Please complete all required fields.");
      return;
    }
    setError(null);
    setSubmitting(true);
    const { error } = await submitReview({
      instructor_id: instructor.id,
      course_id: courseId,
      author_id: session.user.id,
      body: body.trim(),
      clarity,
      exam_difficulty: examDiff,
      would_retake: wouldRetake,
      attendance_strict: strictAtt,
      attendance_affects_grade: affectsGrade,
      teaching_style: teachingStyle,
      grade_received: gradeReceived || null,
      semester,
      semester_year: year,
      conscience_level: conscienceLevel,
      tag_ids: selectedTagIds,
    });
    setSubmitting(false);
    if (error) { setError(error); return; }
    setStep("success");
  }

  async function handleAddCourse() {
  if (!newCourseCode.trim()) return;
  setAddingCourse(true);
  const course = await addCourseToInstructor(instructor.id, newCourseCode);
  setAddingCourse(false);
  if (course) {
    // Add to local instructor courses list
    instructor.courses.push(course);
    setCourseId(course.id);
    setShowAddCourse(false);
    setNewCourseCode("");
  }
}

  const ref = CONSCIENCE_LEVELS[conscienceLevel - 1];
  const isHighLevel = conscienceLevel <= 3;
  const canProceed = conscienceLevel <= 3 ? checked : true;

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40"
        style={{ background: "rgba(8,9,11,0.88)", backdropFilter: "blur(6px)" }}
        onClick={onClose}
      />

      {/* Modal */}
  <motion.div
  key="modal"
  initial={{ opacity: 0, y: 20, scale: 0.97 }}
  animate={{ opacity: 1, y: 0, scale: 1 }}
  exit={{ opacity: 0, y: 20, scale: 0.97 }}
  transition={{ duration: 0.28, ease: [0.15, 0.83, 0.66, 1] }}
  className="fixed z-50"
  style={{
    width: "min(560px, calc(100vw - 24px))",
    top: "4vh",
    left: "50%",
    transform: "translateX(-50%)",
    maxHeight: "92vh",
    display: "flex",
    flexDirection: "column",
  }}
  onClick={(e) => e.stopPropagation()}
>
         <div
    className="rounded-xl flex flex-col"
    style={{
      background: "var(--graph)",
      border: "1px solid var(--hair2)",
      boxShadow: "var(--rim-inset), var(--shadow-floating)",
      maxHeight: "92vh",
      overflow: "clip",
    }}
  >
          {/* Title bar */}
          <div
      className="flex items-center gap-3 px-5 py-4 flex-shrink-0"
      style={{ borderBottom: "1px solid var(--hair)", background: "var(--panel)" }}
    >
            <div className="flex gap-[5px]">
              {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
                <span key={c} className="w-[9px] h-[9px] rounded-full" style={{ background: c }} />
              ))}
            </div>
            <span className="font-mono text-[11px] tracking-widest mx-auto" style={{ color: "var(--muted)" }}>
              {step === "conscience" ? "BEFORE YOU WRITE" :
               step === "form" ? `REVIEW · ${instructor.full_name.toUpperCase()}` :
               "SIGNAL RECEIVED"}
            </span>
            <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--muted)" }}>
              <X size={14} />
            </button>
          </div>
          <div style={{ overflowY: "auto", flex: 1 }}>
          {loading ? (
            <div className="px-6 py-12 text-center">
              <p className="font-mono text-[11px] tracking-widest" style={{ color: "var(--muted)" }}>LOADING...</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">

              {/* ── STEP 1: CONSCIENCE ── */}
              {step === "conscience" && (
                <motion.div
                  key="conscience"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-6 py-8"
                >
                  {/* Verse */}
                  <div
                    className="rounded-lg px-5 py-5 mb-6"
                    style={{ background: "var(--void)", border: "1px solid var(--hair)" }}
                  >
                    <p
                      className="text-[13px] leading-[1.8] italic mb-3"
                      style={{ color: "var(--lumen)" }}
                    >
                      {ref.verse}
                    </p>
                    {ref.source && (
                      <p className="font-mono text-[10px] tracking-widest" style={{ color: "var(--muted)" }}>
                        — {ref.source}
                      </p>
                    )}

                    {/* Backbiting reveal — level 1 only */}
                    {conscienceLevel === 1 && (
                      <div className="mt-4">
                        <button
                          onClick={() => setShowBackbiting(!showBackbiting)}
                          className="font-mono text-[10px] tracking-widest"
                          style={{ color: "var(--fore)", background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit" }}
                        >
                          {showBackbiting ? "▾" : "▸"} What is backbiting?
                        </button>
                        {showBackbiting && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="text-[12px] leading-[1.7] mt-3"
                            style={{ color: "var(--fore)" }}
                          >
                            The Prophet ﷺ asked, "Do you know what backbiting is?" They said, "Allah and His Messenger know best." He said, "Mentioning your brother with something he dislikes." — Sahih Muslim
                          </motion.p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Self-reminder */}
                  <p className="text-[12px] mb-6 leading-relaxed" style={{ color: "var(--muted)" }}>
                    This reminder is for me before it is for you.
                  </p>

                  {/* Checkbox (levels 1–3 only) */}
                  {isHighLevel && (
                    <label
                      className="flex items-start gap-3 cursor-pointer mb-6 group"
                      onClick={() => setChecked(!checked)}
                    >
                      <div
                        className="w-4 h-4 rounded mt-[2px] flex-shrink-0 flex items-center justify-center transition-all"
                        style={{
                          border: `1px solid ${checked ? "var(--lumen-bright)" : "var(--hair2)"}`,
                          background: checked ? "var(--lumen-bright)" : "transparent",
                        }}
                      >
                        {checked && (
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4L3.5 6.5L9 1" stroke="var(--void)" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        )}
                      </div>
                      <span className="text-[13px] leading-relaxed" style={{ color: "var(--fore)" }}>
                        {ref.checkbox}
                      </span>
                    </label>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={!canProceed}
                    className="w-full rounded-lg py-3 text-[13px] font-semibold transition-opacity"
                    style={{
                      background: "var(--lumen-bright)",
                      color: "var(--void)",
                      border: "none",
                      boxShadow: "var(--rim-inset)",
                      cursor: canProceed ? "pointer" : "not-allowed",
                      opacity: canProceed ? 1 : 0.4,
                      fontFamily: "inherit",
                    }}
                  >
                    Continue →
                  </button>
                </motion.div>
              )}

              {/* ── STEP 2: FORM ── */}
              {step === "form" && (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-6 py-8"
                >
          

                  <div className="flex flex-col gap-6">

                   {/* Course + Semester */}
<div className="flex flex-col gap-3">
  <FieldLabel>Course</FieldLabel>
  <select
    value={courseId}
    onChange={(e) => {
      if (e.target.value === "__add__") {
        setShowAddCourse(true);
      } else {
        setCourseId(e.target.value);
        setShowAddCourse(false);
      }
    }}
    style={selectStyle}
  >
    {instructor.courses.map((c) => (
      <option key={c.id} value={c.id}>{c.code}{c.name ? ` — ${c.name}` : ""}</option>
    ))}
    <option value="__add__">+ Add a course…</option>
  </select>

  {showAddCourse && (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-2"
    >
      <input
        type="text"
        placeholder="Course code e.g. CMPS 350"
        value={newCourseCode}
        onChange={(e) => setNewCourseCode(e.target.value.toUpperCase())}
        className="flex-1 rounded-lg px-3 py-2 text-[13px] outline-none"
        style={{
          background: "var(--void)",
          border: "1px solid var(--hair2)",
          color: "var(--lumen-bright)",
          fontFamily: "inherit",
        }}
      />
      <button
        onClick={handleAddCourse}
        disabled={addingCourse || newCourseCode.length < 4}
        className="font-mono text-[10px] px-3 py-2 rounded-lg"
        style={{
          background: "var(--lumen-bright)",
          color: "var(--void)",
          border: "none",
          cursor: "pointer",
          fontFamily: "inherit",
          opacity: addingCourse || newCourseCode.length < 4 ? 0.5 : 1,
        }}
      >
        {addingCourse ? "Adding…" : "Add"}
      </button>
    </motion.div>
  )}
</div>

<div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
  <div className="flex flex-col gap-2">
    <FieldLabel>Semester</FieldLabel>
    <select value={semester} onChange={(e) => setSemester(e.target.value)} style={selectStyle}>
      {SEMESTERS.map((s) => <option key={s}>{s}</option>)}
    </select>
  </div>
  <div className="flex flex-col gap-2">
    <FieldLabel>Year</FieldLabel>
    <select value={year} onChange={(e) => setYear(Number(e.target.value))} style={selectStyle}>
      {YEARS.map((y) => <option key={y}>{y}</option>)}
    </select>
  </div>
</div>

                    <Divider />

                    {/* Clarity slider */}
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-baseline">
                        <FieldLabel>Clarity</FieldLabel>
                        <span className="font-mono text-[11px]" style={{ color: "var(--lumen-bright)" }}>{clarity} / 5</span>
                      </div>
                      <input
                        type="range" min={1} max={5} step={1}
                        value={clarity}
                        onChange={(e) => setClarity(Number(e.target.value))}
                        className="w-full accent-white"
                        style={{ accentColor: "var(--lumen-bright)" }}
                      />
                      <div className="flex justify-between">
                        <span className="font-mono text-[10px]" style={{ color: "var(--muted)" }}>Hard to follow</span>
                        <span className="font-mono text-[10px]" style={{ color: "var(--muted)" }}>Crystal clear</span>
                      </div>
                    </div>

                    {/* Exam difficulty slider */}
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-baseline">
                        <FieldLabel>Exam Difficulty</FieldLabel>
                        <span className="font-mono text-[11px]" style={{ color: "var(--lumen-bright)" }}>{examDiff} / 5</span>
                      </div>
                      <input
                        type="range" min={1} max={5} step={1}
                        value={examDiff}
                        onChange={(e) => setExamDiff(Number(e.target.value))}
                        style={{ accentColor: "var(--lumen-bright)" }}
                        className="w-full"
                      />
                      <div className="flex justify-between">
                        <span className="font-mono text-[10px]" style={{ color: "var(--muted)" }}>Straightforward</span>
                        <span className="font-mono text-[10px]" style={{ color: "var(--muted)" }}>Brutal</span>
                      </div>
                      {examDiff === 3 && (
                        <p className="font-mono text-[10px] text-center" style={{ color: "var(--fore)" }}>
                          Similar to past papers
                        </p>
                      )}
                    </div>

                    <Divider />

                    {/* Teaching style */}
                    <div className="flex flex-col gap-3">
                      <FieldLabel>Teaching Style</FieldLabel>
                      <div className="flex flex-wrap gap-2">
                        {TEACHING_STYLES.map((ts) => (
                          <button
                            key={ts.value}
                            onClick={() => setTeachingStyle(ts.value)}
                            className="font-mono text-[10px] px-3 py-[6px] rounded transition-all"
                            style={{
                              border: `1px solid ${teachingStyle === ts.value ? "var(--lumen-bright)" : "var(--hair2)"}`,
                              background: teachingStyle === ts.value ? "rgba(232,237,245,0.1)" : "transparent",
                              color: teachingStyle === ts.value ? "var(--lumen-bright)" : "var(--muted)",
                              cursor: "pointer",
                              fontFamily: "inherit",
                            }}
                          >
                            {ts.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <Divider />

                    {/* Yes / No taps */}
                    <div className="flex flex-col gap-4">
                      <FieldLabel>Quick Questions</FieldLabel>
                      {[
                        { label: "Would you take this professor again?", state: wouldRetake, set: setWouldRetake },
                        { label: "Strict with attendance?",              state: strictAtt,   set: setStrictAtt },
                        { label: "Does attendance affect your grade?",   state: affectsGrade, set: setAffectsGrade },
                      ].map(({ label, state, set }) => (
                        <div key={label} className="flex items-center justify-between gap-4">
                          <span className="text-[12px]" style={{ color: "var(--fore)" }}>{label}</span>
                          <div className="flex gap-2 flex-shrink-0">
                            {[true, false].map((val) => (
                              <button
                                key={String(val)}
                                onClick={() => set(val)}
                                className="font-mono text-[10px] px-3 py-[5px] rounded transition-all"
                                style={{
                                  border: `1px solid ${state === val ? "var(--lumen-bright)" : "var(--hair2)"}`,
                                  background: state === val ? "rgba(232,237,245,0.1)" : "transparent",
                                  color: state === val ? "var(--lumen-bright)" : "var(--muted)",
                                  cursor: "pointer",
                                  fontFamily: "inherit",
                                }}
                              >
                                {val ? "Yes" : "No"}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <Divider />

                    {/* Tags */}
                    <div className="flex flex-col gap-3">
                      <div className="flex items-baseline justify-between">
                        <FieldLabel>Tags</FieldLabel>
                        <span className="font-mono text-[10px]" style={{ color: "var(--muted)" }}>
                          {selectedTagIds.length}/4 selected
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {availableTags.map((tag) => {
                          const sel = selectedTagIds.includes(tag.id);
                          return (
                            <button
                              key={tag.id}
                              onClick={() => toggleTag(tag.id)}
                              disabled={!sel && selectedTagIds.length >= 4}
                              className="font-mono text-[10px] px-3 py-[5px] rounded transition-all"
                              style={{
                                border: `1px solid ${sel ? "var(--lumen-bright)" : "var(--hair)"}`,
                                background: sel ? "rgba(232,237,245,0.08)" : "transparent",
                                color: sel ? "var(--lumen-bright)" : "var(--muted)",
                                cursor: (!sel && selectedTagIds.length >= 4) ? "not-allowed" : "pointer",
                                opacity: (!sel && selectedTagIds.length >= 4) ? 0.4 : 1,
                                fontFamily: "inherit",
                              }}
                            >
                              {tag.label}
                            </button>
                          );
                        })}
                      </div>
                      {/* Custom tag */}
                      {selectedTagIds.length < 4 && (
                        <div className="flex gap-2 mt-1">
                          <input
                            type="text"
                            placeholder="Add your own tag…"
                            value={customTagInput}
                            onChange={(e) => setCustomTagInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAddCustomTag()}
                            maxLength={30}
                            className="flex-1 rounded px-3 py-2 text-[12px] outline-none"
                            style={{
                              background: "var(--void)",
                              border: "1px solid var(--hair2)",
                              color: "var(--lumen-bright)",
                              fontFamily: "inherit",
                            }}
                          />
                          <button
                            onClick={handleAddCustomTag}
                            className="font-mono text-[10px] px-3 py-2 rounded"
                            style={{
                              background: "transparent",
                              border: "1px solid var(--hair2)",
                              color: "var(--muted)",
                              cursor: "pointer",
                              fontFamily: "inherit",
                            }}
                          >
                            + Add
                          </button>
                        </div>
                      )}
                    </div>

                    <Divider />

                    {/* Body */}
                    <div className="flex flex-col gap-3">
                      <FieldLabel>Your Review <span style={{ color: "var(--muted)", fontWeight: 400 }}>— required</span></FieldLabel>
                      <textarea
                        value={body}
                        onChange={(e) => { setBody(e.target.value); setProfanityWarning(false); }}
                        onBlur={handleBodyBlur}
                        placeholder="What would you tell a friend who just registered for this professor?"
                        rows={5}
                        maxLength={2000}
                        className="w-full rounded-lg px-4 py-3 text-[13px] outline-none resize-none leading-relaxed"
                        style={{
                          background: "var(--void)",
                          border: "1px solid var(--hair2)",
                          color: "var(--lumen-bright)",
                          fontFamily: "inherit",
                        }}
                        onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.22)")}
                      />
                      <div className="flex justify-between items-start">
                        <div>
                          {profanityWarning && (
                            <p className="text-[11px] mb-1" style={{ color: "#febc2e" }}>
                              This review contains language that could make it harder to be taken seriously. Words carry weight — yours included.
                            </p>
                          )}
                          <p className="font-mono text-[10px]" style={{ color: "var(--muted)", opacity: 0.6 }}>
                            "Profanity is the common use of uncommon words by common minds."
                          </p>
                        </div>
                        <span className="font-mono text-[10px] flex-shrink-0 ml-3" style={{ color: "var(--muted)" }}>
                          {body.length}/2000
                        </span>
                      </div>
                    </div>

                    {/* Course Feedback (optional) */}
                    <div className="flex flex-col gap-2">
                      <FieldLabel>How did the course go? <span style={{ color: "var(--muted)", fontWeight: 400 }}>— optional</span></FieldLabel>
                      <p className="font-mono text-[10px]" style={{ color: "var(--muted)" }}>
                        Shown in aggregate only — never linked to your review.
                      </p>
                      <select
                        value={gradeReceived}
                        onChange={(e) => setGradeReceived(e.target.value)}
                        style={selectStyle}
                      >
                        <option value="">Prefer not to say</option>
                        {GRADE_OPTIONS.map((g) => (
                          <option key={g.value} value={g.value}>{g.label}</option>
                        ))}
                      </select>
                    </div>

                    {error && (
                      <p className="font-mono text-[11px]" style={{ color: "#ff5f57" }}>{error}</p>
                    )}

                    <button
  onClick={() => {
  if (!courseId || !teachingStyle || wouldRetake === null ||
      strictAtt === null || affectsGrade === null || body.trim().length < 30) {
    setError("Please complete all required fields.");
    return;
  }
  setError(null);
  setChecked(false); // reset checkbox for this attempt's verse
  setStep("conscience");}}
  className="w-full rounded-lg py-3 text-[13px] font-semibold transition-opacity mt-2"
  style={{
    background: "var(--lumen-bright)",
    color: "var(--void)",
    border: "none",
    boxShadow: "var(--rim-inset)",
    cursor: "pointer",
    fontFamily: "inherit",
  }}
>
  Review & submit →
</button>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 3: SUCCESS ── */}
              {step === "success" && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="px-6 py-16 flex flex-col items-center text-center"
                >
                  <div
                    className="w-[1px] h-12 mx-auto mb-8"
                    style={{ background: "linear-gradient(to bottom, transparent, var(--lumen-bright))" }}
                  />
                  <h2
                    className="font-bold tracking-[-0.02em] mb-3"
                    style={{ fontSize: "24px", color: "var(--lumen-bright)" }}
                  >
                    Signal received.
                  </h2>
                  <p className="text-[13px] leading-relaxed mb-8" style={{ color: "var(--fore)" }}>
                    Your review has been submitted. JazakAllah khayran — your words will help someone make a better decision.
                  </p>
                  <div className="horizon-line w-full mb-8" />
                  <button
                    onClick={onSuccess}
                    className="font-mono text-[11px] tracking-widest px-6 py-3 rounded-lg"
                    style={{
                      background: "var(--lumen-bright)",
                      color: "var(--void)",
                      border: "none",
                      boxShadow: "var(--rim-inset)",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    BACK TO REVIEWS ↗
                  </button>
                </motion.div>
              )}

            </AnimatePresence>
          )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Small helpers ────────────────────────────────────────────
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--muted)" }}>
      {children}
    </label>
  );
}

function Divider() {
  return <div className="h-[1px]" style={{ background: "var(--hair)" }} />;
}

const selectStyle: React.CSSProperties = {
  background: "var(--void)",
  border: "1px solid var(--hair2)",
  color: "var(--lumen-bright)",
  borderRadius: "8px",
  padding: "10px 12px",
  fontSize: "13px",
  fontFamily: "inherit",
  outline: "none",
  width: "100%",
};