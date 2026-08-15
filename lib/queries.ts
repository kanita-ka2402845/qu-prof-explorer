import { supabase } from './supabase'
import type { College, Department, Instructor } from './data'

export async function getColleges(): Promise<College[]> {
  const { data, error } = await supabase
    .from('colleges')
    .select('id, name, slug')
    .order('name')

  if (error) { console.error(error); return [] }
  return data ?? []
}

export async function getUserReviewCount(userId: string): Promise<number> {
  const { count } = await supabase
    .from("reviews")
    .select("*", { count: "exact", head: true })
    .eq("author_id", userId);
  return count ?? 0;
}

export async function getTags(): Promise<{ id: string; label: string }[]> {
  const { data } = await supabase
    .from("tags")
    .select("id, label")
    .eq("is_approved", true)
    .order("label");
  return data ?? [];
}

export async function createCustomTag(label: string): Promise<{ id: string; label: string } | null> {
  const { data } = await supabase
    .from("tags")
    .insert({ label, is_approved: false, is_custom: true })
    .select("id, label")
    .single();
  return data;
}

export type ReviewInsert = {
  instructor_id: string;
  course_id: string;
  author_id: string;
  body: string;
  clarity: number;
  exam_difficulty: number;
  would_retake: boolean;
  attendance_strict: boolean;
  attendance_affects_grade: boolean;
  teaching_style: string;
  grade_received: string | null;
  semester: string;
  semester_year: number;
  conscience_level: number;
  tag_ids: string[];
};

export async function submitReview(review: ReviewInsert): Promise<{ error: string | null }> {
  const { tag_ids, ...reviewData } = review;

  const { data, error } = await supabase
    .from("reviews")
    .insert(reviewData)
    .select("id")
    .single();

  if (error) return { error: error.message };

  if (tag_ids.length > 0) {
    await supabase.from("review_tags").insert(
      tag_ids.map((tag_id) => ({ review_id: data.id, tag_id }))
    );
  }

  return { error: null };
}

export async function getDepartmentsByCollege(collegeSlug: string): Promise<Department[]> {
  const { data, error } = await supabase
    .from('departments')
    .select('id, name, slug, colleges!inner(slug)')
    .eq('colleges.slug', collegeSlug)
    .order('name')

  if (error) { console.error(error); return [] }
  return data ?? []
}

export async function getInstructorsByDepartment(departmentId: string): Promise<Instructor[]> {
  const { data, error } = await supabase
    .from('instructors')
    .select(`
      id, full_name, slug, avg_clarity, avg_exam_difficulty,
      signal_strength, review_count, retake_yes_count, retake_no_count,
      top_teaching_style,
      courses(id, code, name)
    `)
    .eq('department_id', departmentId)
    .eq('is_active', true)
    .order('full_name')

  if (error) { console.error(error); return [] }
  return data ?? []
}

export async function addCourseToInstructor(
  instructorId: string,
  code: string
): Promise<{ id: string; code: string; name: null } | null> {
  const { data } = await supabase
    .from("courses")
    .insert({ instructor_id: instructorId, code: code.trim().toUpperCase(), name: null })
    .select("id, code, name")
    .single();
  return data;
}

export async function toggleHelpfulVote(
  reviewId: string,
  userId: string
): Promise<{ voted: boolean; error: string | null }> {
  const { data: existing } = await supabase
    .from("helpful_votes")
    .select("id")
    .eq("review_id", reviewId)
    .eq("voter_id", userId)
    .single();

  if (existing) {
    await supabase.from("helpful_votes").delete().eq("id", existing.id);
    return { voted: false, error: null };
  } else {
    await supabase.from("helpful_votes").insert({ review_id: reviewId, voter_id: userId });
    return { voted: true, error: null };
  }
}

export async function getUserVotes(userId: string): Promise<string[]> {
  const { data } = await supabase
    .from("helpful_votes")
    .select("review_id")
    .eq("voter_id", userId);
  return data?.map((v) => v.review_id) ?? [];
}