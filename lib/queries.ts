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
  .insert({ ...reviewData, is_approved: true })
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

export async function getProfile(userId: string): Promise<{ username: string } | null> {
  const { data } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", userId)
    .single();
  return data;
}

export type AwardId =
  | "first_voice"
  | "precise"
  | "top_10"
  | "top_5"
  | "top_3"
  | "reviews_10"
  | "reviews_15";

export type ProfileFull = {
  id: string;
  username: string;
  qu_email: string;
  review_count: number;
  helpful_votes_received: number;
  contribution_score: number;
  show_on_leaderboard: boolean;
  created_at: string;
  liked_count: number;
    awards: AwardId[];
  rank: number;
};

export type LeaderboardEntry = {
  username: string;
  review_count: number;
  contribution_score: number;
  rank: number;
};

export async function getFullProfile(userId: string): Promise<ProfileFull | null> {
  const [profileRes, likedRes, badgesRes, rankRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
    supabase.from("helpful_votes").select("id", { count: "exact", head: true }).eq("voter_id", userId),
    supabase.from("badges").select("badge_id").eq("user_id", userId),
    supabase.from("profiles").select("id", { count: "exact", head: true }).gt("contribution_score",
      supabase.from("profiles").select("contribution_score").eq("id", userId).single()
    ),
  ]);

  if (profileRes.error || !profileRes.data) return null;

  // rank = number of users with higher score + 1
  const { count: aboveCount } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .gt("contribution_score", profileRes.data.contribution_score);

  return {
    ...profileRes.data,
    liked_count: likedRes.count ?? 0,
   awards: (badgesRes.data ?? []).map((b) => b.badge_id as AwardId),
    rank: (aboveCount ?? 0) + 1,
  };
}

export async function updateUsername(userId: string, username: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("profiles")
    .update({ username })
    .eq("id", userId);
  return { error: error?.message ?? null };
}

export async function toggleLeaderboard(userId: string, show: boolean): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("profiles")
    .update({ show_on_leaderboard: show })
    .eq("id", userId);
  return { error: error?.message ?? null };
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("username, review_count, contribution_score")
    .eq("show_on_leaderboard", true)
    .order("contribution_score", { ascending: false })
    .limit(50);

  if (error || !data) return [];

  return data.map((entry, i) => ({ ...entry, rank: i + 1 }));
}

export async function getUserReviews(userId: string) {
  const { data } = await supabase
    .from("reviews")
    .select(`
      id, body, clarity, exam_difficulty, would_retake,
      semester, semester_year, created_at, helpful_count,
      instructors(id, full_name, slug),
      courses(id, code, name)
    `)
    .eq("author_id", userId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getLikedReviews(userId: string) {
  const { data } = await supabase
    .from("helpful_votes")
    .select(`
      review_id,
      reviews(
        id, body, clarity, exam_difficulty, would_retake,
        semester, semester_year, created_at, helpful_count,
        instructors(id, full_name, slug),
        courses(id, code, name)
      )
    `)
    .eq("voter_id", userId)
    .order("created_at", { ascending: false });
  return (data ?? []).map((v) => v.reviews).filter(Boolean);
}

export async function getHeroStats(): Promise<{
  reviews: number;
  instructors: number;
  colleges: number;
}> {
  const [{ count: reviews }, { count: instructors }, { count: colleges }] =
    await Promise.all([
      supabase.from("reviews").select("*", { count: "exact", head: true }).eq("is_approved", true).eq("is_removed", false),
      supabase.from("instructors").select("*", { count: "exact", head: true }).eq("is_active", true),
      supabase.from("colleges").select("*", { count: "exact", head: true }),
    ]);
  return {
    reviews: reviews ?? 0,
    instructors: instructors ?? 0,
    colleges: colleges ?? 0,
  };
}