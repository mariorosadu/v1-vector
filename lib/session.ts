/**
 * Generate a unique 5-character session ID
 * Uses timestamp and random characters for uniqueness
 */
export function generateSessionId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Removed ambiguous chars (I, O, 0, 1)
  const timestamp = Date.now().toString(36).slice(-2).toUpperCase() // Last 2 chars of timestamp
  
  // Generate 3 random characters
  let randomPart = ''
  for (let i = 0; i < 3; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return timestamp + randomPart
}

/**
 * Get or create session ID from localStorage
 * Session ID persists for the browser session
 */
export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return ''
  
  const storageKey = 'metacognition_session_id'
  let sessionId = sessionStorage.getItem(storageKey)
  
  if (!sessionId) {
    sessionId = generateSessionId()
    sessionStorage.setItem(storageKey, sessionId)
  }
  
  return sessionId
}
