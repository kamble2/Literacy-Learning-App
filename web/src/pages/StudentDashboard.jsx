import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { doc, onSnapshot } from 'firebase/firestore'
import { signOut } from 'firebase/auth'
import { db, auth } from '../firebase'
import { useAuth } from '../hooks/useAuth'
import XPBar, { getLevel } from '../components/XPBar'
import StreakBadge from '../components/StreakBadge'
import ModuleCard from '../components/ModuleCard'
import BottomNav from '../components/BottomNav'

const MODULES = [
  {
    id: 'letters',
    title: 'Letters',
    description: 'Learn A–Z with guided strokes',
    icon: 'Aa',
    minLevel: 1,
    path: '/student/letters',
  },
  {
    id: 'sounds',
    title: 'Sounds',
    description: 'Identify letter sounds',
    icon: '♩',
    minLevel: 2,
    path: null,
  },
  {
    id: 'words',
    title: 'Words',
    description: 'Build simple CVC words',
    icon: 'ab',
    minLevel: 3,
    path: null,
  },
  {
    id: 'stories',
    title: 'Stories',
    description: 'Read short sentences',
    icon: '—',
    minLevel: 4,
    path: null,
  },
]

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function statusLine(xp = 0) {
  if (xp === 0) return 'Start tracing to earn your first XP.'
  if (xp < 100) return `${100 - xp} XP until Level 2 — keep going!`
  if (xp < 250) return `${250 - xp} XP until Level 3.`
  if (xp < 500) return `${500 - xp} XP until Level 4.`
  return `${xp} XP earned — you're doing great.`
}

export default function StudentDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)

  async function handleSignOut() {
    await signOut(auth)
    navigate('/login', { replace: true })
  }

  useEffect(() => {
    if (!user) return
    const fallback = { displayName: '', xp: 0, streak: 0, level: 1 }
    return onSnapshot(
      doc(db, 'users', user.uid),
      snap => setProfile(snap.exists() ? snap.data() : fallback),
      () => setProfile(fallback)
    )
  }, [user])

  if (!profile) {
    return (
      <div style={{
        minHeight: '100vh', background: 'var(--bg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--text-3)', fontFamily: "'Bricolage Grotesque', sans-serif",
        fontSize: 13, letterSpacing: 1,
      }}>
        Loading...
      </div>
    )
  }

  const xp    = profile.xp || 0
  const level = getLevel(xp)
  const name  = profile.displayName || profile.name || 'Learner'

  return (
    <div style={{
      background: 'var(--bg)',
      minHeight: '100vh',
      color: 'var(--text)',
      fontFamily: "'Bricolage Grotesque', sans-serif",
      paddingBottom: 88,
    }}>
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border-soft)',
        padding: '18px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: 'var(--shadow-xs)',
      }}>
        <div className="wordmark" style={{ fontSize: 24, color: 'var(--text)' }}>
          lit<span style={{ color: 'var(--accent)' }}>.</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{name}</div>
            <div style={{
              display: 'inline-block',
              background: 'var(--accent-bg)',
              color: 'var(--accent-text)',
              fontSize: 10,
              fontWeight: 700,
              padding: '2px 10px',
              borderRadius: 99,
              letterSpacing: 0.5,
            }}>
              Level {level}
            </div>
          </div>
          <button
            onClick={handleSignOut}
            style={{
              background: 'none',
              border: '1.5px solid var(--border)',
              color: 'var(--text-2)',
              borderRadius: 'var(--r-sm)',
              padding: '7px 14px',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: "'Bricolage Grotesque', sans-serif",
            }}
          >
            Sign out
          </button>
        </div>
      </div>

      <div style={{ padding: '28px 20px 0' }}>
        {/* ── Greeting ──────────────────────────────────────────────── */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: 'var(--text-3)', letterSpacing: 2, marginBottom: 4, fontFamily: 'DM Mono, monospace' }}>
            {greeting().toUpperCase()}
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)', lineHeight: 1.1 }}>
            {name}<span style={{ color: 'var(--accent)' }}>.</span>
          </div>
        </div>

        {/* ── XP card ────────────────────────────────────────────────── */}
        <XPBar xp={xp} />

        {/* ── Streak ─────────────────────────────────────────────────── */}
        {(profile.streak || 0) > 0 && (
          <div style={{ marginTop: 12 }}>
            <StreakBadge streak={profile.streak} />
          </div>
        )}

        {/* ── Module grid ────────────────────────────────────────────── */}
        <div style={{ marginTop: 32 }}>
          <div style={{
            fontSize: 11, fontWeight: 700, color: 'var(--text-3)',
            letterSpacing: 2, marginBottom: 14, textTransform: 'uppercase',
            fontFamily: 'DM Mono, monospace',
          }}>
            Modules
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {MODULES.map(mod => (
              <ModuleCard
                key={mod.id}
                id={mod.id}
                title={mod.title}
                description={mod.description}
                icon={mod.icon}
                locked={level < mod.minLevel}
                onClick={() => mod.path && navigate(mod.path)}
              />
            ))}
          </div>
        </div>

        {/* ── Progress card ──────────────────────────────────────────── */}
        <div style={{
          marginTop: 20,
          background: 'var(--surface)',
          border: '1px solid var(--border-soft)',
          borderRadius: 'var(--r)',
          padding: '18px 20px',
          boxShadow: 'var(--shadow-xs)',
        }}>
          <div style={{
            fontSize: 11, fontWeight: 700, color: 'var(--text-3)',
            letterSpacing: 2, marginBottom: 10, textTransform: 'uppercase',
            fontFamily: 'DM Mono, monospace',
          }}>
            Progress
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>
            {statusLine(xp)}
          </div>
          {xp > 0 && (
            <div style={{ display: 'flex', gap: 24, marginTop: 16 }}>
              <div>
                <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--accent)', lineHeight: 1 }}>{xp}</div>
                <div style={{ fontSize: 10, color: 'var(--text-3)', letterSpacing: 1.5, marginTop: 3, fontFamily: 'DM Mono, monospace' }}>TOTAL XP</div>
              </div>
              {(profile.streak || 0) > 0 && (
                <div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--success)', lineHeight: 1 }}>{profile.streak}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-3)', letterSpacing: 1.5, marginTop: 3, fontFamily: 'DM Mono, monospace' }}>DAY STREAK</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
