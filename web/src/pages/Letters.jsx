import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, addDoc, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../hooks/useAuth'
import LetterTracer from '../components/LetterTracer'

const LETTERS = {
  A: { viewBox: '0 0 200 200', paths: ['M 100 40 L 50 160', 'M 100 40 L 150 160', 'M 75 100 L 125 100'] },
  B: { viewBox: '0 0 200 200', paths: ['M 50 40 L 50 160', 'M 50 40 C 100 40, 100 100, 50 100', 'M 50 100 C 120 100, 120 160, 50 160'] },
  C: { viewBox: '0 0 200 200', paths: ['M 150 60 C 130 30, 70 30, 50 80 C 30 130, 70 170, 150 140'] },
  D: { viewBox: '0 0 200 200', paths: ['M 50 40 L 50 160', 'M 50 40 C 150 40, 150 160, 50 160'] },
  E: { viewBox: '0 0 200 200', paths: ['M 50 40 L 50 160', 'M 50 40 L 150 40', 'M 50 100 L 120 100', 'M 50 160 L 150 160'] },
  F: { viewBox: '0 0 200 200', paths: ['M 50 40 L 50 160', 'M 50 40 L 150 40', 'M 50 100 L 120 100'] },
  G: { viewBox: '0 0 200 200', paths: ['M 150 60 C 130 30, 70 30, 50 80 C 30 130, 70 170, 120 160 L 120 110 L 100 110'] },
  H: { viewBox: '0 0 200 200', paths: ['M 50 40 L 50 160', 'M 150 40 L 150 160', 'M 50 100 L 150 100'] },
  I: { viewBox: '0 0 200 200', paths: ['M 100 40 L 100 160', 'M 60 40 L 140 40', 'M 60 160 L 140 160'] },
  J: { viewBox: '0 0 200 200', paths: ['M 100 40 L 100 140 C 100 180, 50 160, 50 120', 'M 60 40 L 140 40'] },
  K: { viewBox: '0 0 200 200', paths: ['M 50 40 L 50 160', 'M 150 40 L 50 100', 'M 50 100 L 150 160'] },
  L: { viewBox: '0 0 200 200', paths: ['M 70 40 L 70 160', 'M 70 160 L 150 160'] },
  M: { viewBox: '0 0 200 200', paths: ['M 50 160 L 50 40 L 100 100 L 150 40 L 150 160'] },
  N: { viewBox: '0 0 200 200', paths: ['M 50 160 L 50 40', 'M 50 40 L 150 160', 'M 150 160 L 150 40'] },
  O: { viewBox: '0 0 200 200', paths: ['M 100 40 C 40 40, 40 160, 100 160 C 160 160, 160 40, 100 40'] },
  P: { viewBox: '0 0 200 200', paths: ['M 50 40 L 50 160', 'M 50 40 C 120 40, 120 100, 50 100'] },
  Q: { viewBox: '0 0 200 200', paths: ['M 100 40 C 40 40, 40 160, 100 160 C 160 160, 160 40, 100 40', 'M 120 120 L 160 180'] },
  R: { viewBox: '0 0 200 200', paths: ['M 50 40 L 50 160', 'M 50 40 C 120 40, 120 100, 50 100', 'M 50 100 L 150 160'] },
  S: { viewBox: '0 0 200 200', paths: ['M 150 60 C 120 20, 50 20, 50 70 C 50 120, 150 100, 150 140 C 150 190, 70 190, 40 150'] },
  T: { viewBox: '0 0 200 200', paths: ['M 50 40 L 150 40', 'M 100 40 L 100 160'] },
  U: { viewBox: '0 0 200 200', paths: ['M 50 40 L 50 120 C 50 180, 150 180, 150 120 L 150 40'] },
  V: { viewBox: '0 0 200 200', paths: ['M 50 40 L 100 160 L 150 40'] },
  W: { viewBox: '0 0 200 200', paths: ['M 40 40 L 70 160 L 100 80 L 130 160 L 160 40'] },
  X: { viewBox: '0 0 200 200', paths: ['M 50 40 L 150 160', 'M 150 40 L 50 160'] },
  Y: { viewBox: '0 0 200 200', paths: ['M 50 40 L 100 100', 'M 150 40 L 100 100', 'M 100 100 L 100 160'] },
  Z: { viewBox: '0 0 200 200', paths: ['M 50 40 L 150 40 L 50 160 L 150 160'] },
}

const LETTER_KEYS = Object.keys(LETTERS)

