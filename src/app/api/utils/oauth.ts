import crypto from 'crypto'

// Generate a random state for OAuth to prevent CSRF attacks
export function generateState() {
  return crypto.randomBytes(32).toString('hex')
}

// Validate the state from cookies against the one from the callback
export function validateState(stateFromCookie: string, stateFromCallback: string) {
  if (!stateFromCookie || !stateFromCallback) {
    return false
  }
  
  // Simple string comparison as a fallback
  return stateFromCookie === stateFromCallback
}

// Parse GitHub repository URL to extract owner and repo name
export function parseGitHubRepoUrl(url: string): { owner: string; repo: string } | null {
  try {
    const urlObj = new URL(url)
    if (urlObj.hostname !== 'github.com') {
      return null
    }
    
    const pathParts = urlObj.pathname.split('/').filter(Boolean)
    if (pathParts.length < 2) {
      return null
    }
    
    return {
      owner: pathParts[0],
      repo: pathParts[1],
    }
  } catch (error) {
    return null
  }
} 