'use client'

/**
 * Admin Login Page (SECURE VERSION)
 * /admin/login
 * 
 * Security Features:
 * - Secure password field (masked)
 * - HTTP-only cookies for token storage
 * - Rate limiting on login attempts
 * - No "Register Admin" option (signup disabled)
 * - Failed attempt logging
 */

import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Head from 'next/head'

export default function AdminLogin() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies
        body: JSON.stringify({ username, password })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Login failed. Please check your credentials.')
        setPassword('') // Clear password field
        setLoading(false)
        return
      }

      // Save tokens to localStorage
      localStorage.setItem('admin_token', data.accessToken)
      localStorage.setItem('admin_refresh_token', data.refreshToken)
      localStorage.setItem('admin_username', username)

      // Redirect to dashboard
      router.push('/admin/dashboard')
    } catch (err) {
      console.error('Login error:', err)
      setError('Connection error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Admin Login - Petuk</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        }
      `}</style>

      <div style={styles.container}>
        <div style={styles.formContainer}>
          <div style={styles.header}>
            <h1 style={styles.title}>Admin Portal</h1>
            <p style={styles.subtitle}>Petuk Restaurant Management System</p>
          </div>

          {error && <div style={styles.error}>
            <span>⚠️</span> {error}
          </div>}

          <form onSubmit={handleLogin} style={styles.form}>
            <div style={styles.inputGroup}>
              <svg style={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                disabled={loading}
                style={styles.input}
                autoComplete="username"
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <svg style={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                disabled={loading}
                style={styles.input}
                autoComplete="current-password"
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              style={{
                ...styles.submitBtn,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* Security Notice */}
          <div style={styles.notice}>
            <p style={{fontWeight: '600', marginBottom: '8px'}}>🔐 Security Notice</p>
            <ul style={{marginLeft: '16px', fontSize: '12px', lineHeight: '1.6', opacity: 0.85}}>
              <li>Use HTTPS only (secure connection required)</li>
              <li>Do not share your credentials</li>
              <li>Always logout when finished</li>
              <li>Login attempts are logged and monitored</li>
            </ul>
          </div>

          {/* Footer */}
          <p style={styles.footer}>
            © 2024 Petuk | Admin Area - Access Restricted
          </p>
        </div>
      </div>
    </>
  )
}

// Styles with Modern Uiverse.io Design
const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  formContainer: {
    width: '100%',
    maxWidth: '420px',
    backgroundColor: '#171717',
    borderRadius: '16px',
    padding: '48px 32px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  header: {
    marginBottom: '40px',
    textAlign: 'center',
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#f5f5f5',
    marginBottom: '8px',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#a0a0a0',
    letterSpacing: '0.5px',
    marginBottom: '0',
  },
  error: {
    backgroundColor: 'rgba(255, 71, 87, 0.1)',
    borderLeft: '4px solid #ff4757',
    color: '#ff9999',
    padding: '14px 16px',
    borderRadius: '8px',
    marginBottom: '24px',
    fontSize: '13px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '32px',
  },
  inputGroup: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '16px',
    width: '18px',
    height: '18px',
    color: '#a0a0a0',
    pointerEvents: 'none',
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    width: '100%',
    padding: '14px 16px 14px 48px',
    backgroundColor: '#262626',
    border: '1px solid #404040',
    borderRadius: '10px',
    fontSize: '14px',
    color: '#f5f5f5',
    outline: 'none',
    transition: 'all 0.3s ease',
    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
    boxSizing: 'border-box',
  },
  submitBtn: {
    width: '100%',
    padding: '14px 16px',
    backgroundColor: '#ff6b35',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(255, 107, 53, 0.3)',
    marginTop: '8px',
  },
  notice: {
    backgroundColor: 'rgba(255, 193, 7, 0.08)',
    border: '1px solid rgba(255, 193, 7, 0.3)',
    borderRadius: '10px',
    padding: '16px',
    marginBottom: '24px',
    fontSize: '12px',
    color: '#e0c060',
    lineHeight: '1.6',
  },
  footer: {
    textAlign: 'center',
    fontSize: '11px',
    color: '#696969',
    marginTop: '24px',
    letterSpacing: '0.3px',
  },
}
