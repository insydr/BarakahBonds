import { createClient } from '@/lib/supabase/server'
import type {
  Question,
  QuestionWithCitation,
  AssessmentSection
} from '@/lib/supabase/types'

/**
 * Get all active questions for a specific section, ordered by order_index
 * Includes citation data when available
 */
export async function getQuestionsBySection(
  section: AssessmentSection
): Promise<QuestionWithCitation[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('questions')
    .select(`
      id,
      section,
      order_index,
      question_text,
      question_type,
      options,
      citation_id,
      version,
      active,
      scholar_verified,
      created_at,
      updated_at,
      citation:citations (
        id,
        type,
        source,
        reference,
        arabic_text,
        translation,
        scholar_verified,
        created_at
      )
    `)
    .eq('section', section)
    .eq('active', true)
    .eq('scholar_verified', true)
    .order('order_index', { ascending: true })

  if (error) {
    console.error('Error fetching questions by section:', error)
    throw new Error(`Failed to fetch questions for section: ${section}`)
  }

  return data as QuestionWithCitation[]
}

/**
 * Get all active questions across all sections, ordered by section and order_index
 * Includes citation data when available
 */
export async function getAllActiveQuestions(): Promise<QuestionWithCitation[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('questions')
    .select(`
      id,
      section,
      order_index,
      question_text,
      question_type,
      options,
      citation_id,
      version,
      active,
      scholar_verified,
      created_at,
      updated_at,
      citation:citations (
        id,
        type,
        source,
        reference,
        arabic_text,
        translation,
        scholar_verified,
        created_at
      )
    `)
    .eq('active', true)
    .eq('scholar_verified', true)
    .order('section', { ascending: true })
    .order('order_index', { ascending: true })

  if (error) {
    console.error('Error fetching all active questions:', error)
    throw new Error('Failed to fetch all active questions')
  }

  return data as QuestionWithCitation[]
}

/**
 * Get question counts per section
 * Returns an object with section keys and count values
 */
export async function getQuestionCount(): Promise<Record<AssessmentSection, number>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('questions')
    .select('section')
    .eq('active', true)
    .eq('scholar_verified', true)

  if (error) {
    console.error('Error fetching question counts:', error)
    throw new Error('Failed to fetch question counts')
  }

  // Count questions per section
  const counts: Record<AssessmentSection, number> = {
    deen: 0,
    dunya: 0,
    aila: 0,
    nafs: 0
  }

  for (const row of data) {
    counts[row.section as AssessmentSection]++
  }

  return counts
}

/**
 * Get a single question by ID
 */
export async function getQuestionById(id: string): Promise<QuestionWithCitation | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('questions')
    .select(`
      id,
      section,
      order_index,
      question_text,
      question_type,
      options,
      citation_id,
      version,
      active,
      scholar_verified,
      created_at,
      updated_at,
      citation:citations (
        id,
        type,
        source,
        reference,
        arabic_text,
        translation,
        scholar_verified,
        created_at
      )
    `)
    .eq('id', id)
    .eq('active', true)
    .eq('scholar_verified', true)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null
    }
    console.error('Error fetching question by ID:', error)
    throw new Error(`Failed to fetch question: ${id}`)
  }

  return data as QuestionWithCitation
}

/**
 * Get questions by multiple IDs (for batch fetching)
 */
export async function getQuestionsByIds(ids: string[]): Promise<Question[]> {
  if (ids.length === 0) return []

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('questions')
    .select(`
      id,
      section,
      order_index,
      question_text,
      question_type,
      options,
      citation_id,
      version,
      active,
      scholar_verified,
      created_at,
      updated_at
    `)
    .in('id', ids)
    .eq('active', true)
    .eq('scholar_verified', true)

  if (error) {
    console.error('Error fetching questions by IDs:', error)
    throw new Error('Failed to fetch questions by IDs')
  }

  return data as Question[]
}

/**
 * Get total count of all active questions
 */
export async function getTotalQuestionCount(): Promise<number> {
  const supabase = await createClient()

  const { count, error } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true })
    .eq('active', true)
    .eq('scholar_verified', true)

  if (error) {
    console.error('Error fetching total question count:', error)
    throw new Error('Failed to fetch total question count')
  }

  return count ?? 0
}
