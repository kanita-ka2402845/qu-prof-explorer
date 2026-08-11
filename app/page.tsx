"use client";
import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CollegeStrip from "@/components/CollegeStrip";
import DeptGrid from "@/components/DeptGrid";
import InstructorWindow from "@/components/InstructorWindow";

type CollegeState = { id: string; slug: string; name: string };
type DeptState    = { id: string; name: string };

function HomeInner() {
  const searchParams = useSearchParams();
  const [showColleges, setShowColleges] = useState(false);
  const [college, setCollege] = useState<CollegeState | null>(null);
  const [dept, setDept]       = useState<DeptState | null>(null);

  const collegeRef = useRef<HTMLDivElement>(null);
  const deptRef    = useRef<HTMLDivElement>(null);
  const windowRef  = useRef<HTMLDivElement>(null);

  // Restore state when returning from reviews page
  useEffect(() => {
    const collegeParam     = searchParams.get("college");
    const deptParam        = searchParams.get("dept");
    const collegeNameParam = searchParams.get("collegeName");
    const deptNameParam    = searchParams.get("deptName");

    if (collegeParam && collegeNameParam) {
      setShowColleges(true);
      setCollege({ id: collegeParam, slug: collegeParam, name: collegeNameParam });
      if (deptParam && deptNameParam) {
        setDept({ id: deptParam, name: deptNameParam });
      }
    }
  }, [searchParams]);

  function handleDiveIn() {
    setShowColleges(true);
    setTimeout(() => collegeRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 100);
  }

  function handleCollegeSelect(id: string, slug: string, name: string) {
    setCollege({ id, slug, name });
    setDept(null);
    setTimeout(() => deptRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 100);
  }

  function handleDeptSelect(id: string, name: string) {
    setDept({ id, name });
    setTimeout(() => windowRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 100);
  }

  return (
    <main className="min-h-screen" style={{ background: "var(--void)" }}>
      <div className="mx-auto max-w-5xl" style={{ border: "1px solid var(--hair)" }}>
        <Navbar />
        <HeroSection onDiveIn={handleDiveIn} />
        <div className="horizon-line"><div className="horizon-pulse" /></div>

        {showColleges && (
          <div ref={collegeRef}>
            <CollegeStrip
              selectedId={college?.id ?? null}
              onSelect={handleCollegeSelect}
            />
          </div>
        )}

        {college && (
          <>
            <div className="horizon-line" />
            <div ref={deptRef}>
              <DeptGrid
                key={college.id}
                collegeSlug={college.slug}
                selectedDeptId={dept?.id ?? null}
                onSelect={handleDeptSelect}
              />
            </div>
          </>
        )}

        {college && dept && (
          <>
            <div className="horizon-line">
              <div className="horizon-pulse" style={{ animationDelay: "1.2s" }} />
            </div>
            <div ref={windowRef}>
              <InstructorWindow
                key={dept.id}
                departmentId={dept.id}
                departmentName={dept.name}
                collegeName={college.name}
                collegeSlug={college.slug}
              />
            </div>
          </>
        )}

        <div className="horizon-line mt-2 mb-6 mx-8" style={{ opacity: 0.5 }} />
        <p className="font-mono text-[10px] text-center pb-6 tracking-widest" style={{ color: "var(--muted)" }}>
          QU PROF EXPLORER · V 1.0 · FOR STUDENTS, BY STUDENTS
        </p>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense>
      <HomeInner />
    </Suspense>
  );
}