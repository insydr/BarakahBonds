/**
 * Generate a secure, random invitation code for couple linking.
 *
 * Format: 8-character alphanumeric, uppercase
 * Character set excludes ambiguous characters: 0, O, I, 1, L
 */

const ALLOWED_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const CODE_LENGTH = 8

/**
 * Generate a cryptographically secure invitation code.
 * Uses Web Crypto API (available in both browser and Node.js 19+).
 *
 * @returns 8-character uppercase alphanumeric string
 */
export function generateInvitationCode(): string {
  const randomValues = new Uint8Array(CODE_LENGTH)

  // Use Web Crypto API for secure random generation
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(randomValues)
  } else {
    // Fallback for older Node.js environments
    // This should not happen in modern Next.js
    throw new Error('Crypto API not available')
  }

  let code = ''
  for (let i = 0; i < CODE_LENGTH; i++) {
    // Use modulo to map random byte to allowed character
    code += ALLOWED_CHARS[randomValues[i] % ALLOWED_CHARS.length]
  }

  return code
}

/**
 * Validate an invitation code format.
 *
 * @param code - The code to validate
 * @returns true if the code matches the expected format
 */
export function isValidInvitationCodeFormat(code: string): boolean {
  if (code.length !== CODE_LENGTH) {
    return false
  }

  // Check that all characters are from the allowed set
  const upperCode = code.toUpperCase()
  for (const char of upperCode) {
    if (!ALLOWED_CHARS.includes(char)) {
      return false
    }
  }

  return true
}
