const THRESHOLDS = [0, 100, 250, 500, 1000]

function getLevelInfo(xp = 0) {
  let level = 1
  for (let i = 1; i < THRESHOLDS.length - 1; i++) {
    if (xp >= THRESHOLDS[i]) level = i + 1
  }
  const start = THRESHOLDS[level - 1]
  const end = THRESHOLDS[level]
  const progress = Math.min(((xp - start) / (end - start)) * 100, 100)
  return { level, progress, current: xp - start, needed: end - start }
}

export function getLevel(xp = 0) {
  return getLevelInfo(xp).level
}

export default function XPBar({ xp = 0 }) {
  const { level, progress, current, needed } = getLevelInfo(xp)

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border-soft)',
        borderRadius: 'var(--r)',
        padding: '16px 20px',
        boxShadow: 'var(--shadow-xs)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Level {level}</span>
          <span style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'DM Mono, monospace' }}>
            → {level < 4 ? `Level ${level + 1}` : 'Max'}
          </span>
        </div>
        <span style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'DM Mono, monospace' }}>
          {current}<span style={{ color: 'var(--border)' }}>/</span>{needed} xp
        </span>
      </div>

      <div
        style={{
          height: 6,
          background: 'var(--surface-2)',
          borderRadius: 99,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            background: 'linear-gradient(90deg, var(--accent), #818CF8)',
            borderRadius: 99,
            transition: 'width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        />
      </div>
    </div>
  )
}
