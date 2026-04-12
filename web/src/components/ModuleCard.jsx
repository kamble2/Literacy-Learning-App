const ACCENT_COLORS = {
  letters: { color: 'var(--mod-letters)', bg: '#EEF2FF', border: '#C7D2FE' },
  sounds:  { color: 'var(--mod-sounds)',  bg: '#FFFBEB', border: '#FDE68A' },
  words:   { color: 'var(--mod-words)',   bg: '#F0FDFA', border: '#99F6E4' },
  stories: { color: 'var(--mod-stories)', bg: '#FFF1F2', border: '#FECDD3' },
}

export default function ModuleCard({ id, title, description, icon, locked, onClick }) {
  const colors = ACCENT_COLORS[id] ?? ACCENT_COLORS.letters

  return (
    <div
      onClick={locked ? undefined : onClick}
      className={locked ? '' : 'card-lift'}
      style={{
        background: locked ? 'var(--surface-2)' : 'var(--surface)',
        border: `1px solid var(--border-soft)`,
        borderTop: locked ? `3px solid var(--border)` : `3px solid ${colors.color}`,
        borderRadius: 'var(--r)',
        padding: '18px 16px',
        cursor: locked ? 'default' : 'pointer',
        boxShadow: locked ? 'none' : 'var(--shadow-sm)',
        opacity: locked ? 0.55 : 1,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 38,
          height: 38,
          borderRadius: 10,
          background: locked ? 'var(--border-soft)' : colors.bg,
          border: `1px solid ${locked ? 'var(--border)' : colors.border}`,
          fontSize: 14,
          fontWeight: 800,
          color: locked ? 'var(--text-3)' : colors.color,
          marginBottom: 14,
          fontFamily: "'Fraunces', serif",
          fontStyle: 'italic',
        }}
      >
        {icon}
      </div>

      <div style={{ fontSize: 13, fontWeight: 700, color: locked ? 'var(--text-3)' : 'var(--text)', marginBottom: 4 }}>
        {title}
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-3)', lineHeight: 1.5 }}>
        {description}
      </div>

      {locked && (
        <div
          style={{
            marginTop: 12,
            display: 'inline-block',
            background: 'var(--border-soft)',
            borderRadius: 99,
            padding: '3px 10px',
            fontSize: 10,
            color: 'var(--text-3)',
            fontWeight: 600,
            letterSpacing: 0.5,
          }}
        >
          Locked
        </div>
      )}
    </div>
  )
}
