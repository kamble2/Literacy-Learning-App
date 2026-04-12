import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'

const STUDENT_SUFFIX = 'lit!!'
const studentEmail = u => `${u.toLowerCase().trim()}@lit.app`
const studentPass = p => `${p}${STUDENT_SUFFIX}`

const ROLES = ['student', 'parent', 'teacher']

function authError(err) {
  switch (err?.code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect credentials — please try again.'
    case 'auth/email-already-in-use':
      return 'That username is already taken.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment.'
    case 'auth/invalid-email':
      return 'Please enter a valid email address.'
    default:
      return err?.message || 'Something went wrong. Please try again.'
  }
}

const INPUT = {
  width: '100%',
  padding: '11px 14px',
  background: '#FAFAF7',
  border: '1.5px solid var(--border)',
  borderRadius: 'var(--r-sm)',
  fontSize: 14,
  color: 'var(--text)',
  transition: 'border-color 0.15s',
}

const LABEL = {
  fontSize: 11,
  fontWeight: 600,
  color: 'var(--text-2)',
  display: 'block',
  marginBottom: 6,
  letterSpacing: 0.3,
}

const FIELD = { marginBottom: 18 }

export default function Login() {
  const navigate = useNavigate()
  const [role, setRole] = useState('student')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [username, setUsername] = useState('')
  const [pin, setPin] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function resetFields() {
    setError(''); setUsername(''); setPin(''); setDisplayName(''); setName(''); setEmail(''); setPassword('')
  }
  function handleRoleChange(r) { setRole(r); resetFields() }
  function handleModeToggle() { setIsSignUp(v => !v); resetFields() }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (role === 'student') {
      if (!username.trim()) { setError('Please enter a username.'); return }
      if (!/^\d{4}$/.test(pin)) { setError('PIN must be exactly 4 digits.'); return }
      if (isSignUp && !displayName.trim()) { setError('Please enter your name.'); return }
    } else {
      if (!email.trim()) { setError('Please enter an email.'); return }
      if (!password) { setError('Please enter a password.'); return }
      if (isSignUp && !name.trim()) { setError('Please enter your name.'); return }
      if (isSignUp && password.length < 6) { setError('Password must be at least 6 characters.'); return }
    }

    setLoading(true)
    try {
      if (role === 'student') {
        const em = studentEmail(username)
        const pw = studentPass(pin)
        if (isSignUp) {
          const cred = await createUserWithEmailAndPassword(auth, em, pw)
          await setDoc(doc(db, 'users', cred.user.uid), {
            role: 'student', displayName: displayName.trim(), email: em,
            createdAt: new Date(), level: 1, xp: 0, streak: 0,
            lastActive: null, completedModules: [],
          })
          navigate('/student', { replace: true })
        } else {
          const cred = await signInWithEmailAndPassword(auth, em, pw)
          const snap = await getDoc(doc(db, 'users', cred.user.uid))
          if (snap.exists() && snap.data().role !== 'student') {
            setError('This is not a student account.')
            return
          }
          navigate('/student', { replace: true })
        }
      } else {
        if (isSignUp) {
          const cred = await createUserWithEmailAndPassword(auth, email.trim(), password)
          await setDoc(doc(db, 'users', cred.user.uid), {
            role, displayName: name.trim(), email: email.trim(),
            createdAt: new Date(), level: 1, xp: 0, streak: 0,
            lastActive: null, completedModules: [],
          })
        } else {
          await signInWithEmailAndPassword(auth, email.trim(), password)
        }
        navigate(role === 'parent' ? '/parent' : '/teacher', { replace: true })
      }
    } catch (err) {
      setError(authError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        backgroundImage: 'radial-gradient(circle, #C4BFB4 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: 'var(--surface)',
          borderRadius: 'var(--r-xl)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          border: '1px solid var(--border-soft)',
        }}
      >
        {/* Brand header */}
        <div
          style={{
            padding: '36px 36px 28px',
            borderBottom: '1px solid var(--border-soft)',
            background: 'linear-gradient(135deg, #F7F5EF 0%, #FFFFFF 60%)',
          }}
        >
          <div
            className="wordmark"
            style={{ fontSize: 52, color: 'var(--text)', lineHeight: 1, marginBottom: 8 }}
          >
            lit<span style={{ color: 'var(--accent)' }}>.</span>
          </div>
          <div
            style={{
              fontSize: 11,
              color: 'var(--text-3)',
              letterSpacing: 2.5,
              fontFamily: 'DM Mono, monospace',
              textTransform: 'uppercase',
            }}
          >
            Early Literacy
          </div>
        </div>

        <div style={{ padding: '28px 36px 36px' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 20 }}>
            {isSignUp ? 'Create account' : 'Welcome back'}
          </div>

          {/* Role selector */}
          <div
            style={{
              display: 'flex',
              gap: 6,
              marginBottom: 24,
              background: 'var(--surface-2)',
              padding: 4,
              borderRadius: 10,
              border: '1px solid var(--border-soft)',
            }}
          >
            {ROLES.map(r => (
              <button
                key={r}
                onClick={() => handleRoleChange(r)}
                style={{
                  flex: 1,
                  padding: '7px 0',
                  background: role === r ? 'var(--surface)' : 'transparent',
                  color: role === r ? 'var(--accent)' : 'var(--text-3)',
                  border: 'none',
                  borderRadius: 7,
                  fontSize: 12,
                  fontWeight: role === r ? 700 : 400,
                  cursor: 'pointer',
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  boxShadow: role === r ? 'var(--shadow-xs)' : 'none',
                  transition: 'all 0.15s',
                  letterSpacing: 0.2,
                }}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {role === 'student' ? (
              <>
                {isSignUp && (
                  <div style={FIELD}>
                    <label style={LABEL}>Name</label>
                    <input style={INPUT} value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your first name" autoComplete="name" />
                  </div>
                )}
                <div style={FIELD}>
                  <label style={LABEL}>Username</label>
                  <input style={INPUT} value={username} onChange={e => setUsername(e.target.value.replace(/\s/g, ''))} placeholder="username" autoCapitalize="none" spellCheck={false} />
                </div>
                <div style={FIELD}>
                  <label style={LABEL}>4-digit PIN</label>
                  <input
                    style={{ ...INPUT, letterSpacing: 10, fontSize: 22, textAlign: 'center' }}
                    value={pin}
                    onChange={e => { if (/^\d{0,4}$/.test(e.target.value)) setPin(e.target.value) }}
                    maxLength={4}
                    type="password"
                    inputMode="numeric"
                    placeholder="••••"
                    autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  />
                </div>
              </>
            ) : (
              <>
                {isSignUp && (
                  <div style={FIELD}>
                    <label style={LABEL}>Name</label>
                    <input style={INPUT} value={name} onChange={e => setName(e.target.value)} placeholder="Full name" autoComplete="name" />
                  </div>
                )}
                <div style={FIELD}>
                  <label style={LABEL}>Email</label>
                  <input style={INPUT} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" autoComplete="email" />
                </div>
                <div style={FIELD}>
                  <label style={LABEL}>Password</label>
                  <input style={INPUT} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" autoComplete={isSignUp ? 'new-password' : 'current-password'} />
                </div>
              </>
            )}

            {error && (
              <div
                style={{
                  background: 'var(--error-bg)',
                  border: '1px solid #FECACA',
                  borderRadius: 'var(--r-sm)',
                  padding: '10px 14px',
                  fontSize: 13,
                  color: 'var(--error)',
                  marginBottom: 16,
                  lineHeight: 1.4,
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '13px 0',
                background: loading ? 'var(--surface-2)' : 'var(--accent)',
                color: loading ? 'var(--text-3)' : '#FFFFFF',
                border: 'none',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: "'Bricolage Grotesque', sans-serif",
                letterSpacing: 0.2,
                transition: 'background 0.15s, transform 0.1s',
                boxShadow: loading ? 'none' : '0 2px 8px rgba(67,56,202,0.25)',
              }}
              onMouseDown={e => { if (!loading) e.currentTarget.style.transform = 'scale(0.99)' }}
              onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)' }}
            >
              {loading ? 'Loading...' : isSignUp ? 'Create account' : 'Sign in'}
            </button>
          </form>

          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <span style={{ fontSize: 13, color: 'var(--text-3)' }}>
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            </span>
            <button
              onClick={handleModeToggle}
              style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </div>
        </div>
      </div>

      <p style={{ marginTop: 24, fontSize: 11, color: 'var(--text-3)', fontFamily: 'DM Mono, monospace', letterSpacing: 1 }}>
        LIT — EARLY LITERACY
      </p>
    </div>
  )
}
