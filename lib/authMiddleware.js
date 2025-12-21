/**
 * Authentication Middleware
 * Protects routes and extracts user information from JWT token
 * 
 * Usage in API routes:
 * import { authMiddleware } from '../../lib/authMiddleware.js'
 * 
 * export default authMiddleware(async (req, res, user) => {
 *   // user.phone contains authenticated phone number
 * })
 */

import { verifyToken } from './jwt.js'

/**
 * Extract token from cookie or Authorization header
 */
function getTokenFromRequest(req) {
  // Method 1: From HttpOnly cookie
  if (req.cookies && req.cookies.auth_token) {
    return req.cookies.auth_token
  }

  // Method 2: From Authorization header
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7) // Remove 'Bearer ' prefix
  }

  return null
}

/**
 * Middleware wrapper for protected API routes
 * 
 * Example usage:
 * export default authMiddleware(async (req, res, user) => {
 *   // user.phone is the authenticated phone number
 *   // Only authenticated users reach here
 * })
 */
export function authMiddleware(handler) {
  return async (req, res) => {
    try {
      // Get token from request
      const token = getTokenFromRequest(req)

      if (!token) {
        return res.status(401).json({
          error: 'Authentication required. Please login.',
          success: false
        })
      }

      // Verify token
      const verification = verifyToken(token)

      if (!verification.valid) {
        // Clear invalid cookie
        res.setHeader('Set-Cookie', 'auth_token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/')
        
        return res.status(401).json({
          error: verification.message || 'Invalid or expired authentication. Please login again.',
          success: false
        })
      }

      // Attach user info to request
      const user = {
        phone: verification.phone,
        iat: verification.payload.iat
      }

      // Call handler with user context
      return handler(req, res, user)
    } catch (err) {
      console.error('❌ [AUTH] Middleware error:', err)
      return res.status(500).json({
        error: 'Authentication error. Please login again.',
        success: false
      })
    }
  }
}

/**
 * Middleware for Next.js pages (client-side route protection)
 * 
 * Usage in pages:
 * import { withAuth } from '../../lib/authMiddleware.js'
 * 
 * function MyPage() { ... }
 * export default withAuth(MyPage)
 */
export function withAuth(Component) {
  return function ProtectedPage(props) {
    const router = require('next/router').useRouter()
    const [isLoading, setIsLoading] = require('react').useState(true)

    require('react').useEffect(() => {
      // Check if user is logged in
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
      
      if (!token) {
        // Redirect to login
        router.push('/auth/login')
        return
      }

      // Token exists, page is protected
      setIsLoading(false)
    }, [])

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-[var(--petuk-orange)]">Loading...</div>
        </div>
      )
    }

    return <Component {...props} />
  }
}

/**
 * Check if user is authenticated (client-side)
 */
export function isAuthenticated() {
  if (typeof window === 'undefined') return false
  return !!localStorage.getItem('auth_token') || !!document.cookie.includes('auth_token')
}

/**
 * Get authenticated user phone (client-side)
 */
export function getAuthUserPhone() {
  if (typeof window === 'undefined') return null
  
  try {
    // Try to get from localStorage
    const phone = localStorage.getItem('user_phone')
    if (phone) return phone
    
    // If not found, user needs to login again
    return null
  } catch (err) {
    return null
  }
}

/**
 * Logout user (client-side)
 */
export function logout() {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_phone')
    
    // Clear cookie via API call
    fetch('/api/auth/logout', { method: 'POST' }).catch(err => {
      console.log('Logout API call failed:', err)
    })

    window.location.href = '/auth/login'
  } catch (err) {
    console.error('Logout error:', err)
  }
}
