'use server'

import { createClient } from '@/lib/supabase/server'
import { generateInvitationCode } from '@/utils/invitation-code'
import type { Database } from '@/lib/supabase/types'

type Couple = Database['public']['Tables']['couples']['Row']

const INVITATION_EXPIRY_DAYS = 7

export interface CoupleActionResult {
  success?: boolean
  error?: string
  code?: string
  expiresAt?: string
  coupleId?: string
}

/**
 * Generate a new invitation code for couple linking.
 * Creates a new couples record with status 'pending'.
 * Invitation expires after 7 days.
 */
export async function generateInvite(): Promise<CoupleActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to generate an invitation.' }
  }

  // Check if user already has an active couple
  const { data: existingActive } = await supabase
    .from('couples')
    .select('*')
    .or(`partner_1_id.eq.${user.id},partner_2_id.eq.${user.id}`)
    .eq('status', 'active')
    .maybeSingle()

  if (existingActive) {
    return { error: 'You are already connected with a partner.' }
  }

  // Check for existing pending invitation (as partner_1)
  const { data: existingPending } = await supabase
    .from('couples')
    .select('*')
    .eq('partner_1_id', user.id)
    .eq('status', 'pending')
    .gt('invitation_expires_at', new Date().toISOString())
    .maybeSingle()

  if (existingPending) {
    // Return existing code instead of creating new one
    return {
      code: existingPending.invitation_code,
      expiresAt: existingPending.invitation_expires_at || undefined,
    }
  }

  // Generate new invitation code
  const code = generateInvitationCode()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + INVITATION_EXPIRY_DAYS)

  const { error } = await supabase.from('couples').insert({
    partner_1_id: user.id,
    invitation_code: code,
    invitation_expires_at: expiresAt.toISOString(),
    status: 'pending',
  })

  if (error) {
    console.error('Failed to create invitation:', error)
    return { error: 'Failed to generate invitation. Please try again.' }
  }

  return {
    code,
    expiresAt: expiresAt.toISOString(),
  }
}

/**
 * Accept an invitation code to request a couple link.
 * Sets partner_2_id on the couples record.
 * The link still needs approval from partner_1.
 */
export async function acceptInvite(code: string): Promise<CoupleActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to accept an invitation.' }
  }

  // Find pending invitation with matching code
  const { data: couple, error: findError } = await supabase
    .from('couples')
    .select('*')
    .eq('invitation_code', code.toUpperCase())
    .eq('status', 'pending')
    .gt('invitation_expires_at', new Date().toISOString())
    .maybeSingle()

  if (findError) {
    console.error('Error finding invitation:', findError)
    return { error: 'Failed to validate invitation. Please try again.' }
  }

  if (!couple) {
    return { error: 'Invalid or expired invitation code.' }
  }

  // Can't link to yourself
  if (couple.partner_1_id === user.id) {
    return { error: 'You cannot use your own invitation code.' }
  }

  // Check if already has partner_2 (someone else accepted first)
  if (couple.partner_2_id) {
    return { error: 'This invitation has already been used.' }
  }

  // Check if user is already linked elsewhere
  const { data: existingLink } = await supabase
    .from('couples')
    .select('*')
    .or(`partner_1_id.eq.${user.id},partner_2_id.eq.${user.id}`)
    .eq('status', 'active')
    .maybeSingle()

  if (existingLink) {
    return { error: 'You are already connected with a partner.' }
  }

  // Update with partner_2_id (pending approval from partner_1)
  const { error } = await supabase
    .from('couples')
    .update({ partner_2_id: user.id })
    .eq('id', couple.id)

  if (error) {
    console.error('Failed to accept invitation:', error)
    return { error: 'Failed to accept invitation. Please try again.' }
  }

  return {
    success: true,
    coupleId: couple.id,
  }
}

/**
 * Approve a pending couple link request.
 * Only partner_1_id can call this function.
 * Sets status to 'active'.
 */
export async function approveLink(coupleId: string): Promise<CoupleActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to approve a connection.' }
  }

  // Verify user is partner_1 (only initiator can approve)
  const { data: couple, error: findError } = await supabase
    .from('couples')
    .select('*')
    .eq('id', coupleId)
    .eq('partner_1_id', user.id)
    .maybeSingle()

  if (findError) {
    console.error('Error finding couple:', findError)
    return { error: 'Failed to verify connection. Please try again.' }
  }

  if (!couple) {
    return { error: 'Connection not found or you do not have permission to approve.' }
  }

  if (couple.status !== 'pending') {
    return { error: 'This connection is not pending approval.' }
  }

  if (!couple.partner_2_id) {
    return { error: 'No one has requested to connect yet.' }
  }

  // Update status to active
  const { error } = await supabase
    .from('couples')
    .update({ status: 'active' })
    .eq('id', coupleId)

  if (error) {
    console.error('Failed to approve connection:', error)
    return { error: 'Failed to approve connection. Please try again.' }
  }

  return { success: true }
}

/**
 * Reject a pending couple link request.
 * Only partner_1_id can call this function.
 * Deletes the couple record entirely.
 */
export async function rejectLink(coupleId: string): Promise<CoupleActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to reject a connection.' }
  }

  // Verify user is partner_1 (only initiator can reject)
  const { data: couple, error: findError } = await supabase
    .from('couples')
    .select('*')
    .eq('id', coupleId)
    .eq('partner_1_id', user.id)
    .maybeSingle()

  if (findError) {
    console.error('Error finding couple:', findError)
    return { error: 'Failed to verify connection. Please try again.' }
  }

  if (!couple) {
    return { error: 'Connection not found or you do not have permission to reject.' }
  }

  // Delete the couple record
  const { error } = await supabase.from('couples').delete().eq('id', coupleId)

  if (error) {
    console.error('Failed to reject connection:', error)
    return { error: 'Failed to reject connection. Please try again.' }
  }

  return { success: true }
}

/**
 * Disconnect from current partner.
 * Sets status to 'inactive' (soft delete for audit trail).
 * Either partner can initiate disconnection.
 */
export async function disconnectPartner(): Promise<CoupleActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to disconnect.' }
  }

  // Find active couple record
  const { data: couple, error: findError } = await supabase
    .from('couples')
    .select('*')
    .or(`partner_1_id.eq.${user.id},partner_2_id.eq.${user.id}`)
    .eq('status', 'active')
    .maybeSingle()

  if (findError) {
    console.error('Error finding couple:', findError)
    return { error: 'Failed to find connection. Please try again.' }
  }

  if (!couple) {
    return { error: 'No active connection found.' }
  }

  // Set status to inactive (soft delete)
  const { error } = await supabase
    .from('couples')
    .update({ status: 'inactive' })
    .eq('id', couple.id)

  if (error) {
    console.error('Failed to disconnect:', error)
    return { error: 'Failed to disconnect. Please try again.' }
  }

  return { success: true }
}
