import { signOut } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { auth } from '../firebase'
import { useAuth } from '../hooks/useAuth'

export default function TeacherDashboard() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const name = profile?.displayName || 'Teacher'

  async function handleSignOut() {
    await signOut(auth)
    navigate('/login', { replace: true })
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: "'Bricolage Grotesque', sans-serif", color: 'var(--text)' }}>
      <div style={{
        background: 'var(--surface)', borderBottom: '1px solid var(--border-soft)',
        padding: '18px 24px', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', boxShadow: 'var(--shadow-xs)',
      }}>
        <div className="wordmark" style={{ fontSize: 24, color: 'var(--text)' }}>
          lit<span style={{ color: 'var(--accent)' }}>.</span>
        </div>
        <button
          onClick={handleSignOut}
          style={{
            background: 'none', border: '1.5px solid var(--border)', color: 'var(--text-2)',
            borderRadius: 'var(--r-sm)', padding: '7px 16px', fontSize: 12, fontWeight: 600,
            cursor: 'pointer', fontFamily: "'Bricolage Grotesque', sans-serif",
          }}
        >
          Sign out
        </button>
      </div>
      <div style={{ padding: '32px 24px' }}>
        <div style={{ fontSize: 11, color: 'var(--text-3)', letterSpacing: 2, marginBottom: 6, fontFamily: 'DM Mono, monospace' }}>WELCOME BACK</div>
        <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 32 }}>{name}<span style={{ color: 'var(--accent)' }}>.</span></div>
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border-soft)',
          borderRadius: 'var(--r)', padding: '24px', boxShadow: 'var(--shadow-sm)',
          color: 'var(--text-2)', fontSize: 13, lineHeight: 1.8,
        }}>
          Teacher dashboard — coming soon.
        </div>
      </div>
    </div>
  )
}
