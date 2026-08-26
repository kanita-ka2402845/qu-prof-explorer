"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ReviewMosaic from "@/components/ReviewMosaic";
import InstructorHeader from "@/components/InstructorHeader";
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/components/AuthContext";
import ReviewModal from "@/components/ReviewModal";

export type FullInstructor = {
  id: string;
  full_name: string;
  slug: string;
  avg_clarity: number;
  avg_exam_difficulty: number;
  signal_strength: number;
  review_count: number;
  retake_yes_count: number;
  retake_no_count: number;
  attendance_strict_yes: number;
  attendance_strict_no: number;
  top_teaching_style: string | null;
  grade_flying_colours: number;
  grade_pass_alright: number;
  grade_barely_pass: number;
  grade_retook: number;
  departments: {
    name: string;
    colleges: { name: string };
  };
  courses: { id: string; code: string; name: string | null }[];
};

export type Review = {
  id: string;
  body: string;
  clarity: number;
  exam_difficulty: number;
  would_retake: boolean;
  attendance_strict: boolean;
  attendance_affects_grade: boolean;
  teaching_style: string | null;
  grade_received: string | null;
  semester: string;
  semester_year: number;
  helpful_count: number;
  created_at: string;
  courses: { code: string };
  review_tags: { tags: { label: string } }[];
};

export default function ProfessorPage() {
  const { slug } = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const collegeParam  = searchParams.get("college") ?? "";
  const deptParam     = searchParams.get("dept") ?? "";
  const collegeNameParam = searchParams.get("collegeName") ?? "";
  const deptNameParam    = searchParams.get("deptName") ?? "";

  const [instructor, setInstructor] = useState<FullInstructor | null>(null);
  const [reviews, setReviews]       = useState<Review[]>([]);
  const [loading, setLoading]       = useState(true);

  const { session } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const fetchInstructorAndReviews = useCallback(async () => {
    if (!slug) return;
    
    const { data: inst } = await supabase
      .from("instructors")
      .select(`
        id, full_name, slug, avg_clarity, avg_exam_difficulty,
        signal_strength, review_count, retake_yes_count, retake_no_count,
        attendance_strict_yes, attendance_strict_no, top_teaching_style,
        grade_flying_colours, grade_pass_alright, grade_barely_pass, grade_retook,
        departments(name, colleges(name)),
        courses(id, code, name)
      `)
      .eq("slug", slug)
      .single();

    if (!inst) { setLoading(false); return; }
    setInstructor(inst as unknown as FullInstructor);

    const { data: revs } = await supabase
      .from("reviews")
      .select(`
        id, body, clarity, exam_difficulty, would_retake,
        attendance_strict, attendance_affects_grade, teaching_style,
        grade_received, semester, semester_year, helpful_count, created_at,
        courses(code),
        review_tags(tags(label))
      `)
      .eq("instructor_id", inst.id)
      .eq("is_removed", false)
      .order("helpful_count", { ascending: false });

    setReviews((revs ?? []) as unknown as Review[]);
    setLoading(false);
  }, [slug]);

  useEffect(() => {
    fetchInstructorAndReviews();
  }, [fetchInstructorAndReviews]);

  function handleWriteReview() {
    if (session) {
      setShowReviewModal(true);
    } else {
      setShowAuth(true);
    }
  }

  function handleBack() {
    router.push(
      `/?college=${collegeParam}&dept=${deptParam}&collegeName=${encodeURIComponent(collegeNameParam)}&deptName=${encodeURIComponent(deptNameParam)}`
    );
  }

  if (loading) return (
    <main className="min-h-dvh flex items-center justify-center" style={{ background: "var(--void)" }}>
      <p className="font-mono text-[11px] tracking-widest" style={{ color: "var(--muted)" }}>
        LOADING...
      </p>
    </main>
  );

  if (!instructor) return (
    <main className="min-h-dvh flex items-center justify-center" style={{ background: "var(--void)" }}>
      <p className="font-mono text-[11px] tracking-widest" style={{ color: "var(--muted)" }}>
        INSTRUCTOR NOT FOUND.
      </p>
    </main>
  );

  return (
    <main className="min-h-dvh w-full overflow-x-hidden">
      <div className="mx-auto max-w-5xl w-full" style={{ border: "1px solid var(--hair)" }}>

        {/* Responsive Mobile Header */}
        <div
          className="flex items-center justify-between px-4 sm:px-8 py-4 w-full min-w-0"
          style={{ borderBottom: "1px solid var(--hair)" }}
        >
          <button
            onClick={handleBack}
            className="font-mono text-[11px] tracking-widest transition-colors shrink-0"
            style={{ color: "var(--muted)", background: "transparent", border: "none", cursor: "pointer" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--lumen)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
          >
            ← BACK
          </button>
          
          <span className="font-mono text-[10px] tracking-widest truncate px-2" style={{ color: "var(--muted)" }}>
            QU PROF EXPLORER
          </span>

          {/* Balanced spacer using flexible width */}
          <div className="w-12 sm:w-16 shrink-0" />
        </div>

        <div className="horizon-line"><div className="horizon-pulse" /></div>

        {/* Instructor header + stats */}
        <InstructorHeader instructor={instructor} />

        <div className="horizon-line" />

        {/* Review mosaic */}
        <ReviewMosaic
          reviews={reviews}
          instructorId={instructor.id}
          onWriteReview={handleWriteReview}
        />

        <div className="horizon-line mt-2 mb-6 mx-4 sm:mx-8" style={{ opacity: 0.5 }} />
        <p className="font-mono text-[10px] text-center pb-6 tracking-widest px-4" style={{ color: "var(--muted)" }}>
          QU PROF EXPLORER · V 1.0 · FOR STUDENTS, BY STUDENTS
        </p>
      </div>

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onSuccess={async () => {
            setShowAuth(false);
            await new Promise(r => setTimeout(r, 300));
            setShowReviewModal(true);
          }}
        />
      )}

      {showReviewModal && instructor && (
        <ReviewModal
          instructor={instructor}
          onClose={() => setShowReviewModal(false)}
          onSuccess={() => {
            setShowReviewModal(false);
            // Re-fetch state directly instead of hard browser reload
            fetchInstructorAndReviews();
          }}
        />
      )}
    </main>
  );
}