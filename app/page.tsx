"use client";
import { useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CollegeStrip from "@/components/CollegeStrip";
import DeptGrid from "@/components/DeptGrid";
import InstructorWindow from "@/components/InstructorWindow";

export default function Home() {
  const [showColleges, setShowColleges] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState<string | null>(null);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);

  const collegeRef = useRef<HTMLDivElement>(null);
  const deptRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);

  function handleDiveIn() {
    setShowColleges(true);
    setTimeout(() => {
      collegeRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 100);
  }

  function handleCollegeSelect(id: string) {
    setSelectedCollege(id);
    setSelectedDept(null);
    setTimeout(() => {
      deptRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 100);
  }

  function handleDeptSelect(dept: string) {
    setSelectedDept(dept);
    setTimeout(() => {
      windowRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 100);
  }

  return (
    <main
      className="min-h-screen"
      style={{ background: "var(--void)" }}
    >
      {/* Main card container — max width, centered */}
      <div className="mx-auto max-w-5xl" style={{ border: "1px solid var(--hair)" }}>
        <Navbar />

        <HeroSection onDiveIn={handleDiveIn} />

        {/* Horizon line */}
        <div className="horizon-line">
          <div className="horizon-pulse" />
        </div>

        {showColleges && (
          <div ref={collegeRef}>
            <CollegeStrip
              selectedId={selectedCollege}
              onSelect={handleCollegeSelect}
            />
          </div>
        )}

        {selectedCollege && (
          <>
            {/* Horizon line between college and dept */}
            <div className="horizon-line" />
            <div ref={deptRef}>
              <DeptGrid
                key={selectedCollege}
                collegeId={selectedCollege}
                selectedDept={selectedDept}
                onSelect={handleDeptSelect}
              />
            </div>
          </>
        )}

        {selectedCollege && selectedDept && (
          <>
            <div className="horizon-line">
              <div className="horizon-pulse" style={{ animationDelay: "1.2s" }} />
            </div>
            <div ref={windowRef}>
              <InstructorWindow
                key={`${selectedCollege}-${selectedDept}`}
                collegeId={selectedCollege}
                dept={selectedDept}
              />
            </div>
          </>
        )}

        {/* Footer horizon */}
        <div
          className="horizon-line mt-2 mb-6 mx-8"
          style={{ opacity: 0.5 }}
        />
        <p
          className="font-mono text-[10px] text-center pb-6 tracking-widest"
          style={{ color: "var(--muted)" }}
        >
          QU PROF EXPLORER · V 1.0 · FOR STUDENTS, BY STUDENTS
        </p>
      </div>
    </main>
  );
}