export default function Letters() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [selected, setSelected] = useState('A')
  const [completed, setCompleted] = useState(new Set())
  const itsLitAudio = useRef(new Audio('/its-lit.mp3'))

  async function handleLetterComplete(letterKey) {
    if (!user) return
    setCompleted(prev => new Set([...prev, letterKey]))
    itsLitAudio.current.currentTime = 0
    itsLitAudio.current.play().catch(() => {})
    try {
      await addDoc(collection(db, 'progress', user.uid, 'sessions'), {
        module: 'letters', letterOrWord: letterKey, score: 100, timestamp: serverTimestamp(),
      })
      const userRef = doc(db, 'users', user.uid)
      const snap = await getDoc(userRef)
      const data = snap.data() || {}
      const today = new Date().toDateString()
      const lastActive = data.lastActive?.toDate?.()?.toDateString?.() ?? null
      const yesterday = new Date(Date.now() - 86400000).toDateString()
      await updateDoc(userRef, {
        xp: (data.xp || 0) + 10,
        ...(lastActive !== today ? {
          streak: lastActive === yesterday ? (data.streak || 0) + 1 : 1,
          lastActive: new Date(),
        } : {}),
      })
    } catch (e) {
      console.error('Failed to record session:', e)
    }
  }

  const current = LETTERS[selected]

  return (
    <div style={{
      background: 'var(--bg)',
      minHeight: '100vh',
      color: 'var(--text)',
      fontFamily: "'Bricolage Grotesque', sans-serif",
    }}>
      {/* Header */}
      <div style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border-soft)',
        padding: '18px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: 'var(--shadow-xs)',
      }}>
        <button
          onClick={() => navigate('/student')}
          style={{
            background: 'none', border: 'none', color: 'var(--accent)',
            cursor: 'pointer', fontSize: 13, fontWeight: 600,
            fontFamily: "'Bricolage Grotesque', sans-serif",
            display: 'flex', alignItems: 'center', gap: 4, padding: 0,
          }}
        >
          ← Back
        </button>
        <div className="wordmark" style={{ fontSize: 22, color: 'var(--text)' }}>
          lit<span style={{ color: 'var(--accent)' }}>.</span>
        </div>
        <div className="wordmark" style={{ fontSize: 36, color: 'var(--accent)', lineHeight: 1, minWidth: 32, textAlign: 'right' }}>
          {selected}
        </div>
      </div>

      <div style={{ padding: '20px 20px 32px' }}>
        {/* Progress bar */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border-soft)',
          borderRadius: 'var(--r)',
          padding: '12px 16px',
          marginBottom: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: 'var(--shadow-xs)',
        }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>
            {completed.size === 0 ? 'No letters traced yet' : `${completed.size} / 26 letters`}
          </span>
          <div style={{ width: 120, height: 5, background: 'var(--surface-2)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{
              width: `${(completed.size / 26) * 100}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--accent), #818CF8)',
              borderRadius: 99,
              transition: 'width 0.5s ease',
            }} />
          </div>
        </div>

        {/* Letter selector grid */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 24 }}>
          {LETTER_KEYS.map(key => {
            const isSelected = selected === key
            const isDone = completed.has(key)
            return (
              <button
                key={key}
                onClick={() => setSelected(key)}
                style={{
                  width: 34, height: 34,
                  background: isSelected ? 'var(--accent)' : isDone ? 'var(--success-bg)' : 'var(--surface)',
                  color: isSelected ? '#FFFFFF' : isDone ? 'var(--success)' : 'var(--text-2)',
                  border: `1.5px solid ${isSelected ? 'var(--accent)' : isDone ? '#BBF7D0' : 'var(--border)'}`,
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 700,
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  transition: 'all 0.1s',
                  boxShadow: isSelected ? '0 2px 8px rgba(67,56,202,0.25)' : 'none',
                }}
              >
                {key}
              </button>
            )
          })}
        </div>

        {/* Tracer */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <LetterTracer
            key={selected}
            guidePaths={current.paths}
            viewBox={current.viewBox}
            letterKey={selected}
            onLetterComplete={handleLetterComplete}
          />
        </div>

        <p style={{ marginTop: 20, textAlign: 'center', fontSize: 12, color: 'var(--text-3)', fontFamily: 'DM Mono, monospace', letterSpacing: 0.5 }}>
          {completed.has(selected) ? '+10 XP earned' : 'Draw the letter to earn XP'}
        </p>
      </div>
    </div>
  )
}
