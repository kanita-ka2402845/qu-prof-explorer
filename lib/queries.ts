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