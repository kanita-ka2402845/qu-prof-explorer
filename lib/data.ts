export type Instructor = {
  id: string
  full_name: string
  slug: string
  avg_clarity: number
  avg_exam_difficulty: number
  signal_strength: number
  review_count: number
  retake_yes_count: number
  retake_no_count: number
  top_teaching_style: string | null
  courses?: { id: string; code: string; name: string | null }[]
}

export type Department = {
  id: string
  name: string
  slug: string
  instructors?: Instructor[]
}

export type College = {
  id: string
  name: string
  slug: string
  departments?: Department[]
}