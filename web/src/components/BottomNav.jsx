import { useNavigate, useLocation } from 'react-router-dom'

const NAV_ITEMS = [
  { label: 'Home',    path: '/student',         icon: '⊞' },
  { label: 'Letters', path: '/student/letters', icon: 'Aa' },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'var(--surface)',
        borderTop: '1px solid var(--border-soft)',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '10px 0 16px',
        zIndex: 100,
        boxShadow: '0 -4px 20px rgba(26,23,20,0.06)',
      }}
    >
      {NAV_ITEMS.map(item => {
        const active = location.pathname === item.path
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              background: active ? 'var(--accent-bg)' : 'none',
              border: active ? '1px solid var(--accent)' : '1px solid transparent',
              borderRadius: 'var(--r)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              color: active ? 'var(--accent)' : 'var(--text-3)',
              fontSize: 10,
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontWeight: active ? 700 : 400,
              padding: '8px 16px',
              transition: 'color 0.15s',
            }}
          >
            <span
              style={{
                fontSize: 18,
                fontFamily: item.label === 'Letters' ? "'Fraunces', serif" : 'inherit',
                fontStyle: item.label === 'Letters' ? 'italic' : 'normal',
              }}
            >
              {item.icon}
            </span>
            <span>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
