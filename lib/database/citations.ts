import { createClient } from '@/lib/supabase/server'
import type { Citation, CitationType } from '@/lib/supabase/types'

/**
 * Get a single citation by ID
 */
export async function getCitationById(id: string): Promise<Citation | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('citations')
    .select(`
      id,
      type,
      source,
      reference,
      arabic_text,
      translation,
      scholar_verified,
      created_at
    `)
    .eq('id', id)
    .eq('scholar_verified', true)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null
    }
    console.error('Error fetching citation by ID:', error)
    throw new Error(`Failed to fetch citation: ${id}`)
  }

  return data as Citation
}

/**
 * Get multiple citations by IDs (for batch fetching)
 * Returns a map of citation ID to citation for easy lookup
 */
export async function getCitationsForQuestions(
  citationIds: string[]
): Promise<Map<string, Citation>> {
  const citationMap = new Map<string, Citation>()

  if (citationIds.length === 0) return citationMap

  // Filter out null/undefined IDs
  const validIds = citationIds.filter((id): id is string => Boolean(id))
  if (validIds.length === 0) return citationMap

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('citations')
    .select(`
      id,
      type,
      source,
      reference,
      arabic_text,
      translation,
      scholar_verified,
      created_at
    `)
    .in('id', validIds)
    .eq('scholar_verified', true)

  if (error) {
    console.error('Error fetching citations for questions:', error)
    throw new Error('Failed to fetch citations for questions')
  }

  for (const citation of data) {
    citationMap.set(citation.id, citation as Citation)
  }

  return citationMap
}

/**
 * Get all citations of a specific type (quran or hadith)
 */
export async function getCitationsByType(type: CitationType): Promise<Citation[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('citations')
    .select(`
      id,
      type,
      source,
      reference,
      arabic_text,
      translation,
      scholar_verified,
      created_at
    `)
    .eq('type', type)
    .eq('scholar_verified', true)
    .order('source', { ascending: true })
    .order('reference', { ascending: true })

  if (error) {
    console.error('Error fetching citations by type:', error)
    throw new Error(`Failed to fetch citations of type: ${type}`)
  }

  return data as Citation[]
}

/**
 * Get all verified citations
 */
export async function getAllCitations(): Promise<Citation[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('citations')
    .select(`
      id,
      type,
      source,
      reference,
      arabic_text,
      translation,
      scholar_verified,
      created_at
    `)
    .eq('scholar_verified', true)
    .order('type', { ascending: true })
    .order('source', { ascending: true })
    .order('reference', { ascending: true })

  if (error) {
    console.error('Error fetching all citations:', error)
    throw new Error('Failed to fetch all citations')
  }

  return data as Citation[]
}

/**
 * Search citations by source or reference
 */
export async function searchCitations(query: string): Promise<Citation[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('citations')
    .select(`
      id,
      type,
      source,
      reference,
      arabic_text,
      translation,
      scholar_verified,
      created_at
    `)
    .eq('scholar_verified', true)
    .or(`source.ilike.%${query}%,reference.ilike.%${query}%`)
    .order('source', { ascending: true })

  if (error) {
    console.error('Error searching citations:', error)
    throw new Error(`Failed to search citations with query: ${query}`)
  }

  return data as Citation[]
}
